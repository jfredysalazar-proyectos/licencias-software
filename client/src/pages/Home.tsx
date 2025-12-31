import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { cart } = useCart();

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppCheckout = () => {
    const whatsappNumber = "573001234567";
    let message = "¡Hola! Quiero comprar las siguientes licencias:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Search Bar */}
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar licencias de software..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="container pb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="container pb-16">
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No se encontraron productos
              </p>
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        <div className="bg-muted py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Carlos Rodríguez",
                  product: "Windows 11 Pro",
                  comment:
                    "Excelente servicio! Recibí mi licencia en menos de 5 minutos. Totalmente confiable y rápido. Lo recomiendo 100%.",
                },
                {
                  name: "María González",
                  product: "Microsoft Office 2021",
                  comment:
                    "La mejor experiencia comprando software online. El proceso es súper fácil y la licencia llegó instantáneamente por WhatsApp. Volveré a comprar!",
                },
                {
                  name: "David Thompson",
                  product: "Adobe Creative Cloud",
                  comment:
                    "Increíble atención al cliente. Tuve una duda y me respondieron al instante. La licencia funcionó perfectamente. Muy profesionales!",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-sm border border-border"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.product}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cliente Verificado
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-lg font-semibold">
              ⭐ 4.9/5 basado en más de 10,000+ reseñas verificadas
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para obtener tu Licencia de Software?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Chatea con nosotros en WhatsApp para comprar al instante y recibir soporte
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const whatsappNumber = "573001234567";
                const message = "Hola, tengo una consulta sobre las licencias de software";
                window.open(
                  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
                  "_blank"
                );
              }}
            >
              Chatear en WhatsApp
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleWhatsAppCheckout}
      />
    </div>
  );
}
