import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import type { SelectedVariant } from "@/contexts/CartContext";
import Header from "@/components/Header";
import VariantSelector from "@/components/VariantSelector";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/producto/:slug");
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({
    slug: params?.slug || "",
  });

  const { addToCart, cart } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedVariants.length > 0 ? selectedVariants : undefined);
      const variantText = selectedVariants.length > 0 
        ? ` (${selectedVariants.map(v => v.optionValue).join(", ")})`
        : "";
      toast.success(`${product.name}${variantText} agregado al carrito`);
    }
  };

  const handleWhatsAppCheckout = () => {
    const whatsappNumber = "573001234567";
    let message = "¡Hola! Quiero comprar las siguientes licencias:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      
      // Add variants if present
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        item.selectedVariants.forEach((variant) => {
          message += `   ${variant.variantName}: ${variant.optionValue}\n`;
        });
      }
      
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${item.product.basePrice.toLocaleString("es-CO")} COP\n\n`;
    });

    const total = cart.reduce(
      (sum, item) => sum + item.product.basePrice * item.quantity,
      0
    );
    message += `Total: $${total.toLocaleString("es-CO")} COP`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onCartClick={() => setCartOpen(true)} />
        <main className="flex-1 container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onCartClick={() => setCartOpen(true)} />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Producto no encontrado</h1>
          <Button onClick={() => setLocation("/")}>Volver al inicio</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const features = product.features ? JSON.parse(product.features) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="800"
                  height="800"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl font-bold text-gray-300">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.featured === 1 && (
                    <Badge className="bg-primary">Destacado</Badge>
                  )}
                  {product.inStock === 1 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      En Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Agotado
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {product.shortDescription}
                </p>
              </div>

              <div className="border-t border-b py-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    ${product.basePrice.toLocaleString("es-CO")}
                  </span>
                  <span className="text-muted-foreground">COP</span>
                </div>
              </div>

              {/* Variant Selector */}
              <VariantSelector
                productId={product.id}
                onVariantsChange={setSelectedVariants}
              />

              <div>
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Características Incluidas
                  </h2>
                  <ul className="space-y-2">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.inStock === 0}
                >
                  Agregar al Carrito
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCartOpen(true)}
                >
                  Ver Carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleWhatsAppCheckout}
      />
    </div>
  );
}
