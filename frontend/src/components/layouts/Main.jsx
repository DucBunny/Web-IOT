import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { toast, Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  createOrderAPI,
  updateOrderStatusAPI,
  removeItemAPI,
  fetchOrderDetailsAPI,
  fetchLatestPendingOrderAPI
} from '../../api/orders'
import * as mqttAPI from '../../api/mqtt'

export const Main = () => {
  const { t } = useTranslation()
  const [orderId, setOrderId] = useState(() => {
    const saved = localStorage.getItem('orderId')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchLatestPendingOrderAPI()
        if (data?.id) {
          setOrderId(data.id)
          localStorage.setItem('orderId', JSON.stringify(data.id))
        }
      } catch (err) {
        console.error('Failed to fetch latest pending order:', err)
      }
    }
    fetchData()
  }, [orderId])

  const addToCart = async (productId) => {
    try {
      await mqttAPI.publishMqttScale(productId, {
        timeout: import.meta.env.VITE_MQTT_TTL_SCALE + 2000
      })
      toast.success(t('Product added to cart!'))
    } catch (err) {
      console.error(err)
      toast.error(t('Failed to add to cart'))
    }
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

  const detect = async () => {
    try {
      await mqttAPI.publishMqttDetect(
        {},
        {
          timeout: import.meta.env.VITE_MQTT_TTL_DETECT + 2000
        }
      )
      toast.success(t('Product added to cart!'))
    } catch (err) {
      console.error(err)
      toast.error(t('Failed to add to cart'))
    }
  }

  return (
    <div className="fixed top-2 right-2 bottom-2 left-30 rounded-2xl border bg-gray-100 p-4">
      <Toaster position="top-center" richColors duration={1500} />
      <Outlet
        context={{
          orderId,
          // ensureCartExists,
          addToCart,
          removeFromCart,
          checkout,
          detect
        }}
      />
    </div>
  )
}
