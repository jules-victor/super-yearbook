"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { uploadYearbookEntry } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Camera, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UploadPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Use useEffect to mark when component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await uploadYearbookEntry(formData)

      if (result.success) {
        setSuccess(result.message)
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Your Yearbook Entry</CardTitle>
          <CardDescription>Share your photo and a memorable quote for the yearbook</CardDescription>
        </CardHeader>
        <CardContent>
          {mounted && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mounted && success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Your Quote</Label>
                <Textarea
                  id="quote"
                  name="quote"
                  placeholder="Share something memorable..."
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Your Photo</Label>
                <div className="flex flex-col items-center gap-4">
                  {mounted && (
                    <>
                      {previewUrl ? (
                        <div className="relative w-full h-48 rounded-md overflow-hidden">
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                          <Camera className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </>
                  )}
                  {!mounted && (
                    <div className="w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                      <Camera className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {mounted && previewUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="flex justify-end gap-2 px-0 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Entry"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
