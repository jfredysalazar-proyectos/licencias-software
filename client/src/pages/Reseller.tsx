import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, LogOut, Menu, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ResellerUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  balance: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  resellerPrice?: number;
  imageUrl?: string;
  inStock: number;
}

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export default function Reseller() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState<ResellerUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Mutations and Queries
  const registerMutation = trpc.customer.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Cuenta creada exitosamente!");
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrarse");
    }
  });

  const loginMutation = trpc.customer.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Bienvenido!");
    },
    onError: (error) => {
      toast.error(error.message || "Error al iniciar sesión");
    }
  });

  const meQuery = trpc.customer.me.useQuery(undefined, {
    enabled: !!localStorage.getItem("resellerToken"),
    retry: false,
    onSuccess: (data) => {
      setUser(data as any);
      setIsAuthenticated(true);
    },
    onError: () => {
      localStorage.removeItem("resellerToken");
    }
  });

  const productsQuery = trpc.products.list.useQuery(undefined, {
    onSuccess: (data) => {
      setProducts(data as any);
    }
  });

  const createOrderMutation = trpc.reseller.createOrder.useMutation({
    onSuccess: (data) => {
      if (data.success && user) {
        setUser({
          ...user,
          balance: user.balance - totalPrice,
        });
        toast.success(data.message);
        setCart([]);
        setShowCart(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al procesar el pedido");
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, name, phone });
  };

  const isLoading = isLoadingState || registerMutation.isLoading || loginMutation.isLoading || createOrderMutation.isLoading;

  const handleLogout = () => {
    localStorage.removeItem("resellerToken");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setEmail("");
    setPassword("");
    toast.success("Sesión cerrada");
  };

  const addToCart = (product: Product) => {
    const price = product.resellerPrice || product.basePrice;
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price,
          quantity: 1,
        },
      ]);
    }
    toast.success("Producto añadido al carrito");
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user || totalPrice > user.balance) {
      toast.error("Saldo insuficiente");
      return;
    }

    if (cart.length === 0) {
      toast.error("Carrito vacío");
      return;
    }

    createOrderMutation.mutate({
      customerId: user.id,
      items: cart as any,
      totalAmount: totalPrice,
    });
  };

  // Pagination
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(products.length / itemsPerPage);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required={!isLoginMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+573001234567"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cargando..." : isLoginMode ? "Iniciar Sesión" : "Registrarse"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLoginMode ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden"
              >
                {showMobileMenu ? <X /> : <Menu />}
              </button>
              <h1 className="text-2xl font-bold text-blue-600">Reseller</h1>
            </div>

            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Panel
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Tienda
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Soporte
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Tutoriales
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Saldo Disponible</p>
                <p className="text-lg font-bold text-green-600">
                  ${user?.balance.toLocaleString("es-CO")} COP
                </p>
              </div>
              <Button variant="outline" size="sm">
                Recargar
              </Button>
              <div className="relative">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <nav className="md:hidden pb-4 flex flex-col gap-2">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Panel
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Tienda
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Soporte
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Tutoriales
              </a>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Carrito de Compras</h2>
                <button onClick={() => setShowCart(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrito vacío</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.productId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{item.productName}</h3>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            ${item.price.toLocaleString("es-CO")} COP
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, parseInt(e.target.value))
                            }
                            className="w-12 border rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg">
                        ${totalPrice.toLocaleString("es-CO")} COP
                      </span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={totalPrice > (user?.balance || 0)}
                    >
                      Confirmar Compra
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Cuentas Instantáneas</h2>
          <p className="text-gray-600 mb-8">
            Compra las siguientes cuentas de forma inmediata con el saldo que tengas en la plataforma.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {paginatedProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ${(product.resellerPrice || product.basePrice).toLocaleString("es-CO")}
                  </p>
                  <div className="flex gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "Disponible" : "Agotado"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="flex-1 text-sm"
                    >
                      Comprar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
