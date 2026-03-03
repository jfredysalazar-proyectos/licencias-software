import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Info, LayoutDashboard, Store, Headphones, BookOpen, DollarSign,
  Clock, AlertTriangle, Package
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ResellerUser {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
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

interface Order {
  id: number;
  items: string;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  imageUrl?: string;
}

// ─────────────────────────────────────────────
// Announcement Carousel
// ─────────────────────────────────────────────
function AnnouncementCarousel({ announcements }: { announcements: Announcement[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % announcements.length);
    }, 5000);
  };

  useEffect(() => {
    if (announcements.length > 1) resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [announcements.length]);

  const prev = () => { setCurrent((c) => (c - 1 + announcements.length) % announcements.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % announcements.length); resetTimer(); };

  if (announcements.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden h-56 bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white px-8">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-80" />
          <p className="text-lg font-semibold">Sin anuncios activos</p>
          <p className="text-sm opacity-75 mt-1">Los anuncios del administrador aparecerán aquí.</p>
        </div>
      </div>
    );
  }

  const ann = announcements[current];

  return (
    <div className="relative rounded-xl overflow-hidden h-56 select-none">
      {/* Background */}
      {ann.imageUrl ? (
        <img src={ann.imageUrl} alt={ann.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-12 text-center text-white">
        <h3 className="text-xl font-bold mb-2 drop-shadow">{ann.title}</h3>
        <p className="text-sm leading-relaxed opacity-90 max-w-xl">{ann.body}</p>
      </div>

      {/* Nav arrows */}
      {announcements.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Reseller() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState<ResellerUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "store">("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Static announcements (can be replaced with API call later)
  const announcements: Announcement[] = [
    {
      id: 1,
      title: "⚠️ ATENCIÓN ⚠️",
      body: "Les informamos que tanto los festivos que no tenemos atención y los fines de semana después de nuestro horario, manejaremos atención intermitente, pueden dejar sus mensajes y los atenderemos en cuanto estemos disponibles. Cualquier alteración en nuestro horario de trabajo se los informaremos con previo aviso a través de nuestro grupo.",
    },
  ];

  // ── tRPC ──
  const registerMutation = trpc.customer.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Cuenta creada exitosamente!");
    },
    onError: (error) => toast.error(error.message || "Error al registrarse"),
  });

  const loginMutation = trpc.customer.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Bienvenido!");
    },
    onError: (error) => toast.error(error.message || "Error al iniciar sesión"),
  });

  trpc.customer.me.useQuery(undefined, {
    enabled: !!localStorage.getItem("resellerToken"),
    retry: false,
    onSuccess: (data) => { setUser(data as any); setIsAuthenticated(true); },
    onError: () => localStorage.removeItem("resellerToken"),
  });

  trpc.products.list.useQuery(undefined, {
    onSuccess: (data) => setProducts(data as any),
  });

  trpc.customer.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
    onSuccess: (data) => setOrders(data as any),
  });

  const createOrderMutation = trpc.reseller.createOrder.useMutation({
    onSuccess: (data) => {
      if (data.success && user) {
        setUser({ ...user, balance: user.balance - totalPrice });
        toast.success(data.message);
        setCart([]);
        setShowCart(false);
      }
    },
    onError: (error) => toast.error(error.message || "Error al procesar el pedido"),
  });

  // ── Handlers ──
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); loginMutation.mutate({ email, password }); };
  const handleRegister = (e: React.FormEvent) => { e.preventDefault(); registerMutation.mutate({ email, password, name, phone }); };
  const isLoading = registerMutation.isLoading || loginMutation.isLoading || createOrderMutation.isLoading;

  const handleLogout = () => {
    localStorage.removeItem("resellerToken");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setEmail(""); setPassword("");
    toast.success("Sesión cerrada");
  };

  const addToCart = (product: Product) => {
    const price = product.resellerPrice || product.basePrice;
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cart.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price, quantity: 1 }]);
    }
    toast.success("Producto añadido al carrito");
  };

  const removeFromCart = (productId: number) => setCart(cart.filter((i) => i.productId !== productId));

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) removeFromCart(productId);
    else setCart(cart.map((i) => i.productId === productId ? { ...i, quantity } : i));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = () => {
    if (!user || totalPrice > user.balance) { toast.error("Saldo insuficiente"); return; }
    if (cart.length === 0) { toast.error("Carrito vacío"); return; }
    createOrderMutation.mutate({ customerId: user.id, items: cart as any, totalAmount: totalPrice });
  };

  // ── Pagination ──
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // ── Expiring accounts (orders with expiresAt within 7 days) ──
  const now = new Date();
  const expiringOrders = orders.filter((o) => {
    if (!o.expiresAt) return false;
    const exp = new Date(o.expiresAt);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  // ── Recent orders (last 5) ──
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // ─────────────────────────────────────────────
  // LOGIN / REGISTER SCREEN
  // ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 text-white text-center">
            <h1 className="text-3xl font-bold">Portal Reseller</h1>
            <p className="text-blue-100 mt-1 text-sm">Licencias de Software Colombia</p>
          </div>
          <div className="px-8 py-6">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
              <button
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${isLoginMode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${!isLoginMode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+573001234567" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Cargando..." : isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // AUTHENTICATED LAYOUT
  // ─────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Panel", icon: LayoutDashboard },
    { id: "store", label: "Tienda", icon: Store },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + mobile menu toggle */}
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-1">
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <span className="text-xl font-bold text-blue-700">Reseller</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <a href="#" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Headphones className="h-4 w-4" /> Soporte
              </a>
              <a href="#" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                <BookOpen className="h-4 w-4" /> Tutoriales
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">Saldo</p>
                <p className="text-base font-bold text-green-600">${(user?.balance ?? 0).toLocaleString("es-CO")} COP</p>
              </div>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 text-gray-600 hover:text-blue-700 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                    {cart.length}
                  </span>
                )}
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">Salir</span>
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          {showMobileMenu && (
            <nav className="md:hidden pb-3 flex flex-col gap-1 border-t border-gray-100 pt-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id as any); setShowMobileMenu(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    activeTab === id ? "bg-blue-50 text-blue-700" : "text-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600"><Headphones className="h-4 w-4" /> Soporte</a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600"><BookOpen className="h-4 w-4" /> Tutoriales</a>
            </nav>
          )}
        </div>
      </header>

      {/* ── Cart Sidebar ── */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Carrito de Compras</h2>
              <button onClick={() => setShowCart(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Carrito vacío</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.productId} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{item.productName}</h3>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">${item.price.toLocaleString("es-CO")} COP</span>
                        <input
                          type="number" min="1" value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                          className="w-14 border rounded px-2 py-1 text-sm text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4 font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toLocaleString("es-CO")} COP</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full bg-blue-600 hover:bg-blue-700" disabled={totalPrice > (user?.balance || 0) || createOrderMutation.isLoading}>
                    {createOrderMutation.isLoading ? "Procesando..." : "Confirmar Compra"}
                  </Button>
                  {totalPrice > (user?.balance || 0) && (
                    <p className="text-red-500 text-xs text-center mt-2">Saldo insuficiente</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top grid: Carousel + Side cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Announcement Carousel — 2/3 width */}
              <div className="lg:col-span-2">
                <AnnouncementCarousel announcements={announcements} />
              </div>

              {/* Side cards — 1/3 width */}
              <div className="flex flex-col gap-4">
                {/* Saldo Actual */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-700 font-bold text-lg">Saldo Actual</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Mira tu saldo en tiempo real</p>
                    <p className="text-2xl font-bold text-blue-700 mt-2">
                      ${(user?.balance ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center shadow-lg">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-10 h-4 bg-blue-900 rounded-full opacity-60" />
                    </div>
                  </div>
                </div>

                {/* Compras Recientes */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
                  <h3 className="text-blue-700 font-bold text-lg">Compras Recientes</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Últimas compras realizadas en la plataforma</p>
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm mt-3">No hay compras aún.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {recentOrders.slice(0, 3).map((o) => {
                        let items: any[] = [];
                        try { items = JSON.parse(o.items); } catch {}
                        return (
                          <li key={o.id} className="text-xs text-gray-600 flex justify-between">
                            <span className="truncate max-w-[140px]">{items[0]?.productName || `Pedido #${o.id}`}</span>
                            <span className="font-medium text-blue-700 ml-2">${(o.totalAmount ?? 0).toLocaleString("es-CO")}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button
                    onClick={() => setActiveTab("store")}
                    className="text-blue-600 text-xs underline mt-3 block"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>

            {/* Cuentas Próximas a Vencer */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-700 text-base">Cuentas próximas a vencer</h3>
                  <p className="text-gray-500 text-xs">Cuentas que vencerán en los próximos días, no olvides avisarle a tu cliente.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="px-4 py-2.5 text-left font-semibold text-xs">Producto</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-xs">Datos de cuenta</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-xs">Fecha de compra</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-xs">Fecha de vencimiento</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-xs">Vence en</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiringOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                          No hay licencias a punto de vencer.
                        </td>
                      </tr>
                    ) : (
                      expiringOrders.map((o) => {
                        let items: any[] = [];
                        try { items = JSON.parse(o.items); } catch {}
                        const exp = new Date(o.expiresAt!);
                        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{items[0]?.productName || `Pedido #${o.id}`}</td>
                            <td className="px-4 py-3 text-gray-500">—</td>
                            <td className="px-4 py-3 text-gray-600">{new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
                            <td className="px-4 py-3 text-gray-600">{exp.toLocaleDateString("es-CO")}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                diffDays <= 2 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {diffDays} día{diffDays !== 1 ? "s" : ""}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 text-center">
                <button className="text-blue-600 text-xs underline">Ver más</button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STORE TAB
        ════════════════════════════════ */}
        {activeTab === "store" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cuentas Instantáneas</h2>
              <p className="text-gray-500 mt-1 text-sm">Compra las siguientes cuentas de forma inmediata con el saldo que tengas en la plataforma.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <Package className="h-10 w-10 text-blue-300" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-xs text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-blue-700 mb-2">
                      ${(product.resellerPrice || product.basePrice).toLocaleString("es-CO")}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${
                      product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.inStock ? "Disponible" : "Agotado"}
                    </span>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
