"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export interface Listing {
  id: string
  title: string
  description: string
  pointsValue: number
  condition: string
  size: string
  category: string
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

// API functions
const fetchListings = async (): Promise<Listing[]> => {
  const response = await fetch("/api/listings")
  if (!response.ok) {
    throw new Error("Failed to fetch listings")
  }
  const result = await response.json()
  return result.data || []
}

const createListing = async (listingData: any): Promise<Listing> => {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create listing")
  }
  
  const result = await response.json()
  return result.data
}

const likeListing = async (listingId: string): Promise<void> => {
  const response = await fetch(`/api/listings/${listingId}/like`, {
    method: "POST",
  })
  if (!response.ok) {
    throw new Error("Failed to like listing")
  }
}

const unlikeListing = async (listingId: string): Promise<void> => {
  const response = await fetch(`/api/listings/${listingId}/like`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to unlike listing")
  }
}

export function useListings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const createListingMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] })
      toast({
        title: "Listing created!",
        description: "Your item has been successfully added to the marketplace.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing.",
        variant: "destructive",
      })
    },
  })

  const likeMutation = useMutation({
    mutationFn: likeListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] })
      toast({
        title: "Added to favorites",
        description: "You'll be notified of any updates to this item.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      })
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: unlikeListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      })
    },
  })

  const toggleLike = (listingId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate(listingId)
    } else {
      likeMutation.mutate(listingId)
    }
  }

  return {
    listings,
    isLoading,
    error,
    refetch,
    createListing: createListingMutation.mutate,
    isCreating: createListingMutation.isPending,
    toggleLike,
    isLiking: likeMutation.isPending || unlikeMutation.isPending,
  }
}
