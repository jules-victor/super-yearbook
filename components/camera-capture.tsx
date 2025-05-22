"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraIcon as FlipCamera, X } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [error, setError] = useState<string | null>(null)

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const constraints = {
          video: { facingMode },
          audio: false,
        }

        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Get new stream
        const newStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(newStream)

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }

        setError(null)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access camera. Please ensure you've granted camera permissions.")
      }
    }

    setupCamera()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Take photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL
      const imageData = canvas.toDataURL("image/jpeg")
      onCapture(imageData)
    }
  }

  // Switch camera (front/back)
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white p-4 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="max-h-full max-w-full object-contain" />
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="p-4 bg-black flex justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full h-14 w-14 bg-white" onClick={switchCamera}>
          <FlipCamera className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14 bg-white"
          onClick={takePhoto}
          disabled={!!error}
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
