import "@/app/globals.css"
import type { Metadata } from "next"
import { GalleryProvider } from "@/context/GalleryContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Designers Image Curation Tool",
  description: "Curate and save Unsplash images",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <GalleryProvider>
          <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r p-4">
              <h1 className="text-xl font-bold mb-4">Curation Tool</h1>
              <nav className="flex flex-col gap-2">
                <Link href="/">
                  <Button variant="secondary" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/collections">
                  <Button variant="ghost" className="w-full justify-start">
                    Collections
                  </Button>
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </GalleryProvider>
      </body>
    </html>
  )
}



