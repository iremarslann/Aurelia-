"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useGallery } from "@/context/GalleryContext"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CollectionsPage() {
  const { curated, removeImage } = useGallery()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [confirmImageId, setConfirmImageId] = useState<string | null>(null)

  function openLightbox(index: number) {
    setLightboxIndex(index)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  function showPrev() {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + curated.length) % curated.length)
    }
  }

  function showNext() {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % curated.length)
    }
  }

  // 🔑 Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") closeLightbox()
        if (e.key === "ArrowLeft") showPrev()
        if (e.key === "ArrowRight") showNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex]) // re-bind when lightboxIndex changes

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Collections</h1>

      {curated.length === 0 ? (
        <p className="text-muted-foreground">No images curated yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {curated.map((img, index) => (
            <div
              key={img.id}
              className="group relative w-full h-48 rounded-lg overflow-hidden cursor-pointer"
            >
              <Image
                src={img.urls.small}
                alt={img.alt_description || "Curated Image"}
                fill
                className="object-cover"
                onClick={() => openLightbox(index)}
              />

              {/* Hover Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmImageId(img.id)
                }}
                className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Remove Modal */}
      <Dialog.Root open={!!confirmImageId} onOpenChange={() => setConfirmImageId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Remove Image?</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove this image from your collection?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmImageId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmImageId) {
                      removeImage(confirmImageId)
                    }
                    setConfirmImageId(null)
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Lightbox Modal */}
      <Dialog.Root open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            {lightboxIndex !== null && (
              <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
                <Image
                  src={curated[lightboxIndex].urls.regular}
                  alt={curated[lightboxIndex].alt_description || "Curated Image"}
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



