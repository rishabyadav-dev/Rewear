import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { ProductGrid } from "@/components/product-grid"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  )
}
