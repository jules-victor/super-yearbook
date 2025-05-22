"use server"

import { supabase } from "./supabase"
import { revalidatePath } from "next/cache"
import type { YearbookEntry } from "@/types"

export async function getYearbookEntries(): Promise<YearbookEntry[]> {
  const { data, error } = await supabase.from("yearbook_entries").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching yearbook entries:", error)
    return []
  }

  return data || []
}

export async function uploadYearbookEntry(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const name = formData.get("name") as string
    const quote = formData.get("quote") as string
    const image = formData.get("image") as File

    if (!name || !quote || !image) {
      return { success: false, message: "Missing required fields" }
    }

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}-${image.name || "captured-image.jpg"}`
    const { data: fileData, error: fileError } = await supabase.storage.from("yearbook_images").upload(fileName, image)

    if (fileError) {
      console.error("Error uploading image:", fileError)
      return { success: false, message: "Failed to upload image" }
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage.from("yearbook_images").getPublicUrl(fileName)

    // Insert entry into database
    const { error: dbError } = await supabase.from("yearbook_entries").insert([
      {
        name,
        quote,
        image: urlData.publicUrl,
      },
    ])

    if (dbError) {
      console.error("Error inserting entry:", dbError)
      return { success: false, message: "Failed to save entry" }
    }

    revalidatePath("/")
    return { success: true, message: "Entry added successfully!" }
  } catch (error) {
    console.error("Error in uploadYearbookEntry:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
