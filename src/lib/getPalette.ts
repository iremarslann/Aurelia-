// src/lib/getPalette.ts
import ColorThief from "color-thief-browser"

export async function getPalette(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve([])
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl

    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        // getPalette returns [[r,g,b], ...]
        const colors = colorThief.getPalette(img, 5)
        const hexColors = colors.map(
          (c) => `#${c.map((x: number) => x.toString(16).padStart(2, "0")).join("")}`
        )
        resolve(hexColors)
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = (err) => reject(err)
  })
}









