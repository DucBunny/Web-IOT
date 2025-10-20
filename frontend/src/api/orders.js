import api from './axios'

async function createOrderAPI() {
  const res = await api.post('/orders')
  return res.data
}

async function fetchListOrdersAPI() {
  const res = await api.get('/orders')
  return res.data
}

async function fetchOrderDetailsAPI(orderId) {
  const res = await api.get(`/orders/${orderId}`)
  return res.data
}

async function addOrUpdateItemAPI(orderId, itemData) {
  const res = await api.post(`/orders/${orderId}/items`, itemData)
  return res.data
}

async function removeItemAPI(orderId, productId) {
  const res = await api.delete(`/orders/${orderId}/items/${productId}`)
  return res.data
}

async function updateOrderStatusAPI(orderId, statusData) {
  const res = await api.patch(`/orders/${orderId}/status`, statusData)
  return res.data
}

async function fetchLatestPendingOrderAPI() {
  const res = await api.get('/orders/pending/latest')
  return res.data
}

export {
  createOrderAPI,
  fetchListOrdersAPI,
  fetchOrderDetailsAPI,
  addOrUpdateItemAPI,
  removeItemAPI,
  updateOrderStatusAPI,
  fetchLatestPendingOrderAPI
}
