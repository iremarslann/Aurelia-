"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"

type Board = {
  id: string
  name: string
  description?: string
}

type GalleryContextType = {
  curated: any[]
  boards: Board[]
  addImage: (img: any) => Promise<void>
  removeImage: (id: string) => Promise<void>
  createBoard: (name: string, description?: string) => Promise<string>
  deleteBoard: (boardId: string) => Promise<void>
  addImageToBoard: (boardId: string, image: any) => Promise<void>
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined)

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [curated, setCurated] = useState<any[]>([])
  const [boards, setBoards] = useState<Board[]>([])

  // --- Listen for curated images
  useEffect(() => {
    const q = query(collection(db, "curatedImages"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setCurated(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // --- Listen for boards
  useEffect(() => {
    const q = query(collection(db, "boards"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setBoards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Board)))
    })
    return () => unsub()
  }, [])

  // --- Curated image actions
  async function addImage(img: any) {
    const ref = doc(db, "curatedImages", img.id) // avoid duplicates
    await setDoc(ref, { ...img, createdAt: serverTimestamp() })
  }

  async function removeImage(id: string) {
    const ref = doc(db, "curatedImages", id)
    await deleteDoc(ref)
  }

  // --- Board actions
  async function createBoard(name: string, description?: string) {
    const docRef = await addDoc(collection(db, "boards"), {
      name,
      description,
      createdAt: serverTimestamp(),
    })
    return docRef.id // return id so we can use it immediately
  }

  async function deleteBoard(boardId: string) {
    await deleteDoc(doc(db, "boards", boardId))
  }

  async function addImageToBoard(boardId: string, image: any) {
    // always save image to collections too
    await addImage(image)

    // then save inside board subcollection
    await setDoc(doc(db, "boards", boardId, "images", image.id), {
      ...image,
      createdAt: serverTimestamp(),
    })
  }

  return (
    <GalleryContext.Provider
      value={{
        curated,
        boards,
        addImage,
        removeImage,
        createBoard,
        deleteBoard,
        addImageToBoard,
      }}
    >
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error("useGallery must be used within a GalleryProvider")
  return ctx
}

