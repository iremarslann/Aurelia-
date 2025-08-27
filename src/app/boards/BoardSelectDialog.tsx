"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useState } from "react"
import { useGallery } from "@/context/GalleryContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BoardSelectDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (boardId: string) => void
}) {
  const { boards, createBoard } = useGallery()
  const [newBoardName, setNewBoardName] = useState("")

  async function handleCreateBoard() {
    if (!newBoardName.trim()) return
    const boardId = await createBoard(newBoardName.trim())
    setNewBoardName("")
    onSelect(boardId) // select newly created board
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96 z-50 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Add to Board</Dialog.Title>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onSelect(b.id)
                  onClose()
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="New board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
            />
            <Button onClick={handleCreateBoard}>+ Create</Button>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
