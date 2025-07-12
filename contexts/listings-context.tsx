"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"

export interface Listing {
  id: string
  title: string
  description: string
  pointsValue: number
  condition: string
  size: string
  brand?: string
  color?: string
  category: {
    id: string
    name: string
    description?: string
  }
  images: string[]
  swapType: "points" | "direct"
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    avatar?: string
    rating: number
    location: string
  }
  isActive: boolean
  views: number
  likes: number
  tags?: string[]
}

interface ListingsContextType {
  listings: Listing[]
  userListings: Listing[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  filteredListings: Listing[]
  categories: { id: string; name: string; description?: string }[];
  likedItems: Set<string>
  toggleLike: (listingId: string) => void
  addUserListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'views' | 'likes'>) => Promise<Listing>;
  updateUserListing: (id: string, updates: Partial<Listing>) => Promise<Listing>
  deleteUserListing: (id: string) => Promise<void>
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined)

// API function to fetch categories
const fetchCategories = async (): Promise<{ id: string; name: string; description?: string }[]> => {
  const response = await fetch("/api/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const result = await response.json()
  return result.data || []
}

// API function to fetch listings
const fetchListings = async (): Promise<Listing[]> => {
  const response = await fetch("/api/listings")
  if (!response.ok) {
    throw new Error("Failed to fetch listings")
  }
  const result = await response.json()
  return result.data || []
}

// API function to fetch user listings
const fetchUserListings = async (userId: string): Promise<Listing[]> => {
  const response = await fetch(`/api/listings?userId=${userId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch user listings")
  }
  const result = await response.json()
  return result.data || []
}

// API function to create listing
const createListing = async (listingData: any): Promise<Listing> => {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error("API Error Details:", errorData)
    if (errorData.details) {
      throw new Error(`Validation error: ${errorData.details.map((e: any) => e.message).join(", ")}`)
    }
    throw new Error(errorData.error || "Failed to create listing")
  }
  
  const result = await response.json()
  return result.data
}

// API function to update listing
const updateListing = async (id: string, listingData: any): Promise<Listing> => {
  const response = await fetch(`/api/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error("API Error Details:", errorData)
    if (errorData.details) {
      throw new Error(`Validation error: ${errorData.details.map((e: any) => e.message).join(", ")}`)
    }
    throw new Error(errorData.error || "Failed to update listing")
  }
  
  const result = await response.json()
  return result.data
}

// API function to delete listing
const deleteListing = async (id: string): Promise<void> => {
  const response = await fetch(`/api/listings/${id}`, {
    method: "DELETE",
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to delete listing")
  }
}

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())

  console.log("Auth status:", { isAuthenticated, isLoading, userId: user?.id, userEmail: user?.email })

  const {
    data: listings = [],
    isLoading: listingsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    data: userListings = [],
    isLoading: userListingsLoading,
    refetch: refetchUserListings,
  } = useQuery({
    queryKey: ["userListings", user?.id],
    queryFn: () => user?.id ? fetchUserListings(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    data: dbCategories = [],
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const toggleLike = (listingId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(listingId)) {
        newSet.delete(listingId)
      } else {
        newSet.add(listingId)
      }
      return newSet
    })
  }

  const addUserListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'views' | 'likes'>) => {
    if (!user) {
      console.error("No user found - user must be authenticated")
      throw new Error("User must be authenticated to create a listing")
    }
    if (!listingData.category?.id) {
      throw new Error("Category is required")
    }

    console.log("User authenticated:", user.id, user.email)

    try {
      // Transform the listing data to match the API schema
      const apiListingData = {
        title: listingData.title,
        description: listingData.description,
        pointsValue: listingData.pointsValue,
        condition: listingData.condition,
        size: listingData.size,
        swapType: listingData.swapType.toUpperCase() as 'POINTS' | 'DIRECT',
        categoryId: listingData.category.id,
        images: listingData.images,
        tags: listingData.tags || [],
        brand: listingData.brand || undefined,
        color: listingData.color || undefined,
      }

      console.log("Sending data to API:", apiListingData)

      const newListing = await createListing(apiListingData)
      
      // Refresh both general listings and user listings
      refetch()
      if (user?.id) {
        refetchUserListings()
      }
      
      return newListing
    } catch (error) {
      console.error("Failed to create listing:", error)
      throw error
    }
  }

  const updateUserListing = async (id: string, updates: Partial<Listing>) => {
    if (!user) {
      throw new Error("User must be authenticated to update a listing")
    }

    try {
      // Find the category ID by name if category is being updated
      let categoryId: string | undefined
      if (updates.category) {
        if (typeof updates.category === 'string') {
          const category = dbCategories.find(cat => String(cat.name) === String(updates.category))
          if (!category) {
            throw new Error(`Category "${updates.category}" not found`)
          }
          categoryId = category.id
        } else if (typeof updates.category === 'object' && 'id' in updates.category) {
          categoryId = updates.category.id
        }
      }

      // Transform the updates to match the API schema
      const apiUpdates: any = { ...updates }
      
      if (categoryId) {
        apiUpdates.categoryId = categoryId
        delete apiUpdates.category
      }

      if (updates.swapType) {
        apiUpdates.swapType = updates.swapType.toUpperCase() as 'POINTS' | 'DIRECT'
      }

      console.log("Updating listing with data:", apiUpdates)

      const updatedListing = await updateListing(id, apiUpdates)
      
      // Refresh both general listings and user listings
      refetch()
      if (user?.id) {
        refetchUserListings()
      }
      
      return updatedListing
    } catch (error) {
      console.error("Failed to update listing:", error)
      throw error
    }
  }

  const deleteUserListing = async (id: string) => {
    if (!user) {
      throw new Error("User must be authenticated to delete a listing")
    }

    try {
      await deleteListing(id)
      
      // Refresh both general listings and user listings
      refetch()
      if (user?.id) {
        refetchUserListings()
      }
    } catch (error) {
      console.error("Failed to delete listing:", error)
      throw error
    }
  }

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory =
        selectedCategory === "all" ||
        listing.category?.id === selectedCategory ||
        listing.category?.name === selectedCategory;
      return matchesSearch && matchesCategory && listing.isActive
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price-low":
          return a.pointsValue - b.pointsValue
        case "price-high":
          return b.pointsValue - a.pointsValue
        case "popular":
          return b.views + b.likes - (a.views + a.likes)
        default:
          return 0
      }
    })

  const categories = dbCategories.map((cat) => ({ id: cat.id, name: cat.name, description: cat.description }));

  const value = {
    listings,
    userListings,
    isLoading: listingsLoading || userListingsLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredListings,
    categories,
    likedItems,
    toggleLike,
    addUserListing,
    updateUserListing,
    deleteUserListing,
  }

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

export function useListingsContext() {
  const context = useContext(ListingsContext)
  if (context === undefined) {
    throw new Error("useListingsContext must be used within a ListingsProvider")
  }
  return context
}
