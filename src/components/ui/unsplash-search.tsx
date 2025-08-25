"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useGallery } from "@/context/GalleryContext"

export default function UnsplashSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const { curated, addImage, removeImage } = useGallery()

  // For lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxImages, setLightboxImages] = useState<any[]>([])

  async function searchUnsplash() {
    if (!query) return
    setLoading(true)

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
          },
        }
      )
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Error fetching Unsplash images:", err)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelectImage(img: any) {
    if (curated.find((i) => i.id === img.id)) {
      removeImage(img.id)
    } else {
      addImage(img)
    }
  }

  function openLightbox(index: number, images: any[]) {
    setLightboxImages(images)
    setLightboxIndex(index)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  function showPrev() {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
      )
    }
  }

  function showNext() {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search Unsplash..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
        />
        <Button onClick={searchUnsplash} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((img, index) => {
            const isSelected = curated.some((i) => i.id === img.id)
            return (
              <div
                key={img.id}
                className={`relative w-full h-48 rounded-lg overflow-hidden border-2 cursor-pointer ${
                  isSelected ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => openLightbox(index, results)}
              >
                <Image
                  src={img.urls.small}
                  alt={img.alt_description || "Unsplash Image"}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelectImage(img)
                    }}
                  >
                    {isSelected ? "Remove" : "Select"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog.Root open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            {lightboxIndex !== null && (
              <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
                <Image
                  src={lightboxImages[lightboxIndex].urls.regular}
                  alt={
                    lightboxImages[lightboxIndex].alt_description || "Image"
                  }
                  fill
                  className="object-contain"
                />

                {/* Close */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-8 right-4 bg-black/60 p-2 rounded-full text-white"
                >
                  <X size={24} />
                </button>

                {/* Left */}
                <button
                  onClick={showPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                >
                  <ChevronLeft size={32} />
                </button>

                {/* Right */}
                <button
                  onClick={showNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
