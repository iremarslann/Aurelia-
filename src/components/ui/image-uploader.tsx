"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function ImageUploader() {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    }
  })

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-primary bg-muted" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop the files here…</p>
        ) : (
          <p className="text-muted-foreground">
            Drag & drop some images here, or click to select files
          </p>
        )}
      </div>

      {/* Preview Section */}
      {files.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, i) => (
              <div key={i} className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {files.length > 0 && (
        <Button
          variant="destructive"
          onClick={() => setFiles([])}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
