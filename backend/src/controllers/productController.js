import { Product } from '../models/index.js'
import { StatusCodes } from 'http-status-codes'

async function listProducts(req, res) {
  try {
    const products = await Product.findAll({ order: [['id', 'ASC']] })

    if (!products || products.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'No products found' })
    }

    return res.json(products)
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
}

async function getProduct(req, res) {
  try {
    const id = parseInt(req.params.id)
    const product = await Product.findByPk(id)

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'Product not found' })
    }

    return res.json(product)
  } catch (err) {
    console.error(err)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
}

export const productController = { listProducts, getProduct }
