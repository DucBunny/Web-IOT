import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router'
import { toast, Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  createOrderAPI,
  addOrUpdateItemAPI,
  updateOrderStatusAPI,
  removeItemAPI,
  fetchOrderDetailsAPI
} from '../../api/orders'

export const Main = () => {
  const { t } = useTranslation()
  const [orderId, setOrderId] = useState(() => {
    const saved = localStorage.getItem('orderId')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('orderId', JSON.stringify(orderId))
  }, [orderId])

  const orderIdRef = useRef(orderId)
  useEffect(() => {
    orderIdRef.current = orderId
  }, [orderId])

  const creatingRef = useRef(null)

  const ensureCartExists = useCallback(async () => {
    if (orderIdRef.current) return orderIdRef.current

    if (!creatingRef.current) {
      creatingRef.current = (async () => {
        const created = await createOrderAPI()
        orderIdRef.current = created.id
        setOrderId(created.id)
        return created.id
      })().finally(() => {
        creatingRef.current = null
      })
    }

    return creatingRef.current
  }, [])

  const addToCart = async (product) => {
    try {
      const orderId = await ensureCartExists()
      await addOrUpdateItemAPI(orderId, {
        product_id: product.id,
        quantity_gram: 100,
        price_per_kg_at_purchase: product.price_per_kg
      })
    } catch (err) {
      console.error(err)
      toast.error(t('Failed to add to cart'))
    }

    toast.success(t('Product added to cart!'))
  }

  const removeFromCart = async (productId) => {
    if (orderId) {
      try {
        await removeItemAPI(orderId, productId)
      } catch (err) {
        console.error(err)
        toast.error(t('Failed to remove item from cart'))
      }
    }
  }

  const checkout = async () => {
    if (!orderId) return

    try {
      let order = await fetchOrderDetailsAPI(orderId)
      if (order.total_amount == 0) {
        toast.error(t('Your cart is empty'))
        return
      }

      await updateOrderStatusAPI(orderId, { status: 'paid' })
      let newOrder = await createOrderAPI()
      setOrderId(newOrder.id)

      toast.success(t('Order placed!'))
    } catch (err) {
      console.error(err)
      toast.error(t('Failed to place order'))
    }
  }

  return (
    <div className="fixed top-2 right-2 bottom-2 left-30 rounded-2xl border bg-gray-100 p-4">
      <Toaster position="top-center" richColors duration={1500} />
      <Outlet
        context={{
          orderId,
          ensureCartExists,
          addToCart,
          removeFromCart,
          checkout
        }}
      />
    </div>
  )
}
