import { ServiceError, subscribeOneShot } from '../services/mqttService.js'
import { Product } from '../models/index.js'
import { StatusCodes } from 'http-status-codes'
import 'dotenv/config'

const messages = [
  {
    id: 'app',
    dst: 'ESP32_2',
    cmd: 'control',
    type: 'start_detect'
  },
  {
    id: 'app',
    dst: 'ESP32_3',
    cmd: 'control',
    type: 'start_scale'
  }
]

async function publishDetect(req, res) {
  try {
    const received = await subscribeOneShot({
      messages: messages,
      ttl_ms: Number(process.env.MQTT_TTL_DETECT || 30000)
    })

    return res.status(StatusCodes.OK).json({ received: received })
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to publish detect command' })
  }
}

async function publishScale(req, res) {
  try {
    const { product_id } = req.body || {}
    if (!product_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'product_id is required' })
    }
    const product = await Product.findByPk(Number(product_id), {
      attributes: ['name_en']
    })

    messages[1].fruit_name = product?.name_en

    const received = await subscribeOneShot({
      fruitName: product?.name_en,
      messages: [messages[1]],
      ttl_ms: Number(process.env.MQTT_TTL_SCALE || 15000)
    })

    messages[1].fruit_name = null

    return res.status(StatusCodes.OK).json({ received: received, product_id })
  } catch (err) {
    if (err instanceof ServiceError)
      return res.status(err.status).json({ error: err.message })
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to publish scale command' })
  }
}

export const mqttController = {
  publishDetect,
  publishScale
}
