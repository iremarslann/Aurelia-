"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function UnsplashSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="space-y-6">
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
          {results.map((img) => (
            <div key={img.id} className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={img.urls.small}
                alt={img.alt_description || "Unsplash Image"}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
