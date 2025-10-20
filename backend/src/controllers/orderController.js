import {
  createOrderService,
  addOrUpdateItemService,
  removeItemService,
  getListOrdersService,
  getOrderService,
  updateStatusOrderService,
  getOrCreatePendingOrderService,
  ServiceError
} from '../services/orderService.js'
import { StatusCodes } from 'http-status-codes'

async function createOrder(req, res) {
  try {
    const order = await createOrderService()
    return res.status(StatusCodes.CREATED).json(order)
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create order' })
  }
}

async function addOrUpdateItem(req, res) {
  try {
    const orderId = req.params.id
    const payload = req.body
    const order = await addOrUpdateItemService(orderId, payload)
    return res.json(order)
  } catch (err) {
    if (err instanceof ServiceError)
      return res.status(err.status).json({ error: err.message })
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to add/update item' })
  }
}

async function removeItem(req, res) {
  try {
    const orderId = req.params.id
    const { productId } = req.params
    const order = await removeItemService(orderId, productId)
    return res.json(order)
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to remove item' })
  }
}

async function getListOrders(req, res) {
  const orders = await getListOrdersService()
  return res.json(orders)
}

async function getOrder(req, res) {
  try {
    const order = await getOrderService(req.params.id)
    return res.json(order)
  } catch (err) {
    if (err instanceof ServiceError)
      return res.status(err.status).json({ error: err.message })
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to get cart' })
  }
}

async function updateStatus(req, res) {
  try {
    const order = await updateStatusOrderService(req.params.id, req.body.status)
    return res.json(order)
  } catch (err) {
    if (err instanceof ServiceError)
      return res.status(err.status).json({ error: err.message })
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update status' })
  }
}

async function getLatestPendingOrder(req, res) {
  try {
    const order = await getOrCreatePendingOrderService()
    return res.status(StatusCodes.OK).json(order)
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to get latest pending order' })
  }
}

export const orderController = {
  createOrder,
  addOrUpdateItem,
  removeItem,
  getListOrders,
  getOrder,
  updateStatus,
  getLatestPendingOrder
}
