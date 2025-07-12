"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/listings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.error || "Not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="w-full h-96 mb-8" />
          <Skeleton className="w-1/2 h-8 mb-4" />
          <Skeleton className="w-1/3 h-6 mb-2" />
          <Skeleton className="w-full h-32 mb-4" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-8">{error || "This product does not exist or was removed."}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <Card className="flex flex-col items-center justify-center min-h-[400px]">
            <CardContent className="flex flex-col items-center w-full">
              {product.images && product.images.length > 0 ? (
                <img
                  src={
                    typeof product.images[0] === 'string'
                      ? product.images[0]
                      : (product.images[0] && typeof product.images[0] === 'object' && 'url' in product.images[0]
                          ? (product.images[0] as { url: string }).url
                          : "/placeholder.svg")
                  }
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
              ) : (
                <Skeleton className="w-full h-96 mb-4" />
              )}
              <div className="flex space-x-2 mt-2">
                {product.images && product.images.slice(1).map((img: any, idx: number) => (
                  <img
                    key={idx}
                    src={
                      typeof img === 'string'
                        ? img
                        : (img && typeof img === 'object' && 'url' in img
                            ? (img as { url: string }).url
                            : "/placeholder.svg")
                    }
                    alt={`Product image ${idx + 2}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
              <CardDescription>{product.category?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">Size: {product.size}</Badge>
                <Badge variant="outline">Condition: {product.condition}</Badge>
                {product.brand && <Badge variant="outline">Brand: {product.brand}</Badge>}
                {product.color && <Badge variant="outline">Color: {product.color}</Badge>}
                {product.swapType === "points" ? (
                  <Badge className="bg-green-100 text-green-800">{product.pointsValue} points</Badge>
                ) : (
                  <Badge className="bg-purple-100 text-purple-800">Direct Swap</Badge>
                )}
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag: any, idx: number) => <Badge key={idx}>{tag.name}</Badge>)
                  ) : (
                    <span className="text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Owner</h4>
                <div className="flex items-center space-x-2">
                  <img
                    src={product.user?.avatar || "/placeholder-user.jpg"}
                    alt={product.user?.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{product.user?.name || "Unknown"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="secondary">Available/Swap</Button>
              <Button onClick={() => router.back()}>Back</Button>
            </CardFooter>
          </Card>
        </div>
        {/* Previous Listings (Placeholder) */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Previous Listings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Placeholder for previous listings, can be replaced with real data */}
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-40 flex items-center justify-center">
                <span className="text-muted-foreground">Listing {n}</span>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 