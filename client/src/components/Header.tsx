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

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-card border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <img 
                src="/logo.png" 
                alt="LicenciasdeSoftware.org" 
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
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
