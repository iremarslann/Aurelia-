import { NextRequest, NextResponse } from "next/server";
import { getPalette } from "@/lib/getPalette";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("image");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  try {
    const colors = await getPalette(imageUrl);
    return NextResponse.json({ colors });
  } catch (error) {
    console.error("Palette error:", error);
    return NextResponse.json({ error: "Failed to extract palette" }, { status: 500 });
  }
}
