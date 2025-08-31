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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"

import { getPalette } from "@/lib/getPalette"

interface BoardImage {
  id: string
  url?: string
  urls?: {
    small?: string
    regular?: string
  }
  alt_description?: string
  createdAt?: any
}

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const [images, setImages] = useState<BoardImage[]>([])
  const [confirmImageId, setConfirmImageId] = useState<string | null>(null)
  const [board, setBoard] = useState<{ name: string; description?: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false)
  const router = useRouter()

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [palette, setPalette] = useState<string[]>([])

  useEffect(() => {
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

    const q = query(
      collection(db, "boards", params.id, "images"),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, async (snap) => {
      const imgs: BoardImage[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BoardImage))
      setImages(imgs)

      if (imgs.length > 0) {
        try {
          const colors = await getPalette(imgs[0].urls?.small || imgs[0].url || "")
          setPalette(colors)
        } catch (err) {
          console.error("Palette generation failed:", err)
        }
      } else {
        setPalette([])
      }
    })

    return () => unsub()
  }, [params.id])

  async function handleSaveEdits() {
    const ref = doc(db, "boards", params.id)
    await updateDoc(ref, {
      name: editName,
      description: editDescription,
    })
    setBoard({ name: editName, description: editDescription })
    setIsEditing(false)
  }

  async function handleDeleteBoard() {
    await deleteDoc(doc(db, "boards", params.id))
    router.push("/boards")
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
          <Button variant="destructive" onClick={() => setDeleteBoardOpen(true)}>
            Delete Board
          </Button>
        </div>
      </div>

      {/* Palette Preview */}
      {palette.length > 0 && (
        <div className="flex gap-2 mb-4">
          {palette.map((color, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg shadow"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Board images */}
      {images.length === 0 ? (
        <p className="text-muted-foreground">No images in this board yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative w-full aspect-square cursor-pointer group"
              onClick={() => setLightboxIndex(idx)}
            >
              <Image
                src={img.urls?.small || img.url || ""}
                alt={img.alt_description || "Saved image"}
                fill
                className="object-cover rounded-lg"
              />
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

      {/* Confirm Remove Image Modal */}
      <Dialog.Root open={!!confirmImageId} onOpenChange={() => setConfirmImageId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Remove Image?</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove this image from your board?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmImageId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirmImageId) {
                      await deleteDoc(doc(db, "boards", params.id, "images", confirmImageId))
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((img) => ({
            src: img.urls?.regular || img.url || "",
            alt: img.alt_description || "Saved image",
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Edit Board Modal */}
      <Dialog.Root open={isEditing} onOpenChange={setIsEditing}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full space-y-4">
              <Dialog.Title className="text-lg font-semibold">Edit Board</Dialog.Title>
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdits}>Save</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Board Modal */}
      <Dialog.Root open={deleteBoardOpen} onOpenChange={setDeleteBoardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full space-y-4">
              <h2 className="text-lg font-semibold">Delete Board?</h2>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the board and all images inside it. This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeleteBoardOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await handleDeleteBoard()
                    setDeleteBoardOpen(false)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

