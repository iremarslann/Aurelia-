"use client"

import Image from "next/image"
import { useState } from "react"
import { useGallery } from "@/context/GalleryContext"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { deleteDoc, doc } from "firebase/firestore"
import Lightbox from "@/components/ui/Lightbox"

export default function CollectionsPage() {
  const { curated } = useGallery()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [confirmImageId, setConfirmImageId] = useState<string | null>(null)

  function openLightbox(index: number) {
    setLightboxIndex(index)
  }

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
      <Dialog.Root
        open={!!confirmImageId}
        onOpenChange={() => setConfirmImageId(null)}
      >
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
                  onClick={async () => {
                    if (confirmImageId) {
                      await deleteDoc(doc(db, "curatedImages", confirmImageId))
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

      {/* Lightbox (shared component) */}
      {lightboxIndex !== null && (
        <Lightbox
          images={curated.map((img) => ({
            src: img.urls.regular,
            alt: img.alt_description || "Curated Image",
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

