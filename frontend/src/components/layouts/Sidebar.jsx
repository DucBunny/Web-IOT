import { Home, ShoppingCart, History } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const Sidebar = () => {
  const { i18n } = useTranslation()
  const items = [
    { icon: <Home />, path: '/' },
    { icon: <ShoppingCart />, path: '/cart' },
    { icon: <History />, path: '/history' }
  ]

  const handleChangeLanguage = (lng) => {
    localStorage.setItem('savedLng', lng)
    i18n.changeLanguage(lng)
  }

  useEffect(() => {
    const savedLng = localStorage.getItem('savedLng')
    if (savedLng) {
      i18n.changeLanguage(savedLng)
    }
  }, [i18n])

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

          {/* <select
            onChange={handleChangeLanguage}
            value={i18n.language}
            className="mt-auto mb-4 w-16 cursor-pointer rounded-lg border p-1 focus:outline-none">
            <option value="en">en</option>
            <option value="vi">vi</option>
          </select> */}

          <Select onValueChange={handleChangeLanguage} value={i18n.language}>
            <SelectTrigger className="mt-auto mb-4 max-h-8 w-16 cursor-pointer border-gray-300 px-2 text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">en</SelectItem>
              <SelectItem value="vi">vi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
