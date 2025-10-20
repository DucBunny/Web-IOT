import mqtt from 'mqtt'
import 'dotenv/config'

class MqttClient {
  constructor() {
    this.client = null
    this.connected = false
    this.handlers = new Map() // key:topic -> value:Set<fn>
  }

  get url() {
    const host = process.env.MQTT_BROKER || 'localhost'
    const port = process.env.MQTT_PORT || '1883'
    return `mqtt://${host}:${port}`
  }

  connect() {
    if (this.client) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const options = {}
      if (process.env.MQTT_USERNAME)
        options.username = process.env.MQTT_USERNAME
      if (process.env.MQTT_PASSWORD)
        options.password = process.env.MQTT_PASSWORD

      this.client = mqtt.connect(this.url, options)

      this.client.on('connect', () => {
        this.connected = true
        console.log(`[MQTT] Connected to ${this.url}`)
        resolve()
      })

      this.client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting...')
      })

      this.client.on('error', (err) => {
        console.error('[MQTT] Error:', err.message)
      })

      // Route all incoming messages to registered handlers by topic
      this.client.on('message', (topic, payload, packet) => {
        const set = this.handlers.get(topic)
        if (set && set.size) {
          const message = payload?.toString?.() ?? ''
          for (const fn of set) {
            try {
              fn(topic, message, packet)
            } catch (e) {
              console.error('[MQTT] Handler error:', e)
            }
          }
        }
      })
    })
  }

  publish(topic, message, options = {}) {
    if (!this.client || !this.connected) {
      console.warn(
        '[MQTT] publish called before connected; queuing not implemented'
      )
      return
    }
    const payload =
      typeof message === 'string' ? message : JSON.stringify(message)
    this.client.publish(topic, payload, { qos: 0, retain: false, ...options })
  }

  subscribe(topic, handler, options = {}) {
    if (!this.client)
      throw new Error('MQTT client not initialized, call connect() first')

    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set())
    }
    this.handlers.get(topic).add(handler)

    // Request no-local if broker supports it (MQTT v5)
    this.client.subscribe(
      topic,
      { qos: 0, ...options, nl: options.nl ?? true },
      (err) => {
        if (err)
          console.error(`[MQTT] Subscribe error for '${topic}':`, err.message)
      }
    )

    // Return unsubscribe function for this handler
    return () => {
      const set = this.handlers.get(topic)
      if (set) {
        set.delete(handler)
        if (set.size === 0) {
          this.client.unsubscribe(topic, (err) => {
            if (err)
              console.error(
                `[MQTT] Unsubscribe error for '${topic}':`,
                err.message
              )
          })
          this.handlers.delete(topic)
        }
      }
    }
  }
}

const mqttClient = new MqttClient()

export default mqttClient
