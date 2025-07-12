"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Package,
  ArrowUpDown,
  DollarSign,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard-simple"

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Active Listings",
      value: "1,234",
      change: "+8%",
      icon: Package,
    },
    {
      title: "Total Swaps",
      value: "8,921",
      change: "+23%",
      icon: ArrowUpDown,
    },
    {
      title: "Points Circulated",
      value: "45,678",
      change: "+15%",
      icon: DollarSign,
    },
  ]

  const users = [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@example.com",
      points: 450,
      swaps: 12,
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike@example.com",
      points: 320,
      swaps: 8,
      status: "active",
      joinDate: "2024-02-20",
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@example.com",
      points: 180,
      swaps: 5,
      status: "suspended",
      joinDate: "2024-03-10",
    },
  ]

  const listings = [
    {
      id: "1",
      title: "Vintage Denim Jacket",
      owner: "Sarah Chen",
      price: 45,
      status: "approved",
      category: "Men",
      createdAt: "2024-03-15",
    },
    {
      id: "2",
      title: "Designer Silk Blouse",
      owner: "Mike Johnson",
      price: 65,
      status: "pending",
      category: "Women",
      createdAt: "2024-03-14",
    },
    {
      id: "3",
      title: "Kids Rainbow Sweater",
      owner: "Emma Davis",
      price: 25,
      status: "approved",
      category: "Kids",
      createdAt: "2024-03-13",
    },
  ]

  const handleResetDemo = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Demo Reset Complete",
        description: "All demo data has been restored to initial state.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset demo data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    toast({
      title: "Action Completed",
      description: `User ${action} successfully.`,
    })
  }

  const handleListingAction = (listingId: string, action: string) => {
    toast({
      title: "Action Completed",
      description: `Listing ${action} successfully.`,
    })
  }

  // Remove role check for now since it's not defined in the User type
  // if (user?.role !== "ADMIN") {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Card className="w-full max-w-md">
  //         <CardHeader className="text-center">
  //           <CardTitle>Access Denied</CardTitle>
  //           <CardDescription>You don't have permission to access the admin panel.</CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   )
  // }

  return (
    <AuthGuard adminOnly={true}>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, listings, and platform operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleResetDemo} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Resetting..." : "Reset Demo Data"}
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
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
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="swaps">Swaps</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all platform users</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-8 w-64" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Swaps</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.points} pts</Badge>
                        </TableCell>
                        <TableCell>{user.swaps}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspended')}>
                                Suspend User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activated')}>
                                Activate User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'deleted')}>
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Listing Management</CardTitle>
                    <CardDescription>Review and manage all platform listings</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search listings..." className="pl-8 w-64" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div className="font-medium">{listing.title}</div>
                        </TableCell>
                        <TableCell>{listing.owner}</TableCell>
                        <TableCell>{listing.price} pts</TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell>
                          <Badge variant={listing.status === 'approved' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{listing.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'approved')}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'rejected')}>
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'featured')}>
                                Feature
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleListingAction(listing.id, 'deleted')}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Swap Management</CardTitle>
                <CardDescription>Monitor and manage all swap transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Swap management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}
