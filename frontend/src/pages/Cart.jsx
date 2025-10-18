import { Trash2 } from 'lucide-react'
import { getImage } from '../utils/get-image'
import { useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { fetchOrderDetailsAPI } from '../api/orders'
import SpiralLoader from '../components/ui/spiral-loader'

export const Cart = () => {
  const { orderId, ensureCartExists, removeFromCart, checkout } =
    useOutletContext()
  const { t, i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiData, setApiData] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const id = orderId ?? (await ensureCartExists())
        const data = await fetchOrderDetailsAPI(id)
        setApiData(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to load')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => {
      controller.abort()
    }
  }, [ensureCartExists, orderId])

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId)
      const data = await fetchOrderDetailsAPI(orderId)
      setApiData(data)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <SpiralLoader />
      </div>
    )

  if (error)
    return (
      <div className="flex h-full items-center justify-center text-3xl font-bold text-gray-500">
        Error: {error}!
      </div>
    )

  return (
    <div className="relative h-full w-full">
      <div className="absolute -top-2 flex w-full items-center justify-between">
        <div className="text-2xl font-bold">{t('Cart')}</div>
      </div>

      <div className="absolute top-10 bottom-0 w-full">
        <div className="grid h-full grid-cols-3 gap-4">
          <div className="col-span-2 flex h-full min-h-0 flex-col">
            <div className="mb-4 grid h-15 w-full grid-cols-12 items-center rounded-2xl bg-white px-4 shadow">
              <div className="col-span-5 font-bold">{t('Product')}</div>
              <div className="col-span-2 text-center font-bold">
                {t('Unit Price')}
              </div>
              <div className="col-span-2 text-center font-bold">
                {t('Weight')}
              </div>
              <div className="col-span-2 text-center font-bold">
                {t('Subtotal')}
              </div>
            </div>

            <div className="scrollbar-hide overflow-y-auto px-0.5">
              {!apiData.orderItems?.length && (
                <div className="text-center text-lg">
                  {t('Your cart is empty')}
                </div>
              )}

              {apiData.orderItems &&
                apiData.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="mb-4 grid h-20 w-full grid-cols-12 items-center rounded-2xl bg-white px-4 shadow">
                    <img
                      src={getImage(item.product.img_url)}
                      alt={item.product?.[`name_${i18n.language}`]}
                      className="col-span-2 h-20 rounded-xl object-contain"
                    />
                    <div className="col-span-3 text-lg font-semibold">
                      {item.product?.[`name_${i18n.language}`]}
                    </div>

                    <div className="col-span-2 text-center">
                      {' '}
                      {item.price_per_kg_at_purchase.toLocaleString(
                        'vi-VN'
                      )}{' '}
                      {t('VNĐ')}
                    </div>
                    <div className="z-10 col-span-2 space-x-2.5 text-center">
                      <span>{item.quantity_gram} gram</span>
                    </div>
                    <div className="col-span-2 text-center">
                      {item.subtotal.toLocaleString('vi-VN')} {t('VNĐ')}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Trash2
                        onClick={() => handleRemoveFromCart(item.product?.id)}
                        className="size-4 cursor-pointer hover:text-red-500"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="col-span-1 h-fit space-y-4 rounded-2xl bg-white p-4 text-center shadow">
            <div className="text-5xl font-bold">{t('Total')}</div>
            <div className="text-2xl font-semibold">
              {apiData.total_amount?.toLocaleString('vi-VN')} {t('VNĐ')}
            </div>
            <button
              className="w-full cursor-pointer rounded-lg bg-blue-500 p-2 text-lg font-bold text-white hover:bg-blue-600"
              onClick={() => checkout()}>
              {t('Checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
