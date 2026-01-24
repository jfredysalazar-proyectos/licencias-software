import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";

export default function MyOrders() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();

  const { data: orders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const handleWhatsAppCheckout = () => {
    const whatsappNumber = "573334315646";
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

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onCartClick={() => setCartOpen(true)} />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onCartClick={() => setCartOpen(true)} />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Acceso Requerido</h1>
          <p className="text-muted-foreground mb-8">
            Debes iniciar sesión para ver tus pedidos
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg">Iniciar Sesión</Button>
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const items = JSON.parse(order.items);
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Pedido #{order.id}
                        </CardTitle>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "pending"
                            ? "Pendiente"
                            : "Cancelado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${item.price.toLocaleString("es-CO")} COP
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-primary">
                          ${order.totalAmount.toLocaleString("es-CO")} COP
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No tienes pedidos aún
                </h3>
                <p className="text-muted-foreground mb-6">
                  Explora nuestro catálogo y realiza tu primera compra
                </p>
                <Button onClick={() => setLocation("/")}>
                  Explorar Productos
                </Button>
              </CardContent>
            </Card>
          )}
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
