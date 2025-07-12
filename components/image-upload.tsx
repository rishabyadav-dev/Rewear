"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (files: File[]) => void
  maxImages?: number
  maxSize?: number // in MB
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, maxSize = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => file.errors[0]?.message).join(", ")
        toast({
          title: "Upload Error",
          description: errors,
          variant: "destructive",
        })
        return
      }

      // Check if adding these files would exceed the limit
      if (images.length + acceptedFiles.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${maxImages} images.`,
          variant: "destructive",
        })
        return
      }

      // Simulate upload processing
      setUploading(true)
      setTimeout(() => {
        onImagesChange([...images, ...acceptedFiles])
        setUploading(false)
        toast({
          title: "Images uploaded successfully",
          description: `${acceptedFiles.length} image(s) added.`,
        })
      }, 1000)
    },
    [images, maxImages, onImagesChange, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    disabled: uploading || images.length >= maxImages,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${uploading || images.length >= maxImages ? "opacity-50" : ""}`}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="cursor-pointer text-center space-y-4">
            <input {...getInputProps()} />
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {uploading
                  ? "Processing images..."
                  : isDragActive
                    ? "Drop images here"
                    : images.length >= maxImages
                      ? `Maximum ${maxImages} images reached`
                      : "Drag & drop images here"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {!uploading && images.length < maxImages && (
                  <>
                    or <span className="text-primary font-medium">browse files</span>
                    <br />
                    Supports: JPEG, PNG, WebP (max {maxSize}MB each)
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>First image will be the main photo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((file, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Main photo badge */}
                    {index === 0 && <Badge className="absolute top-2 left-2 bg-green-600">Main</Badge>}

                    {/* Remove button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Move buttons */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-xs"
                          onClick={() => moveImage(index, index - 1)}
                        >
                          ←
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-xs ml-auto"
                          onClick={() => moveImage(index, index + 1)}
                        >
                          →
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* File info */}
                  <div className="p-2 bg-muted/50">
                    <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Photo Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use natural lighting for best results</li>
                  <li>• Show the item from multiple angles</li>
                  <li>• Include close-ups of any details or flaws</li>
                  <li>• Ensure the background is clean and uncluttered</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
