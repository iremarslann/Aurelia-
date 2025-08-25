import { Button } from "@/components/ui/button"
import ImageUploader from "@/components/ui/image-uploader"
import UnsplashSearch from "@/components/ui/unsplash-search"

export default function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Search Unsplash</h2>
      <UnsplashSearch />
    </div>
  )
}




