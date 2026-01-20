import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { Product } from "../../../drizzle/schema";

interface RelatedProductsCarouselProps {
  products: Product[];
}

export default function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = 
      direction === "left"
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
    
    setTimeout(checkScrollButtons, 300);
  };

  const handleProductClick = (slug: string) => {
    setLocation(`/producto/${slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">También te puede interesar</h2>
        
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg hover:bg-background/90"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Products Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                className="flex-shrink-0 w-[250px] cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product.slug)}
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-300">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  {product.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {product.shortDescription}
                    </p>
                  )}

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">
                      ${product.basePrice.toLocaleString("es-CO")}
                    </span>
                    <span className="text-xs text-muted-foreground">COP</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg hover:bg-background/90"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
