"use client"

import { useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import React from "react"

export interface LightboxProps {
  images: { src: string; alt?: string }[]
  index: number
  onClose: () => void
  extraAction?: {
    label: string
    onClick: () => void
  }
}

export default function Lightbox({ images, index, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(index)

  // Update state if parent changes index
  useEffect(() => {
    setCurrentIndex(index)
  }, [index])

  const showPrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
  }

  const showNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length)
  }

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [currentIndex, images.length])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Prev button */}
      <button
        className="absolute left-4 text-white"
        onClick={showPrev}
      >
        <ChevronLeft size={40} />
      </button>

      {/* Image */}
      <div className="max-w-4xl max-h-[80vh] relative">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || "Image"}
          width={1000}
          height={800}
          className="object-contain rounded-lg"
        />
      </div>

      {/* Next button */}
      <button
        className="absolute right-4 text-white"
        onClick={showNext}
      >
        <ChevronRight size={40} />
      </button>
    </div>
  )
}

