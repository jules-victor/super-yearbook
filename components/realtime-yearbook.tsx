"use client"

import { useEffect, useState } from "react"
import { YearbookCarousel } from "./yearbook-carousel"
import { YearbookQRCode } from "./qr-code"
import { supabase } from "@/lib/supabase"
import type { YearbookEntry } from "@/types"

interface RealTimeYearbookProps {
  initialEntries: YearbookEntry[]
}

export function RealTimeYearbook({ initialEntries }: RealTimeYearbookProps) {
  const [entries, setEntries] = useState<YearbookEntry[]>(initialEntries)
  const [newEntryAdded, setNewEntryAdded] = useState(false)

  useEffect(() => {
    // Set up real-time subscription to the yearbook_entries table
    const channel = supabase
      .channel("messages")
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
          setNewEntryAdded(true)

          // Hide notification after 5 seconds
          setTimeout(() => {
            setNewEntryAdded(false)
          }, 5000)
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
          <YearbookCarousel entries={entries} />

          {/* New entry notification */}
          {newEntryAdded && (
            <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
              New entry added! 🎉
            </div>
          )}
        </>
      )}

      <YearbookQRCode />
    </div>
  )
}
