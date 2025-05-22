"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import type { YearbookEntry } from "@/types"
import { gsap } from "gsap"
import { Card, CardContent } from "@/components/ui/card"

interface RealisticPageFlipProps {
  entries: YearbookEntry[][]
  currentPage: number
  onPageChange: (newPage: number) => void
  isFlipping: boolean
  setIsFlipping: (flipping: boolean) => void
  flipDirection: "next" | "prev"
}

export function RealisticPageFlip({
  entries,
  currentPage,
  onPageChange,
  isFlipping,
  setIsFlipping,
  flipDirection,
}: RealisticPageFlipProps) {
  const bookRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadowRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)
  const totalPages = entries.length

  // Initialize page refs
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, totalPages)
    setInitialized(true)
  }, [totalPages])

  // Handle page flipping animation
  useEffect(() => {
    if (!initialized || !isFlipping) return

    const currentPageEl = pageRefs.current[currentPage]
    const targetPage =
      flipDirection === "next" ? (currentPage + 1) % totalPages : (currentPage - 1 + totalPages) % totalPages
    const targetPageEl = pageRefs.current[targetPage]

    if (!currentPageEl || !targetPageEl || !shadowRef.current) return

    // Reset all pages
    pageRefs.current.forEach((page, i) => {
      if (!page) return
      gsap.set(page, {
        zIndex: i === currentPage ? 10 : 0,
        rotationY: i === currentPage ? 0 : 180,
        opacity: i === currentPage ? 1 : 0,
        display: i === currentPage || i === targetPage ? "block" : "none",
      })
    })

    // Set up the target page
    gsap.set(targetPageEl, {
      zIndex: 5,
      rotationY: flipDirection === "next" ? 180 : -180,
      opacity: 1,
      display: "block",
    })

    // Shadow animation
    gsap.set(shadowRef.current, {
      opacity: 0,
      rotationY: 0,
    })

    // Create the page flip timeline
    const tl = gsap.timeline({
      onComplete: () => {
        onPageChange(targetPage)
        setIsFlipping(false)
      },
    })

    // Animate current page flipping away
    tl.to(
      currentPageEl,
      {
        duration: 1.2,
        rotationY: flipDirection === "next" ? -180 : 180,
        ease: "power2.inOut",
        transformOrigin: flipDirection === "next" ? "left center" : "right center",
      },
      0,
    )

    // Animate shadow during flip
    tl.to(
      shadowRef.current,
      {
        duration: 1.2,
        opacity: 0.5,
        rotationY: flipDirection === "next" ? -90 : 90,
        ease: "power2.inOut",
      },
      0,
    )
    tl.to(
      shadowRef.current,
      {
        duration: 0.5,
        opacity: 0,
      },
      0.7,
    )

    // Animate target page flipping in
    tl.to(
      targetPageEl,
      {
        duration: 1.2,
        rotationY: 0,
        ease: "power2.inOut",
        transformOrigin: flipDirection === "next" ? "left center" : "right center",
      },
      0,
    )

    return () => {
      tl.kill()
    }
  }, [isFlipping, currentPage, flipDirection, totalPages, initialized, onPageChange, setIsFlipping])

  // Set up initial page states
  useEffect(() => {
    if (!initialized) return

    pageRefs.current.forEach((page, i) => {
      if (!page) return
      gsap.set(page, {
        rotationY: i === currentPage ? 0 : 180,
        opacity: i === currentPage ? 1 : 0,
        zIndex: i === currentPage ? 10 : 0,
        display: i === currentPage ? "block" : "none",
      })
    })
  }, [initialized, currentPage])

  return (
    <div className="book-container relative w-full aspect-[4/3]" ref={bookRef}>
      {/* Book binding */}

      {/* Shadow overlay for realistic page bend */}
      <div
        ref={shadowRef}
        className="absolute inset-0 bg-black/20 z-15 pointer-events-none"
        style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      ></div>

      {/* Pages */}
      {entries.map((pageEntries, pageIndex) => (
        <div
          key={pageIndex}
          ref={(el) => (pageRefs.current[pageIndex] = el)}
          className="absolute inset-0 grid grid-cols-2 gap-4 page-container overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            perspective: "1000px",
          }}
        >
          {pageEntries.map((entry, entryIndex) => (
            <Card
              key={entry.id || `empty-${pageIndex}-${entryIndex}`}
              className={`overflow-hidden ${!entry.image ? "opacity-0" : ""}`}
            >
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
      ))}
    </div>
  )
}
