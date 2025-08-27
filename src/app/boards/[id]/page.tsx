"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import Lightbox from "@/components/ui/Lightbox"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const [images, setImages] = useState<any[]>([])
  const [board, setBoard] = useState<{ name: string; description?: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const router = useRouter()

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    // Fetch board info
    const fetchBoard = async () => {
      const snap = await getDoc(doc(db, "boards", params.id))
      if (snap.exists()) {
        const data = snap.data()
        setBoard({
          name: data.name || "Untitled Board",
          description: data.description || "",
        })
        setEditName(data.name || "")
        setEditDescription(data.description || "")
      }
    }
    fetchBoard()

    // Listen for images in this board
    const q = query(
      collection(db, "boards", params.id, "images"),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })

    return () => unsub()
  }, [params.id])

  // Save board edits
  async function handleSaveEdits() {
    const ref = doc(db, "boards", params.id)
    await updateDoc(ref, {
      name: editName,
      description: editDescription,
    })
    setBoard({ name: editName, description: editDescription })
    setIsEditing(false)
  }

  // Delete board
  async function handleDeleteBoard() {
    if (confirm("Are you sure you want to delete this board? This cannot be undone.")) {
      await deleteDoc(doc(db, "boards", params.id))
      router.push("/boards")
    }
  }

  return (
    <div className="space-y-6">
      {/* Board header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{board?.name}</h1>
          {board?.description && (
            <p className="text-muted-foreground mt-1">{board.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Board
          </Button>
          <Button variant="destructive" onClick={handleDeleteBoard}>
            Delete Board
          </Button>
        </div>
      </div>

      {/* Board images */}
      {images.length === 0 ? (
        <p className="text-muted-foreground">No images in this board yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative w-full aspect-square cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              <Image
                src={img.urls?.small || img.url}
                alt={img.alt_description || "Saved image"}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {/* Shared Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
        images={images.map((img) => ({
          src: img.urls?.regular || img.url,
          alt: img.alt_description || "Saved image",
        }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Board name"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Board description"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdits}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}






