import { Plus, ScanLine, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getImage } from '../utils/get-image'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useOutletContext } from 'react-router'
import { useTranslation } from 'react-i18next'
import { fetchListProductsAPI } from '../api/products'
import SpiralLoader from '../components/ui/spiral-loader'

export const Home = () => {
  const { t, i18n } = useTranslation()
  const { addToCart } = useOutletContext()
  const [now, setNow] = useState(new Date())
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch products on mount
  useEffect(() => {
    const controller = new AbortController()
    let mounted = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchListProductsAPI({ signal: controller.signal })
        if (mounted) setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to load')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : []
    const q = search.trim().toLowerCase()

    if (!q) return list

    return list.filter((p) => {
      const name = i18n.language === 'vi' ? p.name_vi : p.name_en
      return name?.toLowerCase().includes(q)
    })
  }, [products, search, i18n.language])

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
        <div className="text-2xl font-bold">{t('Order Dashboard')}</div>
        <div>
          {now.getDate().toString().padStart(2, '0')}/
          {(now.getMonth() + 1).toString().padStart(2, '0')}/
          {now.getFullYear().toString()}{' '}
          {now.getHours().toString().padStart(2, '0')}:
          {now.getMinutes().toString().padStart(2, '0')}
        </div>
      </div>

      <div className="absolute top-10 bottom-0 flex w-full flex-col">
        <div className="flex items-center gap-4">
          <Search className="absolute left-2" />
          <input
            id="search-input"
            type="text"
            placeholder={t('Enter product name...')}
            className="w-full rounded-lg border bg-white p-2 ps-10 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button className="cursor-pointer rounded-lg border bg-white p-2 hover:bg-neutral-100">
                    <ScanLine />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('Detect production')}</p>
              </TooltipContent>
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Scan your fruit')}</DialogTitle>
                <DialogDescription>Quét bằng camera cảm biến</DialogDescription>
              </DialogHeader>
              <div className="h-60 w-full rounded-lg border bg-black"></div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="scrollbar-hide mt-4 grid max-h-full grid-cols-2 gap-4 overflow-y-auto py-0.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="col-span-1 flex flex-col justify-between rounded-xl bg-white shadow">
              <img
                src={getImage(product.img_url)}
                alt={product?.[`name_${i18n.language}`]}
                className="w-full rounded-t-xl object-cover"
              />
              <div className="flex items-end justify-between px-3 pb-2">
                <div>
                  <div className="font-semibold">
                    {product?.[`name_${i18n.language}`]}
                  </div>
                  <div className="text-sm">
                    {product.price_per_kg.toLocaleString('vi-VN')} {t('VNĐ')}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    className="bg-custom-primary hover:bg-custom-primary-hover cursor-pointer rounded-md p-2 text-white"
                    onClick={() => addToCart(product)}>
                    <Plus />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('Add to cart')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
