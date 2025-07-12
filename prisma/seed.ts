import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = [
    { name: "Men's Clothing", description: "Clothing items for men", icon: "Shirt", color: "bg-blue-100 text-blue-800" },
    { name: "Women's Clothing", description: "Clothing items for women", icon: "Crown", color: "bg-pink-100 text-pink-800" },
    { name: "Kids' Clothing", description: "Clothing items for children", icon: "Baby", color: "bg-yellow-100 text-yellow-800" },
    { name: "Shoes", description: "Footwear for all ages", icon: "Footprints", color: "bg-green-100 text-green-800" },
    { name: "Accessories", description: "Jewelry, bags, and other accessories", icon: "Watch", color: "bg-purple-100 text-purple-800" },
    { name: "Bags", description: "Handbags, backpacks, and luggage", icon: "Briefcase", color: "bg-orange-100 text-orange-800" },
    { name: "Jewelry", description: "Necklaces, rings, earrings, and more", icon: "Gem", color: "bg-indigo-100 text-indigo-800" },
    { name: "Outerwear", description: "Jackets, coats, and winter wear", icon: "Snowflake", color: "bg-gray-100 text-gray-800" },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  // Create sample users
  const users = [
    {
      email: "sarah.chen@example.com",
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "San Francisco, CA",
      bio: "Fashion enthusiast who loves sustainable clothing swaps",
      rating: 4.8,
      points: 150,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      email: "mike.johnson@example.com",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "New York, NY",
      bio: "Minimalist who believes in quality over quantity",
      rating: 4.9,
      points: 85,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      email: "emma.davis@example.com",
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Austin, TX",
      bio: "Mom of two who loves finding great deals on kids' clothes",
      rating: 4.7,
      points: 200,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      email: "alex.rivera@example.com",
      name: "Alex Rivera",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Portland, OR",
      bio: "Sustainable fashion advocate and vintage lover",
      rating: 4.6,
      points: 120,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const createdUsers = []
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
    createdUsers.push(createdUser)
  }

  // Create sample listings
  const listings = [
    {
      title: "Vintage Levi's Denim Jacket",
      description: "Classic blue denim jacket in excellent condition. Perfect for layering, has that authentic vintage fade that you can't get from new jackets.",
      pointsValue: 65,
      condition: "Excellent",
      size: "M",
      brand: "Levi's",
      color: "Blue",
      swapType: "POINTS" as const,
      categoryName: "Men's Clothing",
      userId: createdUsers[0].id,
      images: ["/placeholder.svg?height=300&width=300"],
      tags: ["vintage", "denim", "casual"],
    },
    {
      title: "Designer Silk Blouse",
      description: "Elegant cream silk blouse from a premium brand. Perfect for office wear or special occasions. Barely worn, like new condition.",
      pointsValue: 85,
      condition: "Like New",
      size: "S",
      brand: "Theory",
      color: "Cream",
      swapType: "DIRECT" as const,
      categoryName: "Women's Clothing",
      userId: createdUsers[1].id,
      images: ["/placeholder.svg?height=300&width=300"],
      tags: ["designer", "silk", "formal"],
    },
    {
      title: "Kids Rainbow Sweater",
      description: "Colorful knit sweater perfect for fall weather. Soft cotton blend, machine washable. My daughter outgrew it but it's still in great shape.",
      pointsValue: 25,
      condition: "Very Good",
      size: "6Y",
      brand: "Gap Kids",
      color: "Rainbow",
      swapType: "POINTS" as const,
      categoryName: "Kids' Clothing",
      userId: createdUsers[2].id,
      images: ["/placeholder.svg?height=300&width=300"],
      tags: ["kids", "colorful", "cozy"],
    },
    {
      title: "Leather Ankle Boots",
      description: "Genuine leather boots with minimal wear. Comfortable and stylish for everyday use. Great quality construction that will last for years.",
      pointsValue: 80,
      condition: "Very Good",
      size: "8",
      brand: "Clarks",
      color: "Brown",
      swapType: "POINTS" as const,
      categoryName: "Shoes",
      userId: createdUsers[3].id,
      images: ["/placeholder.svg?height=300&width=300"],
      tags: ["leather", "boots", "versatile"],
    },
  ]

  for (const listing of listings) {
    const category = await prisma.category.findUnique({
      where: { name: listing.categoryName },
    })

    if (!category) continue

    const createdListing = await prisma.listing.create({
      data: {
        title: listing.title,
        description: listing.description,
        pointsValue: listing.pointsValue,
        condition: listing.condition,
        size: listing.size,
        brand: listing.brand,
        color: listing.color,
        swapType: listing.swapType,
        userId: listing.userId,
        categoryId: category.id,
        images: {
          create: listing.images.map((url, index) => ({
            url,
            alt: listing.title,
            order: index,
          })),
        },
        tags: {
          connectOrCreate: listing.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    })

    console.log(`Created listing: ${createdListing.title}`)
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 