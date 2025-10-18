import api from './axios'

export async function fetchListProductsAPI() {
  const res = await api.get('/products')

  return res.data
}
