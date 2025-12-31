import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../../../drizzle/schema";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <Link href={`/producto/${product.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width="800"
                height="800"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-300">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
            {product.featured === 1 && (
              <Badge className="absolute top-2 right-2 bg-primary">
                Destacado
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.shortDescription || product.description}
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Desde</span>
            <span className="text-2xl font-bold text-primary">
              ${product.basePrice.toLocaleString("es-CO")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {product.inStock === 1 ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                En Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Agotado
              </Badge>
            )}
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.inStock === 0}
              className="w-full"
            >
              Agregar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
