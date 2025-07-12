import { Listing, User, Category, Transaction, Message, Review, Favorite, Tag, ListingImage } from '@prisma/client'

// Base types from Prisma
export type { Listing, User, Category, Transaction, Message, Review, Favorite, Tag, ListingImage }

// Extended types for API responses
export interface ListingWithRelations extends Listing {
  user: User
  category: Category
  images: ListingImage[]
  tags: Tag[]
  _count?: {
    favorites: number
    transactions: number
  }
}

export interface UserWithStats extends User {
  _count?: {
    listings: number
    reviews: number
    receivedReviews: number
  }
  averageRating?: number
}

export interface CategoryWithStats extends Category {
  _count?: {
    listings: number
  }
}

export interface TransactionWithRelations extends Transaction {
  buyer: User
  listing: ListingWithRelations
  messages: Message[]
}

export interface MessageWithSender extends Message {
  sender: User
}

export interface ReviewWithUsers extends Review {
  reviewer: User
  reviewedUser: User
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateListingData {
  title: string
  description: string
  pointsValue: number
  condition: string
  size: string
  brand?: string
  color?: string
  swapType: 'POINTS' | 'DIRECT'
  categoryId: string
  images: string[]
  tags: string[]
}

export interface UpdateListingData extends Partial<CreateListingData> {
  isActive?: boolean
}

export interface CreateUserData {
  email: string
  name: string
  avatar?: string
  location?: string
  bio?: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
  points?: number
  rating?: number
  isActive?: boolean
}

// Filter types
export interface ListingFilters {
  search?: string
  categoryId?: string
  condition?: string
  size?: string
  swapType?: 'POINTS' | 'DIRECT'
  minPoints?: number
  maxPoints?: number
  userId?: string
  isActive?: boolean
}

export interface ListingSort {
  field: 'createdAt' | 'pointsValue' | 'views' | 'likes'
  order: 'asc' | 'desc'
}

// Enums
export enum SwapType {
  POINTS = 'POINTS',
  DIRECT = 'DIRECT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
} 