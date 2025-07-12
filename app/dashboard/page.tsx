"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Package, ArrowUpRight, Award, Leaf, TrendingUp, Plus, Eye, Heart, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useListingsContext } from "@/contexts/listings-context"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

function getUserPoints(user: any): number {
  return typeof user === 'object' && user !== null && 'points' in user ? user.points : 0
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { userListings, deleteUserListing } = useListingsContext()

  const stats = [
    {
      title: "Total Points",
      value: getUserPoints(user),
      change: "+12",
      changeType: "positive" as const,
      icon: Award,
      description: "Earned this month",
    },
    {
      title: "Items Listed",
      value: userListings.length,
      change: `+${userListings.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}`,
      changeType: "positive" as const,
      icon: Package,
      description: "Active listings",
    },
    {
      title: "Successful Swaps",
      value: 15,
      change: "+3",
      changeType: "positive" as const,
      icon: ArrowUpRight,
      description: "This month",
    },
    {
      title: "CO₂ Saved",
      value: "24kg",
      change: "+5kg",
      changeType: "positive" as const,
      icon: Leaf,
      description: "Environmental impact",
    },
  ]

  const recentActivity = [
    {
      id: "1",
      type: "swap_completed",
      title: "Vintage Denim Jacket swapped",
      description: "You earned 45 points",
      time: "2 hours ago",
      points: 45,
    },
    {
      id: "2",
      type: "item_liked",
      title: "Someone liked your Designer Blouse",
      description: "Sarah Chen showed interest",
      time: "5 hours ago",
      points: 0,
    },
    {
      id: "3",
      type: "points_spent",
      title: "Redeemed Leather Boots",
      description: "You spent 80 points",
      time: "1 day ago",
      points: -80,
    },
  ]

  const handleDeleteListing = (listingId: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteUserListing(listingId)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your ReWear account</p>
          </div>
          <Button asChild>
            <Link href="/list-item">
              <Plus className="mr-2 h-4 w-4" />
              List New Item
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.change}</span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity & Listings */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="listings">My Listings</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest swaps and interactions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                        {activity.points !== 0 && (
                          <Badge
                            variant={activity.points > 0 ? "default" : "secondary"}
                            className={activity.points > 0 ? "bg-green-100 text-green-800" : ""}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points} points
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="listings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Listings</CardTitle>
                    <CardDescription>Manage your active and pending items</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userListings.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                        <p className="text-muted-foreground mb-4">Start by listing your first item to begin swapping!</p>
                        <Button asChild>
                          <Link href="/list-item">
                            <Plus className="mr-2 h-4 w-4" />
                            List Your First Item
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      userListings.map((listing) => (
                        <div key={listing.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                          <img
                            src={
                              Array.isArray(listing.images) && listing.images.length > 0
                                ? (typeof listing.images[0] === 'string'
                                    ? listing.images[0]
                                    : (listing.images[0] && typeof listing.images[0] === 'object' && 'url' in listing.images[0]
                                        ? (listing.images[0] as { url: string }).url
                                        : undefined))
                                : "/placeholder.svg"
                            }
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {listing.swapType === "points" ? `${listing.pointsValue} points` : "Direct swap"}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Eye className="mr-1 h-3 w-3" />
                                {listing.views} views
                              </div>
                              <div className="flex items-center">
                                <Heart className="mr-1 h-3 w-3" />
                                {listing.likes} likes
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {listing.condition}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={listing.isActive ? "default" : "secondary"}>
                              {listing.isActive ? "active" : "inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Profile & Achievements */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={typeof user === 'object' && user !== null && typeof (user as any).avatar === 'string' ? (user as any).avatar : "/placeholder.svg"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1">Eco Warrior</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your sustainability milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">First Swap</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <Leaf className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Eco Warrior</p>
                    <p className="text-xs text-muted-foreground">10+ Swaps</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50">
                    <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Top Seller</p>
                    <p className="text-xs text-muted-foreground">5+ Listings</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 opacity-50">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Influencer</p>
                    <p className="text-xs text-muted-foreground">50+ Swaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
