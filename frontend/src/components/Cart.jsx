import { Trash2 } from 'lucide-react'
import { getImage } from '../utils/get-image'
import { useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'

export const Cart = () => {
  const { cart, removeFromCart } = useOutletContext()
  const { t, i18n } = useTranslation()

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity * 0.001,
    0
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
              {!cart.length && (
                <div className="text-center text-lg">
                  {t('Your cart is empty')}
                </div>
              )}

              {cart &&
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="mb-4 grid h-20 w-full grid-cols-12 items-center rounded-2xl bg-white px-4 shadow">
                    <img
                      src={getImage(item.img)}
                      alt={item.name[i18n.language]}
                      className="col-span-2 h-20 rounded-xl object-contain"
                    />
                    <div className="col-span-3 text-lg font-semibold">
                      {item.name[i18n.language]}
                    </div>
                    <div className="col-span-2 text-center">
                      {' '}
                      {item.price.toLocaleString('vi-VN')} {t('VNĐ')}
                    </div>
                    <div className="z-10 col-span-2 space-x-2.5 text-center">
                      <span>{item.quantity} gram</span>
                    </div>
                    <div className="col-span-2 text-center">
                      {(item.price * item.quantity * 0.001).toLocaleString(
                        'vi-VN'
                      )}{' '}
                      {t('VNĐ')}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Trash2
                        onClick={() => removeFromCart(item.id)}
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
              {total.toLocaleString('vi-VN')} {t('VNĐ')}
            </div>
            <button className="w-full cursor-pointer rounded-lg bg-blue-500 p-2 text-lg font-bold text-white hover:bg-blue-600">
              {t('Checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
