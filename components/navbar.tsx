"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Leaf, User, Settings, LogOut, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMemo } from "react"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  // Debug: Log user data
  console.log("Navbar - User:", user, "IsAuthenticated:", isAuthenticated)

  // Generate aesthetically pleasing random colors based on user name
  const avatarColors = useMemo(() => {
    if (!user?.name) return { bg: "bg-blue-500", text: "text-white" }
    
    const colors = [
      { bg: "bg-blue-500", text: "text-white" },
      { bg: "bg-green-500", text: "text-white" },
      { bg: "bg-purple-500", text: "text-white" },
      { bg: "bg-pink-500", text: "text-white" },
      { bg: "bg-indigo-500", text: "text-white" },
      { bg: "bg-teal-500", text: "text-white" },
      { bg: "bg-orange-500", text: "text-white" },
      { bg: "bg-red-500", text: "text-white" },
      { bg: "bg-yellow-500", text: "text-black" },
      { bg: "bg-emerald-500", text: "text-white" },
      { bg: "bg-rose-500", text: "text-white" },
      { bg: "bg-violet-500", text: "text-white" },
    ]
    
    // Use the first character of the name to consistently select a color
    const charCode = user.name.charCodeAt(0)
    const colorIndex = charCode % colors.length
    return colors[colorIndex]
  }, [user?.name])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-2xl font-bold">ReWear</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {user?.points || 0} points
              </Badge>

              <Button asChild size="sm">
                <Link href="/list-item">
                  <Plus className="h-4 w-4 mr-2" />
                  List Item
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className={`h-8 w-8 ${avatarColors.bg}`}>
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className={`${avatarColors.text} font-bold text-sm`}>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
