import { Product } from '../models/index.js'
import {
  addOrUpdateItemService,
  getOrCreatePendingOrderService
} from './orderService.js'
import mqttClient from '../mqtt/index.js'
import { StatusCodes } from 'http-status-codes'

class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Persist using either fruit_id or fruit_name (name_en) + weight (kg)
async function persistDetectAndWeight({ fruit_id, fruit_name, weight }) {
  let product = null

  if (fruit_id != null) {
    product = await Product.findByPk(fruit_id)
    if (!product) {
      console.warn(
        '[MQTT Service] persistDetectAndWeight: no product for id',
        fruit_id
      )
      return
    }
  } else if (fruit_name) {
    const name = String(fruit_name).trim()
    // Prefer exact match, fallback to case-insensitive
    product =
      (await Product.findOne({ where: { name_en: name } })) ||
      (await Product.findOne({
        where: Product.sequelize.where(
          Product.sequelize.fn('LOWER', Product.sequelize.col('name_en')),
          String(name).toLowerCase()
        )
      }))

    if (!product) {
      console.warn(
        '[MQTT Service] persistDetectAndWeight: no product for name',
        fruit_name
      )
      return
    }
    fruit_id = product.id
  } else {
    console.warn('[MQTT Service] persistDetectAndWeight: no fruit reference')
    return
  }

  const order = await getOrCreatePendingOrderService()
  const grams = Math.round(Number(weight) * 1000)
  if (!Number.isFinite(grams) || grams <= 0) {
    console.warn(
      '[MQTT Service] persistDetectAndWeight: invalid weight',
      weight
    )
    return
  }

  await addOrUpdateItemService(order.id, {
    product_id: fruit_id,
    quantity_gram: grams
  })
}

// Publish an array of control messages to a topic
function publishControlMessages(pubTopic, messages) {
  try {
    for (const msg of messages) {
      mqttClient.publish(pubTopic, msg)
    }
  } catch (err) {
    throw new ServiceError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to publish control messages'
    )
  }
}

// Subscribe and collect detect + weight (in any order) until both available or timeout
function collectDetectAndWeight({
  fruitName = null,
  subTopic,
  ttl_ms,
  onSubscribed,
  onFruitDetected
}) {
  return new Promise((resolve, reject) => {
    let weight = null
    let done = false
    let calledOnFruit = false

    const cleanup = (unsub, timer) => {
      if (done) return
      done = true
      try {
        unsub && unsub()
      } catch {}
      if (timer) clearTimeout(timer)
    }

    const handler = (_t, message) => {
      if (done) return
      try {
        const received = JSON.parse(message.toString())
        const cmd = received?.cmd

        if (cmd === 'data') {
          const data = received.data || {}
          if (data?.result_detect && !fruitName) {
            fruitName = data.result_detect
          }
          if (data?.weight != null && weight == null)
            weight = Number(data.weight)
        } else if (cmd === 'inference') {
          // Handle debug/inference detect response with predictions
          const preds = received?.data?.predictions
          if (Array.isArray(preds) && preds.length) {
            const top = preds.reduce((a, b) => (a.value >= b.value ? a : b))
            if (top?.label && !fruitName) fruitName = top.label
          }
        } else {
          return // ignore other cmds
        }

        // If fruitName just determined and we haven't published scale yet
        if (fruitName && !calledOnFruit) {
          calledOnFruit = true
          try {
            onFruitDetected && onFruitDetected(fruitName)
          } catch (e) {
            console.error('[MQTT Service] onFruitDetected error:', e)
          }
        }

        if (fruitName && weight != null) {
          cleanup(unsubscribe, timer)
          return resolve({ fruitName, weight })
        }
      } catch (err) {
        console.error('[MQTT Service] collect error: ', err)
        cleanup(unsubscribe, timer)
        return reject(
          new ServiceError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'MQTT processing error'
          )
        )
      }
    }

    const unsubscribe = mqttClient.subscribe(subTopic, handler)

    // Publish only after subscription is active
    try {
      onSubscribed && onSubscribed()
    } catch (e) {
      console.error('[MQTT Service] publish error after subscribe:', e)
      cleanup(unsubscribe)
      return reject(
        new ServiceError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to publish control messages'
        )
      )
    }

    const timer = setTimeout(() => {
      console.warn('[MQTT Service] subscribeOneShot timeout')
      cleanup(unsubscribe)
      reject(
        new ServiceError(
          StatusCodes.REQUEST_TIMEOUT,
          'MQTT subscribeOneShot timeout'
        )
      )
    }, ttl_ms)
  })
}

async function subscribeOneShot({
  fruit_id = null,
  messages = [],
  subTopic = process.env.MQTT_TOPIC_SUB || 'esp_to_app',
  pubTopic = process.env.MQTT_TOPIC_PUB || 'app_to_esp',
  ttl_ms = 15000
}) {
  // Normalize messages by type for detect-first flow
  const detectMsg = messages.find(
    (m) =>
      m?.cmd === 'detect' ||
      (m?.cmd === 'control' && m?.type === 'start_detect')
  )
  const scaleMsg = messages.find(
    (m) => m?.cmd === 'control' && m?.type === 'start_scale'
  )

  // If fruit_id is provided (manual scale), resolve fruit name from DB and publish immediately
  if (fruit_id != null && scaleMsg && !detectMsg) {
    const fruit = await Product.findByPk(fruit_id, {
      attributes: ['name_en']
    })
    const fruitName = fruit?.name_en || null

    const collected = await collectDetectAndWeight({
      fruitName,
      subTopic,
      ttl_ms,
      onSubscribed: () => publishControlMessages(pubTopic, [scaleMsg])
    })

    try {
      await persistDetectAndWeight({
        fruit_id,
        fruit_name: fruitName,
        weight: collected.weight
      })
    } catch (e) {
      console.error('[MQTT Service] persist error:', e)
      throw new ServiceError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to persist detect and weight'
      )
    }

    return collected
  }

  // Detect-first flow: publish detect, wait for fruit name, then publish scale with fruit_name
  const collected = await collectDetectAndWeight({
    fruitName: null,
    subTopic,
    ttl_ms,
    onSubscribed: () => {
      if (detectMsg) publishControlMessages(pubTopic, [detectMsg])
      else if (scaleMsg) publishControlMessages(pubTopic, [scaleMsg]) // fallback
    },
    onFruitDetected: (detectedName) => {
      if (!scaleMsg) return
      const scaleWithFruit = { ...scaleMsg, fruit_name: detectedName }
      publishControlMessages(pubTopic, [scaleWithFruit])
    }
  })

  try {
    await persistDetectAndWeight({
      fruit_name: collected.fruitName,
      weight: collected.weight
    })
  } catch (e) {
    console.error('[MQTT Service] persist error:', e)
    throw new ServiceError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to persist detect and weight'
    )
  }

  return collected
}

export { ServiceError, subscribeOneShot }
