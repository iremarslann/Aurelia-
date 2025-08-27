"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGallery } from "@/context/GalleryContext"
import { db } from "@/lib/firebase"
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"
import Lightbox from "@/components/ui/Lightbox"

export default function UnsplashSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { curated, boards, addImageToBoard, createBoard } = useGallery()

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Board Dialog
  const [boardDialogOpen, setBoardDialogOpen] = useState(false)
  const [activeImage, setActiveImage] = useState<any | null>(null)

  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null)

  async function fetchImages(newQuery: string, pageNumber: number) {
    if (!newQuery) return
    setLoading(true)

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${newQuery}&page=${pageNumber}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
          },
        }
      )
      const data = await res.json()

      if (pageNumber === 1) {
        setResults(data.results || [])
      } else {
        setResults((prev) => [...prev, ...(data.results || [])])
      }

      setHasMore(data.results && data.results.length > 0)
    } catch (err) {
      console.error("Error fetching Unsplash images:", err)
    } finally {
      setLoading(false)
    }
  }

  function searchUnsplash() {
    setPage(1)
    fetchImages(query, 1)
  }

  // Infinite scroll handler
  const lastImageRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore]
  )

  // Fetch when page changes
  useEffect(() => {
    if (page > 1) fetchImages(query, page)
  }, [page])

  // Always save to collections when adding to a board
  async function saveToCollections(img: any) {
    const ref = doc(db, "curatedImages", img.id)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      const toSave = {
        id: img.id,
        alt_description: img.alt_description || "",
        urls: img.urls,
        user: img.user
          ? { name: img.user.name, username: img.user.username }
          : null,
        links: img.links ?? null,
        source: "unsplash",
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, toSave, { merge: true })
    }
  }

  function openLightbox(index: number) {
    setLightboxIndex(index)
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
            const isCurated = curated.some((i) => i.id === img.id)
            const isLast = index === results.length - 1
            return (
              <div
                key={img.id}
                ref={isLast ? lastImageRef : null}
                className="relative w-full h-48 rounded-lg overflow-hidden border-2 cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={img.urls.small}
                  alt={img.alt_description || "Unsplash Image"}
                  fill
                  className="object-cover"
                />

                {/* Hover Select (opens board dialog) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImage(img)
                    setBoardDialogOpen(true)
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  {isCurated ? "Add to Board" : "Select"}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {loading && <p className="text-center">Loading more images...</p>}

      {/* Lightbox (shared component) */}
      {lightboxIndex !== null && (
        <Lightbox
          images={results.map((img) => ({
            src: img.urls.regular,
            alt: img.alt_description || "Unsplash Image",
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          extraAction={{
            label: "+ Add to Board",
            onClick: () => {
              if (lightboxIndex !== null) {
                setActiveImage(results[lightboxIndex])
                setBoardDialogOpen(true)
              }
            },
          }}
        />
      )}

      {/* Board Selection Dialog */}
      <Dialog open={boardDialogOpen} onOpenChange={setBoardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a board</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {boards.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No boards yet. Create one first!
              </p>
            )}
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={async () => {
                  if (activeImage) {
                    await saveToCollections(activeImage)
                    await addImageToBoard(b.id, activeImage)
                  }
                  setBoardDialogOpen(false)
                }}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Create new board inline */}
          <div className="pt-4 border-t mt-4">
            <Button
              className="w-full"
              onClick={async () => {
                const name = prompt("New board name?")
                if (name && activeImage) {
                  const newBoardId = await createBoard(name)
                  await saveToCollections(activeImage)
                  await addImageToBoard(newBoardId, activeImage)
                  setBoardDialogOpen(false)
                }
              }}
            >
              + Create New Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


