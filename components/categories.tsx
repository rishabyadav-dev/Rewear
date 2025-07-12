"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shirt, Crown, Baby, Watch, Footprints, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

const categories = [
  { name: "Men", icon: Shirt, count: 1250, color: "bg-blue-100 text-blue-800" },
  { name: "Women", icon: Crown, count: 2100, color: "bg-pink-100 text-pink-800" },
  { name: "Kids", icon: Baby, count: 850, color: "bg-yellow-100 text-yellow-800" },
  { name: "Accessories", icon: Watch, count: 650, color: "bg-purple-100 text-purple-800" },
  { name: "Shoes", icon: Footprints, count: 920, color: "bg-green-100 text-green-800" },
  { name: "Bags", icon: Briefcase, count: 480, color: "bg-orange-100 text-orange-800" },
]

export function Categories() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover amazing pieces across all categories. From everyday essentials to statement pieces.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-muted">
                      <category.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <Badge variant="secondary" className={category.color}>
                    {category.count} items
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
