"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import type { YearbookEntry } from "@/types"

interface ScatteredPolaroidMarqueeProps {
  entries: YearbookEntry[]
}

// Array of possible rotation values for the polaroids
const ROTATIONS = ["-8deg", "-5deg", "-3deg", "-1deg", "0deg", "1deg", "3deg", "5deg", "8deg"]

// Array of possible tape colors
const TAPE_COLORS = ["bg-yellow-300", "bg-green-300", "bg-purple-300", "bg-pink-300", "bg-blue-300"]

export default function ScatteredPolaroidMarquee({ entries }: ScatteredPolaroidMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 })

  // Generate random positions for each polaroid across the entire screen
  const generateRandomPositions = (count: number, screenWidth: number, screenHeight: number) => {
    const positions = []
    const polaroidWidth = 180
    const polaroidHeight = 250

    for (let i = 0; i < count; i++) {
      // Random Y position across the entire screen height
      const y = Math.random() * (screenHeight - polaroidHeight)

      // Spread polaroids across a wider area for better distribution
      const x = (i * (screenWidth * 1.5)) / count + Math.random() * 200 - 100

      positions.push({ x, y })
    }

    return positions
  }

  // Function to get a random item from an array
  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Function to determine if a polaroid should have tape
  const shouldHaveTape = () => Math.random() > 0.4

  // Function to get random tape position
  const getTapePosition = () => {
    const positions = ["top-0 left-5", "top-0 right-5", "-top-3 left-1/2 transform -translate-x-1/2"]
    return getRandomItem(positions)
  }

  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || screenDimensions.width === 0) return

    const ctx = gsap.context(() => {
      // Move all polaroids to the left
      gsap.to(".polaroid-item", {
        x: `-${screenDimensions.width + 300}px`, // Move completely off screen
        duration: 50, // 60 seconds to cross the screen
        repeat: -1,
        ease: "linear",
        stagger: 0, // No stagger, all move together
      })
    }, containerRef)

    return () => ctx.revert()
  }, [screenDimensions])

  const positions = generateRandomPositions(entries.length * 2, screenDimensions.width, screenDimensions.height)

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-gray-200"
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    >
      {entries.concat(entries).map((entry, index) => {
        if (index >= positions.length) return null

        const position = positions[index]
        const rotation = getRandomItem(ROTATIONS)
        const hasTape = shouldHaveTape()
        const tapeColor = getRandomItem(TAPE_COLORS)
        const tapePosition = getTapePosition()

        return (
          <div
            key={`polaroid-${entry.id}-${index}`}
            className="polaroid-item absolute"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: `rotate(${rotation})`,
              zIndex: Math.floor(Math.random() * 10),
            }}
          >
            {/* Decorative tape */}
            {hasTape && (
              <div
                className={`absolute ${tapePosition} w-10 h-5 z-20 ${tapeColor}`}
                style={{ transform: `rotate(${Math.floor(Math.random() * 45)}deg)` }}
              ></div>
            )}

            {/* Polaroid */}
            <div className="bg-white p-2 shadow-lg w-[180px]">
              <div className="relative w-full h-[220px]">
                <Image
                  src={entry.image || "/placeholder.svg?height=220&width=180"}
                  alt={entry.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2 text-center">
                <p className="text-sm font-medium">{entry.quote || "hallo :)"}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
