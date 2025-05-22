"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { YearbookEntry } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YearbookCarouselProps {
  entries: YearbookEntry[]
}

export function YearbookCarousel({ entries }: YearbookCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const entriesPerPage = 4 // 2x2 grid
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset to first page when entries change (new upload)
  useEffect(() => {
    setCurrentPage(0)

    // Reset the auto-advance timer when new entries are added
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (mounted) {
      startAutoAdvance()
    }
  }, [entries.length])

  // Mark when component is mounted on client
  useEffect(() => {
    setMounted(true)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Start auto-advance timer
  const startAutoAdvance = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 10000)
  }

  // Auto-advance carousel every 10 seconds - only on client
  useEffect(() => {
    if (!mounted || entries.length === 0) return

    startAutoAdvance()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [totalPages, mounted, entries.length])

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)

    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    startAutoAdvance()
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)

    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    startAutoAdvance()
  }

  // Get current entries to display
  const currentEntries = entries.slice(currentPage * entriesPerPage, (currentPage + 1) * entriesPerPage)

  // Fill with empty entries if less than 4
  const displayEntries = [...currentEntries]
  while (displayEntries.length < entriesPerPage) {
    displayEntries.push({
      id: `empty-${displayEntries.length}`,
      image: "",
      quote: "",
      name: "",
      created_at: "",
    })
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        {displayEntries.map((entry) => (
          <Card key={entry.id} className={`overflow-hidden ${!entry.image ? "opacity-0" : ""}`}>
            <CardContent className="p-0 relative aspect-[4/3]">
              {entry.image && (
                <>
                  <Image
                    src={entry.image || "/placeholder.svg"}
                    alt={`Photo of ${entry.name}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-white">
                    <p className="text-sm italic">"{entry.quote}"</p>
                    <p className="text-xs font-bold mt-1">- {entry.name}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="icon"
                className="w-2 h-2 rounded-full p-0"
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
