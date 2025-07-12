import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RegisterData {
  name: string
  email: string
  password: string
}

function validateRegisterData(data: any): data is RegisterData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    data.name.length >= 2 &&
    typeof data.email === 'string' &&
    data.email.includes('@') &&
    typeof data.password === 'string' &&
    data.password.length >= 6
  )
}

// Simple hash function for development (use proper bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!validateRegisterData(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(body.password)

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        rating: 4.5,
        points: 100, // Starting points for new users
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    )
  }
} 