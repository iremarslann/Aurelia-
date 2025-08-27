"use client"

import { useState } from "react"
import { useGallery } from "@/context/GalleryContext"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function BoardsPage() {
  const { boards, createBoard } = useGallery()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  async function handleCreate() {
    if (!name.trim()) return
    await createBoard(name, description)
    setName("")
    setDescription("")
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Boards</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 text-white">+ New Board</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new board</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {boards.length === 0 ? (
        <p className="text-muted-foreground">No boards yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {boards.map((b) => (
            <Link
              key={b.id}
              href={`/boards/${b.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <h2 className="font-semibold">{b.name}</h2>
              {b.description && (
                <p className="text-sm text-gray-600">{b.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

