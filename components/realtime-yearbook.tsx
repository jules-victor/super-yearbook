"use client"

import { useEffect, useState } from "react"
import { YearbookCarousel } from "./yearbook-carousel"
import { YearbookQRCode } from "./qr-code"
import { supabase } from "@/lib/supabase-browser"
import type { YearbookEntry } from "@/types"
import { Trash } from "lucide-react"

interface RealTimeYearbookProps {
  initialEntries: YearbookEntry[]
}

export function RealTimeYearbook({ initialEntries }: RealTimeYearbookProps) {
  const [entries, setEntries] = useState<YearbookEntry[]>(initialEntries)
  const [notification, setNotification] = useState<{ message: string; type: "add" | "delete" } | null>(null)

  useEffect(() => {
    // Set up real-time subscription to the yearbook_entries table
    const channel = supabase
      .channel("yearbook_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "yearbook_entries",
        },
        (payload) => {
          console.log("New entry added:", payload.new)

          // Add the new entry to the state
          setEntries((currentEntries) => [payload.new as YearbookEntry, ...currentEntries])

          // Show notification
          setNotification({ message: "New entry added! 🎉", type: "add" })

          // Hide notification after 5 seconds
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "yearbook_entries",
        },
        (payload) => {
          console.log("Entry deleted:", payload.old)

          // Remove the deleted entry from the state
          setEntries((currentEntries) =>
            currentEntries.filter((entry) => entry.id !== (payload.old as YearbookEntry).id),
          )

          // Show notification
          setNotification({ message: "Entry removed", type: "delete" })

          // Hide notification after 5 seconds
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "yearbook_entries",
        },
        (payload) => {
          console.log("Entry updated:", payload.new)

          // Update the entry in the state
          setEntries((currentEntries) =>
            currentEntries.map((entry) =>
              entry.id === (payload.new as YearbookEntry).id ? (payload.new as YearbookEntry) : entry,
            ),
          )
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {entries.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-white">
          <h2 className="text-2xl font-semibold mb-4">No entries yet!</h2>
          <p className="text-gray-600">Scan the QR code in the bottom right corner to add the first yearbook entry.</p>
        </div>
      ) : (
        <>
          <div className="relative">
            {/* Book cover effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-800 to-amber-700 rounded-lg shadow-xl -z-10"></div>

            {/* Yearbook title on the cover */}
            <div className="absolute top-0 left-0 right-0 text-center text-white text-xl font-bold py-2 -mt-12">
              Class of 2025
            </div>

            <YearbookCarousel entries={entries} />
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-bounce ${
                notification.type === "add" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
              }`}
            >
              {notification.type === "delete" && <Trash className="inline-block mr-2 h-4 w-4" />}
              {notification.message}
            </div>
          )}
        </>
      )}

      <YearbookQRCode />
    </div>
  )
}
