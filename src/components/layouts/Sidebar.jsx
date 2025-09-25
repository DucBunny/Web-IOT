import { Home, ShoppingCart } from 'lucide-react'

export const Sidebar = () => {
  const items = [
    { icon: <Home />, path: '/' },
    { icon: <ShoppingCart />, path: '/cart' }
  ]

  return (
    <>
      <div className="fixed top-0 bottom-0 left-0 flex flex-col items-center">
        <div className="mx-2 my-14 flex h-full w-24 flex-col items-center gap-5 rounded-2xl border bg-white pt-5">
          {items.map((item) => (
            <button
              key={item.path}
              className="bg-custom-primary hover:bg-custom-primary-hover flex size-16 cursor-pointer items-center justify-center rounded-lg text-white"
              onClick={() => (window.location.pathname = item.path)}>
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
