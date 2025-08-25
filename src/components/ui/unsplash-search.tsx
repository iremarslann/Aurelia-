"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useGallery } from "@/context/GalleryContext"
import { db } from "@/lib/firebase"
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"

export default function UnsplashSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [writingIds, setWritingIds] = useState<Set<string>>(new Set())

  const { curated } = useGallery()

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const imagesForLightbox = results

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

  async function toggleSelectImage(img: any) {
    if (writingIds.has(img.id)) return
    setWritingIds((prev) => new Set(prev).add(img.id))

    try {
      const ref = doc(db, "curatedImages", img.id)
      const snapshot = await getDoc(ref)

      if (snapshot.exists()) {
        // Remove
        await deleteDoc(ref)
      } else {
        // Save
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
    } finally {
      setWritingIds((prev) => {
        const next = new Set(prev)
        next.delete(img.id)
        return next
      })
    }
  }

  function openLightbox(index: number) {
    setLightboxIndex(index)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  function showPrev() {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + imagesForLightbox.length) %
          imagesForLightbox.length
      )
    }
  }

  function showNext() {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % imagesForLightbox.length)
    }
  }

  // Keyboard navigation
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
  }, [lightboxIndex])

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
                className={`relative w-full h-48 rounded-lg overflow-hidden border-2 cursor-pointer group ${
                  isCurated ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={img.urls.small}
                  alt={img.alt_description || "Unsplash Image"}
                  fill
                  className="object-cover"
                />
                {/* Hover Select/Remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelectImage(img)
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  {isCurated ? "Remove" : "Select"}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {loading && <p className="text-center">Loading more images...</p>}

      {/* Lightbox */}
      <Dialog.Root open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            {lightboxIndex !== null && (
              <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
                <Image
                  src={imagesForLightbox[lightboxIndex].urls.regular}
                  alt={
                    imagesForLightbox[lightboxIndex].alt_description || "Image"
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

