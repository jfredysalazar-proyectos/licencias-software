import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

interface HeaderProps {
  onCartClick: () => void;
  onSearchClick?: () => void;
}

export default function Header({ onCartClick, onSearchClick }: HeaderProps) {
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartCount = getCartCount();

  // TRM (Tasa de Cambio) - En un caso real, esto vendría de una API
  const trm = 3800;
  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* TRM Banner */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
        <div className="container">
          <div className="flex items-center justify-center gap-2 text-sm font-medium animate-fade-in">
            <span>TRM para Hoy {today} es de: ${trm.toLocaleString("es-CO")} COP por Dólar</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-card border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">SL</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none text-foreground">
                    SoftwareLicenses
                  </span>
                  <span className="text-xs text-muted-foreground">Colombia</span>
                </div>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search Button - Mobile */}
              {onSearchClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={onSearchClick}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Login/User Button */}
              {isAuthenticated && user ? (
                <Link href="/mis-pedidos">
                  <Button variant="outline" size="sm">
                    {user.name || "Mi Cuenta"}
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="default" size="sm">
                    Iniciar Sesión
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
