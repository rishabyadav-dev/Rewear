import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface UpdateListingData {
  title?: string
  description?: string
  pointsValue?: number
  condition?: string
  size?: string
  brand?: string
  color?: string
  swapType?: 'POINTS' | 'DIRECT'
  categoryId?: string
  images?: string[]
  tags?: string[]
  isActive?: boolean
}

function validateUpdateListingData(data: any): data is UpdateListingData {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data.title === undefined || (typeof data.title === 'string' && data.title.length > 0)) &&
    (data.description === undefined || (typeof data.description === 'string' && data.description.length >= 10)) &&
    (data.pointsValue === undefined || (typeof data.pointsValue === 'number' && data.pointsValue >= 0)) &&
    (data.condition === undefined || (typeof data.condition === 'string' && data.condition.length > 0)) &&
    (data.size === undefined || (typeof data.size === 'string' && data.size.length > 0)) &&
    (data.swapType === undefined || (data.swapType === 'POINTS' || data.swapType === 'DIRECT')) &&
    (data.categoryId === undefined || (typeof data.categoryId === 'string' && data.categoryId.length > 0)) &&
    (data.images === undefined || (Array.isArray(data.images) && data.images.length > 0)) &&
    (data.isActive === undefined || typeof data.isActive === 'boolean')
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id },
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
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: listing,
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (!validateUpdateListingData(body)) {
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

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this listing' },
        { status: 403 }
      )
    }

    const updateData: any = { ...body }

    if (body.images) {
      await prisma.listingImage.deleteMany({
        where: { listingId: id },
      })

      updateData.images = {
        create: body.images.map((url: string, index: number) => ({
          url,
          alt: body.title || 'Listing image',
          order: index,
        })),
      }
    }

    if (body.tags) {
      updateData.tags = {
        set: [],
        connectOrCreate: body.tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      }
    }

    delete updateData.images
    delete updateData.tags

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
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
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedListing,
      message: 'Listing updated successfully',
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await auth()
    if (!authResult?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this listing' },
        { status: 403 }
      )
    }

    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
} 