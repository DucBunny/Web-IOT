import { Plus, ScanLine, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import products from '../data/products.json'
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

export const Home = () => {
  const { t, i18n } = useTranslation()
  const { addToCart } = useOutletContext()
  const [now, setNow] = useState(new Date())
  const [search, setSearch] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name[i18n.language]?.toLowerCase().includes(search.toLowerCase())
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

        <div className="scrollbar-hide mt-4 grid max-h-full grid-cols-5 gap-4 overflow-y-auto py-0.5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="col-span-1 flex flex-col justify-between rounded-xl bg-white shadow">
              <img
                src={getImage(product.img)}
                alt={product.name}
                className="w-full rounded-t-xl object-cover"
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <div>
                  <div className="font-semibold">
                    {product.name[i18n.language]}
                  </div>
                  <div className="text-sm">
                    {product.price.toLocaleString('vi-VN')} {t('VNĐ')}
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
