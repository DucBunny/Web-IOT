import { sequelize, Product } from '../models/index.js'
import { StatusCodes } from 'http-status-codes'
import * as repo from '../repositories/orderRepository.js'

class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ServiceError(StatusCodes.BAD_REQUEST, 'Invalid quantity')
  }
}

async function createOrderService() {
  const t = await sequelize.transaction()
  try {
    const order = await repo.createOrder(t)
    await t.commit()
    return repo.findOrderById(order.id)
  } catch (err) {
    await t.rollback()
    throw err
  }
}

async function getListOrdersService() {
  return repo.listOrders()
}

async function getOrderService(orderId) {
  const order = await repo.findOrderById(orderId)
  if (!order) throw new ServiceError(StatusCodes.NOT_FOUND, 'Order not found')
  return order
}

async function addOrUpdateItemService(
  orderId,
  { product_id, quantity_gram } = {}
) {
  validateQuantity(quantity_gram)
  const t = await sequelize.transaction()
  try {
    const product = await Product.findByPk(product_id, { transaction: t })
    if (!product)
      throw new ServiceError(StatusCodes.NOT_FOUND, `Product not found`)

    // Find existing item
    const existing = await repo.findOrderItem(orderId, product_id, t)

    if (existing) {
      const newQuantity = existing.quantity_gram + quantity_gram
      const price =
        existing.price_per_kg_at_purchase != null
          ? existing.price_per_kg_at_purchase
          : product.price_per_kg
      await repo.updateOrderItem(
        existing.id,
        {
          quantity_gram: newQuantity,
          price_per_kg_at_purchase: price,
          subtotal: (price * newQuantity) / 1000
        },
        t
      )
    } else {
      await repo.createOrderItem(
        {
          order_id: orderId,
          product_id,
          quantity_gram,
          price_per_kg_at_purchase: product.price_per_kg,
          subtotal: (product.price_per_kg * quantity_gram) / 1000
        },
        t
      )
    }

    await repo.recalcTotal(orderId, t)
    await t.commit()
    return repo.findOrderById(orderId)
  } catch (err) {
    await t.rollback()
    if (err instanceof ServiceError) throw err
    throw new ServiceError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to add/update item'
    )
  }
}

async function removeItemService(orderId, productId) {
  const t = await sequelize.transaction()
  try {
    await repo.deleteOrderItem(orderId, productId, t)
    await repo.recalcTotal(orderId, t)
    await t.commit()
    return repo.findOrderById(orderId)
  } catch (err) {
    await t.rollback()
    throw new ServiceError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to remove item'
    )
  }
}

async function updateStatusOrderService(orderId, status) {
  const allowed = ['paid', 'cancelled']
  if (!allowed.includes(status))
    throw new ServiceError(StatusCodes.BAD_REQUEST, 'Invalid status')

  const t = await sequelize.transaction()
  try {
    await repo.updateStatusOrder(orderId, status, t)
    await t.commit()
    return repo.findOrderById(orderId)
  } catch (err) {
    await t.rollback()
    throw new ServiceError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update status'
    )
  }
}

async function getOrCreatePendingOrderService() {
  const existing = await repo.findLatestOrderPending()
  if (existing) return existing
  return createOrderService()
}

export {
  ServiceError,
  createOrderService,
  addOrUpdateItemService,
  removeItemService,
  getListOrdersService,
  getOrderService,
  updateStatusOrderService,
  getOrCreatePendingOrderService
}
