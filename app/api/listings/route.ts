import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface CreateListingData {
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
  tags?: string[]
}

interface GetListingsQuery {
  search?: string
  categoryId?: string
  condition?: string
  size?: string
  swapType?: 'POINTS' | 'DIRECT'
  minPoints?: number
  maxPoints?: number
  userId?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'pointsValue' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
}

function validateCreateListingData(data: any): data is CreateListingData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    typeof data.description === 'string' &&
    data.description.length >= 10 &&
    typeof data.pointsValue === 'number' &&
    data.pointsValue >= 0 &&
    typeof data.condition === 'string' &&
    data.condition.length > 0 &&
    typeof data.size === 'string' &&
    data.size.length > 0 &&
    (data.swapType === 'POINTS' || data.swapType === 'DIRECT') &&
    typeof data.categoryId === 'string' &&
    data.categoryId.length > 0 &&
    Array.isArray(data.images) &&
    data.images.length > 0
  )
}

function validateGetListingsQuery(query: any): query is GetListingsQuery {
  return typeof query === 'object' && query !== null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams)
    
    if (!validateGetListingsQuery(query)) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    const where: any = {
      isActive: query.isActive ?? true,
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query.search, mode: 'insensitive' } } } },
      ]
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId
    }

    if (query.condition) {
      where.condition = query.condition
    }

    if (query.size) {
      where.size = query.size
    }

    if (query.swapType) {
      where.swapType = query.swapType
    }

    if (query.userId) {
      where.userId = query.userId
    }

    if (query.minPoints !== undefined || query.maxPoints !== undefined) {
      where.pointsValue = {}
      if (query.minPoints !== undefined) {
        where.pointsValue.gte = Number(query.minPoints)
      }
      if (query.maxPoints !== undefined) {
        where.pointsValue.lte = Number(query.maxPoints)
      }
    }

    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'

    const total = await prisma.listing.count({ where })

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            location: true,
          },
        },
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        tags: true,
        _count: {
          select: {
            favorites: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!validateCreateListingData(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }

    const authResult = await auth()
    
    if (!authResult?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    const userId = authResult.user.id

    const listing = await prisma.listing.create({
      data: {
        ...body,
        userId,
        images: {
          create: body.images.map((url: string, index: number) => ({
            url,
            alt: body.title,
            order: index,
          })),
        },
        tags: {
          connectOrCreate: (body.tags || []).map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            location: true,
          },
        },
        category: true,
        images: true,
        tags: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: listing,
      message: 'Listing created successfully',
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
} 