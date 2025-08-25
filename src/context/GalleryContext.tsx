"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, setDoc, deleteDoc, doc } from "firebase/firestore"

type GalleryContextType = {
  curated: any[]
  addImage: (img: any) => Promise<void>
  removeImage: (id: string) => Promise<void>
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined)

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [curated, setCurated] = useState<any[]>([])

  useEffect(() => {
    const q = query(collection(db, "curatedImages"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setCurated(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  async function addImage(img: any) {
    // Avoid duplicates by always setting the doc with the image.id as key
    const ref = doc(db, "curatedImages", img.id)
    await setDoc(ref, { ...img, createdAt: Date.now() })
  }

  async function removeImage(id: string) {
    const ref = doc(db, "curatedImages", id)
    await deleteDoc(ref)
  }

  return (
    <GalleryContext.Provider value={{ curated, addImage, removeImage }}>
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error("useGallery must be used within a GalleryProvider")
  return ctx
}


