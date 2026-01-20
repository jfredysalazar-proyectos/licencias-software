import { ShoppingCart, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { useState, useEffect } from "react";

interface HeaderProps {
  onCartClick: () => void;
  onSearchClick?: () => void;
}

export default function Header({ onCartClick, onSearchClick }: HeaderProps) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const data = localStorage.getItem("customerData");
    if (token && data) {
      setCustomerData(JSON.parse(data));
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-card border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <img 
                src="/logo.png" 
                alt="LicenciasdeSoftware.org" 
                className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
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
              {customerData ? (
                <Link href="/mi-cuenta">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {customerData.name || "Mi Cuenta"}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
