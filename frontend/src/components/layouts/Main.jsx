import { CircleCheckBig } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { toast, Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'

export const Main = () => {
  const { t } = useTranslation()
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id)
      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 280 }
            : item
        )
      } else {
        return [...prev, { ...product, quantity: 280 }]
      }
    })

    /* Show success notification */
    toast.success(t('Product added to cart!'), {
      icon: <CircleCheckBig />,
      duration: 3000,
      position: 'top-center',
      style: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none'
      }
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="fixed top-2 right-2 bottom-2 left-30 rounded-2xl border bg-gray-100 p-4">
      <Toaster />
      <Outlet
        context={{
          cart,
          addToCart,
          removeFromCart
        }}
      />
    </div>
  )
}
