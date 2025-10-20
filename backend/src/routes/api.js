import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productController } from '../controllers/productController.js'
import { orderController } from '../controllers/orderController.js'
import { mqttController } from '../controllers/mqttController.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API is running'
  })
})

// Products
router.get('/products', productController.listProducts)
router.get('/products/:id', productController.getProduct)

// Orders
router.post('/orders', orderController.createOrder)
router.get('/orders', orderController.getListOrders)
router.get('/orders/:id', orderController.getOrder)
router.post('/orders/:id/items', orderController.addOrUpdateItem)
router.delete('/orders/:id/items/:productId', orderController.removeItem)
router.patch('/orders/:id/status', orderController.updateStatus)
router.get('/orders/pending/latest', orderController.getLatestPendingOrder)

// Mqtt
router.post('/mqtt/detect', mqttController.publishDetect)
router.post('/mqtt/scale', mqttController.publishScale)

export default router
