"use client"

import { useState, useEffect, useRef } from "react"
import type { YearbookEntry } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RealisticPageFlip } from "./realistic-page-flip"
import Script from "next/script"

interface YearbookCarouselProps {
  entries: YearbookEntry[]
}

export function YearbookCarousel({ entries }: YearbookCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next")
  const entriesPerPage = 4 // 2x2 grid
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle changes in entries or total pages
  useEffect(() => {
    // If entries are deleted and current page is now out of bounds, adjust it
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1)
    }
  }, [totalPages, currentPage])

  // Reset to first page when entries change (new upload)
  useEffect(() => {
    // Only reset to first page for new entries, not for deletions
    if (entries.length > 0 && totalPages > 0 && !isFlipping) {
      // Reset the auto-advance timer when entries change
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (mounted) {
        startAutoAdvance()
      }
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
      if (totalPages > 1 && !isFlipping) {
        handleNext()
      }
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
    if (isFlipping || totalPages <= 1) return // Prevent multiple flips at once

    setFlipDirection("prev")
    setIsFlipping(true)

    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Timer will be restarted after animation completes
  }

  const handleNext = () => {
    if (isFlipping || totalPages <= 1) return // Prevent multiple flips at once

    setFlipDirection("next")
    setIsFlipping(true)

    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Timer will be restarted after animation completes
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    startAutoAdvance()
  }

  // Prepare pages data
  const pages = Array.from({ length: totalPages }).map((_, index) => {
    const pageEntries = entries.slice(index * entriesPerPage, (index + 1) * entriesPerPage)

    // Fill with empty entries if less than 4
    const displayEntries = [...pageEntries]
    while (displayEntries.length < entriesPerPage) {
      displayEntries.push({
        id: `empty-${index}-${displayEntries.length}`,
        image: "",
        quote: "",
        name: "",
        created_at: "",
      })
    }

    return displayEntries
  })

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Load GSAP from CDN */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="beforeInteractive" />

      <div className="relative w-full aspect-[4/3] perspective-1000">
        {mounted && pages.length > 0 && (
          <RealisticPageFlip
            entries={pages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isFlipping={isFlipping}
            setIsFlipping={setIsFlipping}
            flipDirection={flipDirection}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 z-50">
          <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full" disabled={isFlipping}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="icon"
                className="w-2 h-2 rounded-full p-0"
                onClick={() => {
                  if (isFlipping) return

                  if (index > currentPage) {
                    setFlipDirection("next")
                  } else if (index < currentPage) {
                    setFlipDirection("prev")
                  } else {
                    return
                  }
                  setIsFlipping(true)
                }}
                disabled={isFlipping}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full" disabled={isFlipping}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
