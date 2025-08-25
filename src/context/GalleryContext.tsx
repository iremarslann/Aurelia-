"use client"

import { createContext, useContext, useState, ReactNode } from "react"


type ImageType = {
  id: string
  urls: { small: string; regular: string }
  alt_description: string | null
}

type GalleryContextType = {
  curated: ImageType[]
  addImage: (img: ImageType) => void
  removeImage: (id: string) => void
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined)

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [curated, setCurated] = useState<ImageType[]>([])

  const addImage = (img: ImageType) => {
    setCurated((prev) => {
      if (prev.find((i) => i.id === img.id)) return prev // avoid duplicates
      return [...prev, img]
    })
  }

  const removeImage = (id: string) => {
    setCurated((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <GalleryContext.Provider value={{ curated, addImage, removeImage }}>
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  const context = useContext(GalleryContext)
  if (!context) throw new Error("useGallery must be used inside GalleryProvider")
  return context
}
