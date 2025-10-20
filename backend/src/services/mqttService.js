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

async function findProductByFruitName(name) {
  if (!name) return null
  const lower = name.toLowerCase()
  const products = await Product.findAll({
    attributes: ['id', 'name_en', 'price_per_kg']
  })
  const match = products.find((p) => p.name_en?.toLowerCase() === lower)
  return match || null
}

async function persistDetectAndWeight({ fruitName, weight }) {
  const product = await findProductByFruitName(fruitName)
  if (!product) {
    console.warn(
      '[MQTT Service] persistDetectAndWeight: no product for',
      fruitName
    )
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
    product_id: product.id,
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
  onSubscribed
}) {
  return new Promise((resolve, reject) => {
    let weight = null
    let done = false

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
        if (received?.cmd !== 'data') return
        const data = received.data || {}
        if (data?.result_detect && !fruitName) fruitName = data.result_detect
        if (data?.weight != null && weight == null) weight = Number(data.weight)
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
  fruitName = null,
  messages = [],
  subTopic = process.env.MQTT_TOPIC_SUB || 'esp_to_app',
  pubTopic = process.env.MQTT_TOPIC_PUB || 'app_to_esp',
  ttl_ms = 15000
}) {
  const collected = await collectDetectAndWeight({
    fruitName: fruitName,
    subTopic,
    ttl_ms,
    onSubscribed: () => publishControlMessages(pubTopic, messages)
  })

  try {
    await persistDetectAndWeight(collected)
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
