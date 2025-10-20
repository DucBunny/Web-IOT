import api from './axios'

async function publishMqttDetect(payload = {}, config = {}) {
  const res = await api.post('/mqtt/detect', payload, { ...config })
  return res.data
}

async function publishMqttScale(product_id, config = {}) {
  const res = await api.post('/mqtt/scale', { product_id }, { ...config })
  return res.data
}

export { publishMqttDetect, publishMqttScale }
