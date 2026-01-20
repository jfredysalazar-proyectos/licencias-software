import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Carrito de Compras</span>
            <span className="text-sm font-normal text-muted-foreground">
              {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-4">
              Agrega productos para comenzar tu compra
            </p>
            <Button onClick={onClose}>Explorar Productos</Button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <ScrollArea className="flex-1 -mx-6 px-6 my-6">
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="flex gap-4 p-4 rounded-lg border bg-card"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-300">
                            {item.product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                        {item.product.name}
                      </h4>
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <div className="text-xs text-muted-foreground mb-1 space-y-0.5">
                          {item.selectedVariants.map((variant) => (
                            <div key={variant.variantId}>
                              <span className="font-medium">{variant.variantName}:</span> {variant.optionValue}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-primary font-semibold mb-2">
                        ${(item.variantPrice || item.product.basePrice).toLocaleString("es-CO")}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">
                  ${getCartTotal().toLocaleString("es-CO")} COP
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Comprar por WhatsApp
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
