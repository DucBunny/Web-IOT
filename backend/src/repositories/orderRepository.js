import { Order, OrderItem, Product } from '../models/index.js'

async function createOrder(transaction) {
  return Order.create(
    { total_amount: 0, status: 'pending', created_at: new Date() },
    { transaction }
  )
}

async function findOrderById(id, options = {}) {
  return Order.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product' }]
      }
    ],
    ...options
  })
}

async function listOrders() {
  return Order.findAll({
    include: [
      {
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product' }]
      }
    ]
  })
}

async function findLatestOrderPending() {
  return Order.findOne({
    where: { status: 'pending' },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product' }]
      }
    ]
  })
}

async function findOrderItem(orderId, productId, transaction) {
  return OrderItem.findOne({
    where: { order_id: orderId, product_id: productId },
    transaction
  })
}

async function createOrderItem(payload, transaction) {
  return OrderItem.create(payload, { transaction })
}

async function updateOrderItem(id, updates, transaction) {
  return OrderItem.update(updates, { where: { id }, transaction })
}

async function deleteOrderItem(orderId, productId, transaction) {
  return OrderItem.destroy({
    where: { order_id: orderId, product_id: productId },
    transaction
  })
}

async function recalcTotal(orderId, transaction) {
  const items = await OrderItem.findAll({
    where: { order_id: orderId },
    transaction
  })
  const total = items.reduce((acc, item) => acc + (item.subtotal || 0), 0)
  await Order.update(
    { total_amount: total },
    { where: { id: orderId }, transaction }
  )
  return total
}

async function updateStatusOrder(orderId, status, transaction) {
  if (status === 'paid') {
    return Order.update(
      { status, checkout_at: new Date() },
      { where: { id: orderId }, transaction }
    )
  } else if (status === 'cancelled') {
    return Order.update(
      { status, deleted_at: new Date() },
      { where: { id: orderId }, transaction }
    )
  }
}

export {
  createOrder,
  findOrderById,
  listOrders,
  findLatestOrderPending,
  findOrderItem,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  recalcTotal,
  updateStatusOrder
}
