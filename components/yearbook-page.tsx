"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { YearbookEntry } from "@/types"

interface YearbookPageProps {
  entries: YearbookEntry[]
  isFlipping: boolean
  direction: "next" | "prev"
  isActive: boolean
}

export function YearbookPage({ entries, isFlipping, direction, isActive }: YearbookPageProps) {
  // Fill with empty entries if less than 4
  const displayEntries = [...entries]
  while (displayEntries.length < 4) {
    displayEntries.push({
      id: `empty-${displayEntries.length}`,
      image: "",
      quote: "",
      name: "",
      created_at: "",
    })
  }

  // Determine the animation class based on the flipping state and direction
  let animationClass = ""
  if (isFlipping) {
    animationClass = direction === "next" ? "page-flip-out-right" : "page-flip-out-left"
  } else if (!isActive) {
    animationClass = direction === "next" ? "page-behind" : "page-behind"
  }

  return (
    <div
      className={`absolute inset-0 grid grid-cols-2 gap-4 transition-transform duration-700 ${animationClass}`}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
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
  )
}
