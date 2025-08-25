import "@/app/globals.css"
import { Button } from "@/components/ui/button"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r p-4">
            <h1 className="text-xl font-bold mb-4">Curation Tool</h1>
            <nav className="flex flex-col gap-2">
              <Button variant="secondary">Dashboard</Button>
              <Button variant="ghost">Upload</Button>
              <Button variant="ghost">Collections</Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}


