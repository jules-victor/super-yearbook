"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card"

export function YearbookQRCode() {
  const [uploadUrl, setUploadUrl] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only run on client side
    setMounted(true)
    const baseUrl = "https://www.super-yearbook.vercel.app"
    setUploadUrl(`${baseUrl}/upload`)
  }, [])

  // Don't render anything on the server
  if (!mounted) {
    return <div className="fixed bottom-4 right-4 w-[100px] h-[100px]"></div>
  }

  return (
    <Card className="fixed bottom-4 right-4 p-2 shadow-lg bg-white">
      <QRCode value={uploadUrl} size={100} level="H"  />
    </Card>
  )
}
