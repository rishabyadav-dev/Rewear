"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, ArrowRight, Check, Upload, Tag, Shirt, DollarSign } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useListingsContext } from "@/contexts/listings-context"

interface CategoryOption {
  id: string;
  name: string;
  description?: string;
}

const CONDITIONS = [
  { value: "like-new", label: "Like New", description: "Barely worn, no visible signs of wear" },
  { value: "excellent", label: "Excellent", description: "Minor signs of wear, great condition" },
  { value: "very-good", label: "Very Good", description: "Some signs of wear but well maintained" },
  { value: "good", label: "Good", description: "Noticeable wear but still in good shape" },
  { value: "fair", label: "Fair", description: "Significant wear but functional" },
]

const SIZES = {
  "Men's Clothing": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  "Women's Clothing": ["XS", "S", "M", "L", "XL", "XXL", "0", "2", "4", "6", "8", "10", "12", "14", "16", "18"],
  "Kids' Clothing": ["2T", "3T", "4T", "5T", "6", "7", "8", "10", "12", "14", "16"],
  Shoes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"],
  Accessories: ["One Size", "S", "M", "L"],
  Bags: ["Small", "Medium", "Large"],
  Jewelry: ["One Size", "XS", "S", "M", "L", "XL"],
  Outerwear: ["XS", "S", "M", "L", "XL", "XXL"],
}

interface ListingFormData {
  title: string;
  description: string;
  category: CategoryOption | null;
  size: string;
  condition: string;
  brand: string;
  color: string;
  swapType: "points" | "direct";
  pointsValue: number;
  images: File[];
}

export default function ListItemPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    category: null,
    size: "",
    condition: "",
    brand: "",
    color: "",
    swapType: "points",
    pointsValue: 0,
    images: [],
  })

  const { toast } = useToast()
  const router = useRouter()
  const { addUserListing, categories: categoriesList, ...restContext } = useListingsContext();

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof ListingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImagesChange = (files: File[]) => {
    setFormData((prev) => ({ ...prev, images: files }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.images.length > 0
      case 2:
        return !!(formData.title && formData.description && formData.description.length >= 10 && formData.category)
      case 3:
        return !!(formData.size && formData.condition && formData.brand)
      case 4:
        return formData.swapType === "direct" || formData.pointsValue > 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      let errorMessage = "Fill in all the required information before proceeding."
      
      // Provide specific error messages based on the step
      if (currentStep === 2) {
        if (!formData.title) {
          errorMessage = "Please enter an item title."
        } else if (!formData.description) {
          errorMessage = "Please enter a description."
        } else if (formData.description.length < 10) {
          errorMessage = "Description must be at least 10 characters long."
        } else if (!formData.category) {
          errorMessage = "Please select a category."
        }
      }
      
      toast({
        title: "Please complete all required fields",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Category is required",
        description: "Please select a category for your item.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Convert File objects to base64 strings for storage
      const imagePromises = formData.images.map(async (file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
      })
      
      const imageUrls = await Promise.all(imagePromises)

      // Create the listing data
      const listingData = {
        title: formData.title,
        description: formData.description,
        pointsValue: formData.pointsValue,
        condition: formData.condition,
        size: formData.size,
        brand: formData.brand,
        color: formData.color,
        category: formData.category, // now an object
        images: imageUrls,
        swapType: formData.swapType,
        tags: [formData.brand, formData.color].filter(Boolean),
        isActive: true,
      }

      // Add the listing to user's listings
      await addUserListing(listingData)

      toast({
        title: "Item listed successfully!",
        description: "Your item is now available for swapping. You'll be notified when someone shows interest.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: "Failed to list item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuggestedPoints = () => {
    const basePoints = {
      "like-new": 80,
      excellent: 60,
      "very-good": 45,
      good: 30,
      fair: 15,
    }
    return basePoints[formData.condition as keyof typeof basePoints] || 30
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">List Your Item</h1>
                <p className="text-muted-foreground">Share your unused clothing with the ReWear community</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Upload Photos</span>
              <span>Item Details</span>
              <span>Condition & Size</span>
              <span>Pricing</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentStep === 1 && <Upload className="h-5 w-5" />}
                {currentStep === 2 && <Tag className="h-5 w-5" />}
                {currentStep === 3 && <Shirt className="h-5 w-5" />}
                {currentStep === 4 && <DollarSign className="h-5 w-5" />}
                <span>
                  {currentStep === 1 && "Upload Photos"}
                  {currentStep === 2 && "Item Details"}
                  {currentStep === 3 && "Condition & Size"}
                  {currentStep === 4 && "Set Your Price"}
                </span>
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Add high-quality photos to showcase your item"}
                {currentStep === 2 && "Provide detailed information about your item"}
                {currentStep === 3 && "Specify the condition and size"}
                {currentStep === 4 && "Choose how you'd like to swap this item"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Image Upload */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <ImageUpload images={formData.images} onImagesChange={handleImagesChange} maxImages={5} />
                  <div className="text-sm text-muted-foreground">
                    <p>• Upload up to 5 high-quality photos</p>
                    <p>• First photo will be used as the main image</p>
                    <p>• Images are automatically compressed and optimized</p>
                  </div>
                </div>
              )}

              {/* Step 2: Basic Details */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Vintage Levi's Denim Jacket"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item's style, fit, and any special features..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                    <div className="text-sm text-muted-foreground">
                      {formData.description.length}/10 characters minimum
                      {formData.description.length < 10 && (
                        <span className="text-red-500 ml-2">(Need at least 10 characters)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category?.id || ""}
                      onValueChange={(value) => {
                        const selected = categoriesList.find((cat) => cat.id === value);
                        setFormData((prev) => ({ ...prev, category: selected || null }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesList.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Nike, Zara, H&M"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Primary Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g., Blue, Black, Red"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Condition & Size */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Condition *</Label>
                    <RadioGroup
                      value={formData.condition}
                      onValueChange={(value) => handleInputChange("condition", value)}
                      className="space-y-3"
                    >
                      {CONDITIONS.map((condition) => (
                        <div
                          key={condition.value}
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50"
                        >
                          <RadioGroupItem value={condition.value} id={condition.value} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={condition.value} className="font-medium cursor-pointer">
                              {condition.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{condition.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size *</Label>
                    <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category &&
                          SIZES[formData.category.name as keyof typeof SIZES]?.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 4: Pricing */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>How would you like to swap this item?</Label>
                    <RadioGroup
                      value={formData.swapType}
                      onValueChange={(value: "points" | "direct") => handleInputChange("swapType", value)}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value="points" id="points" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="points" className="font-medium cursor-pointer">
                            Points System
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Set a points value and earn points when someone redeems your item
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value="direct" id="direct" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="direct" className="font-medium cursor-pointer">
                            Direct Swap
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Trade directly with someone who has an item you want
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.swapType === "points" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="points-value">Points Value *</Label>
                        <div className="flex items-center space-x-4">
                          <Input
                            id="points-value"
                            type="number"
                            min="1"
                            max="500"
                            value={formData.pointsValue || ""}
                            onChange={(e) => handleInputChange("pointsValue", Number.parseInt(e.target.value) || 0)}
                            className="w-32"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInputChange("pointsValue", getSuggestedPoints())}
                          >
                            Use Suggested: {getSuggestedPoints()} points
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Points Guide</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>• Like New: 60-100 points</p>
                          <p>• Excellent: 40-80 points</p>
                          <p>• Very Good: 25-60 points</p>
                          <p>• Good: 15-40 points</p>
                          <p>• Fair: 5-20 points</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.swapType === "direct" && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Direct Swap</h4>
                      <p className="text-sm text-purple-800">
                        Your item will be available for direct trades. Other users can propose swaps with their items, and
                        you can choose which trades to accept.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  "Listing Item..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    List Item
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Preview Card */}
          {currentStep > 1 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how your item will appear to other users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {formData.images.length > 0 && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={URL.createObjectURL(formData.images[0]) || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{formData.title || "Item Title"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description || "Item description will appear here..."}
                    </p>
                    <div className="flex items-center space-x-2">
                      {formData.category && <Badge variant="outline">{formData.category.name}</Badge>}
                      {formData.size && <Badge variant="outline">Size {formData.size}</Badge>}
                      {formData.condition && (
                        <Badge variant="outline">{CONDITIONS.find((c) => c.value === formData.condition)?.label}</Badge>
                      )}
                    </div>
                    {formData.swapType === "points" && formData.pointsValue > 0 && (
                      <p className="text-lg font-bold text-green-600">{formData.pointsValue} points</p>
                    )}
                    {formData.swapType === "direct" && (
                      <Badge className="bg-purple-100 text-purple-800">Direct Swap</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
