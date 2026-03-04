import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart, LogOut, Menu, X, ChevronLeft, ChevronRight,
  LayoutDashboard, Store, Headphones, BookOpen, DollarSign,
  Clock, AlertTriangle, Package, Trash2, Plus, Minus, MessageCircle,
  Bell, QrCode, User
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
  shortDescription?: string | null;
  basePrice: number;
  resellerPrice?: number | null;
  imageUrl?: string | null;
  inStock: number;
  orderType?: string;
  showInReseller?: number;
  resellerDescription?: string | null;
}

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  orderType: string;
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
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % announcements.length), 5000);
  };

  useEffect(() => {
    if (announcements.length > 1) resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [announcements.length]);

  const prev = () => { setCurrent((c) => (c - 1 + announcements.length) % announcements.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % announcements.length); resetTimer(); };

  if (announcements.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden h-52 bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white px-8">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-80" />
          <p className="text-lg font-semibold">Sin anuncios activos</p>
        </div>
      </div>
    );
  }

  const ann = announcements[current];
  return (
    <div className="relative rounded-xl overflow-hidden h-52 select-none">
      {ann.imageUrl ? (
        <img src={ann.imageUrl} alt={ann.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-12 text-center text-white">
        <h3 className="text-xl font-bold mb-2 drop-shadow">{ann.title}</h3>
        <p className="text-sm leading-relaxed opacity-90 max-w-xl">{ann.body}</p>
      </div>
      {announcements.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {announcements.map((_, i) => (
              <button key={i} onClick={() => { setCurrent(i); resetTimer(); }}
                className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────
function ProductCard({ product, onBuy, onAddCart, onInfo, isOnDemand }: {
  product: Product;
  onBuy?: () => void;
  onAddCart?: () => void;
  onInfo?: () => void;
  isOnDemand?: boolean;
}) {
  const price = product.resellerPrice ?? product.basePrice;
  const available = product.inStock === 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Product Image — ratio 1:1 */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="px-3 pt-2">
        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{product.name}</p>
      </div>

      {/* Price & Status */}
      <div className="px-3 pt-1 pb-1">
        <p className="text-base font-bold text-gray-900">
          $ {price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
        </p>
        <p className={`text-xs font-medium ${available ? "text-green-600" : "text-red-500"}`}>
          {available ? "Disponible" : "Agotado"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-3 pb-3 mt-auto">
        {isOnDemand ? (
          <div className="flex gap-1.5">
            <button
              onClick={onBuy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors"
            >
              Solicitar
            </button>
            <button
              onClick={onInfo}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold py-1.5 px-2 rounded transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={onBuy}
              disabled={!available}
              className={`flex-1 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors ${
                available ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600 cursor-not-allowed"
              }`}
            >
              {available ? "Comprar" : "Reportar"}
            </button>
            <button
              onClick={onAddCart}
              disabled={!available}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 px-2 rounded transition-colors disabled:opacity-40"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onInfo}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 px-2 rounded transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Floating WhatsApp Cart
// ─────────────────────────────────────────────
function FloatingCart({ cart, onRemove, onUpdateQty, onCheckout, onClear, whatsappPhone, user }: {
  cart: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQty: (id: number, qty: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  whatsappPhone: string | null;
  user: ResellerUser | null;
}) {
  const [open, setOpen] = useState(false);
  const instantItems = cart.filter(i => i.orderType === "instant");
  const onDemandItems = cart.filter(i => i.orderType === "on-demand");
  const instantTotal = instantItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const onDemandTotal = onDemandItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const sendWhatsApp = () => {
    const phone = whatsappPhone?.replace(/\D/g, "") || "";
    if (!phone) { toast.error("El administrador no tiene WhatsApp configurado"); return; }
    const lines = cart.map(i => `• ${i.productName} x${i.quantity} = $${(i.price * i.quantity).toLocaleString("es-CO")} COP`);
    const msg = [
      `🛒 *SOLICITUD DE PEDIDO*`,
      `👤 *Reseller:* ${user?.name || user?.email || ""}`,
      `📧 *Email:* ${user?.email || ""}`,
      ``,
      `*Productos:*`,
      ...lines,
      ``,
      `💰 *Total:* $${(instantTotal + onDemandTotal).toLocaleString("es-CO")} COP`,
    ].join("\n");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (cart.length === 0 && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm">Carrito de Compras</h3>
            <button onClick={() => setOpen(false)} className="hover:bg-blue-700 rounded p-0.5">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Carrito vacío</p>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-blue-600 font-semibold">${(item.price * item.quantity).toLocaleString("es-CO")}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.orderType === "on-demand" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                      {item.orderType === "on-demand" ? "Bajo pedido" : "Instantáneo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)} className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.productId, item.quantity + 1)} className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => onRemove(item.productId)} className="w-5 h-5 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center ml-1">
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="px-3 py-3 border-t border-gray-100 space-y-2">
              {instantItems.length > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Instantáneas:</span>
                  <span className="font-semibold">${instantTotal.toLocaleString("es-CO")} COP</span>
                </div>
              )}
              {onDemandItems.length > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Bajo pedido:</span>
                  <span className="font-semibold">${onDemandTotal.toLocaleString("es-CO")} COP</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t pt-1">
                <span>Total:</span>
                <span>${(instantTotal + onDemandTotal).toLocaleString("es-CO")} COP</span>
              </div>

              {/* Instant checkout (balance) */}
              {instantItems.length > 0 && (
                <button
                  onClick={onCheckout}
                  disabled={!user || instantTotal > (user?.balance ?? 0)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Pagar con saldo (${instantTotal.toLocaleString("es-CO")})
                </button>
              )}

              {/* WhatsApp for on-demand */}
              {onDemandItems.length > 0 && (
                <button
                  onClick={sendWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Solicitar por WhatsApp
                </button>
              )}

              <button onClick={onClear} className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors">
                Vaciar carrito
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Reseller() {
  // hasToken: hay token en localStorage al montar (para saber si verificar)
  const [hasToken] = useState(() => !!localStorage.getItem("resellerToken"));
  // isAuthenticated: true solo cuando tenemos datos del usuario confirmados
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState<ResellerUser | null>(null);
  // orders: se deriva directamente de ordersQuery.data (sin estado intermedio)
  // Usar estado intermedio causaba que el useEffect no se disparara si los datos
  // en caché no cambiaban de referencia, dejando el array siempre vacío.
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "store">("dashboard");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [descModal, setDescModal] = useState<Product | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Announcements
  const announcements: Announcement[] = [
    {
      id: 1,
      title: "⚠️ ATENCIÓN ⚠️",
      body: "Les informamos que tanto los festivos que no tenemos atención y los fines de semana después de nuestro horario, manejaremos atención intermitente, pueden dejar sus mensajes y los atenderemos en cuanto estemos disponibles. Cualquier alteración en nuestro horario de trabajo se los informaremos con previo aviso a través de nuestro grupo.",
    },
  ];

  // ── tRPC utils (debe ir primero para usarlo en mutations) ──
  const utils = trpc.useContext();

  // Verificar token existente UNA SOLA VEZ al montar (solo si había token)
  // NO se ejecuta si el usuario acaba de hacer login (hasToken=false en ese caso)
  const meQuery = trpc.customer.me.useQuery(undefined, {
    enabled: hasToken && !isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Procesar resultado de verificación de token existente
  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data as any);
      setIsAuthenticated(true);
    }
    if (meQuery.error) {
      // Token inválido o expirado: limpiar
      localStorage.removeItem("resellerToken");
      setIsAuthenticated(false);
    }
  }, [meQuery.data, meQuery.error]);

  // Órdenes del cliente
  // IMPORTANTE: No usar enabled:isAuthenticated porque React Query no re-ejecuta
  // automáticamente cuando enabled cambia de false→true en un componente ya montado.
  // En cambio, la query siempre está activa: si no hay token, el servidor devuelve
  // error y ordersQuery.data será undefined (orders=[]).
  // retry:false evita reintentos que podrían causar problemas de auth.
  const ordersQuery = trpc.customer.myOrders.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 segundos de caché
  });

  // Productos: usar data directamente del hook
  const { data: productsData } = trpc.products.list.useQuery(undefined);
  const products: Product[] = (productsData as any) || [];

  // ── tRPC mutations ──
  const registerMutation = trpc.customer.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Cuenta creada exitosamente!");
      setTimeout(() => {
        utils.customer.myOrders.reset();
      }, 300);
    },
    onError: (error) => toast.error(error.message || "Error al registrarse"),
  });

  const loginMutation = trpc.customer.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Bienvenido!");
      // reset() limpia el estado de error de la query (a diferencia de invalidate()
      // que no funciona si la query está en estado 'error' con retry:false)
      // Luego refetch() la ejecuta inmediatamente con el token ya guardado
      setTimeout(() => {
        utils.customer.myOrders.reset();
      }, 300);
    },
    onError: (error) => toast.error(error.message || "Error al iniciar sesión"),
  });

  const { data: whatsappData } = trpc.settings.getWhatsapp.useQuery();
  const whatsappPhone = whatsappData?.phone ?? null;

  const createOrderMutation = trpc.reseller.createOrder.useMutation({
    onSuccess: (data) => {
      if (data.success && user) {
        const instantTotal = cart.filter(i => i.orderType === "instant").reduce((s, i) => s + i.price * i.quantity, 0);
        setUser({ ...user, balance: user.balance - instantTotal });
        toast.success(data.message);
        setCart(prev => prev.filter(i => i.orderType !== "instant"));
        // Refrescar las órdenes para mostrar la compra recién realizada
        utils.customer.myOrders.invalidate();
      }
    },
    onError: (error) => toast.error(error.message || "Error al procesar el pedido"),
  });

  const isLoading = registerMutation.isLoading || loginMutation.isLoading;

  const handleLogout = () => {
    localStorage.removeItem("resellerToken");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setEmail(""); setPassword("");
    toast.success("Sesión cerrada");
  };

  // ── Cart handlers ──
  const addToCart = (product: Product, orderType: string) => {
    const price = product.resellerPrice ?? product.basePrice;
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cart.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price, quantity: 1, orderType }]);
    }
    toast.success("Añadido al carrito");
  };

  const removeFromCart = (productId: number) => setCart(cart.filter((i) => i.productId !== productId));

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) removeFromCart(productId);
    else setCart(cart.map((i) => i.productId === productId ? { ...i, quantity } : i));
  };

  const handleInstantCheckout = () => {
    const instantItems = cart.filter(i => i.orderType === "instant");
    const instantTotal = instantItems.reduce((s, i) => s + i.price * i.quantity, 0);
    if (!user || instantTotal > user.balance) { toast.error("Saldo insuficiente"); return; }
    if (instantItems.length === 0) { toast.error("No hay productos instantáneos en el carrito"); return; }
    createOrderMutation.mutate({
      customerId: user.id,
      items: instantItems as any,
      totalAmount: instantTotal,
    });
  };

  // ── Product sections ──
  // Solo mostrar productos marcados para la tienda reseller
  // Usamos Number() para ser robustos ante string '1' o number 1
  const resellerProducts = products.filter((p) => Number(p.showInReseller) === 1);
  const instantProducts = resellerProducts.filter(p => !p.orderType || p.orderType === "instant");
  const onDemandProducts = resellerProducts.filter(p => p.orderType === "on-demand");

  // Usar ordersQuery.data directamente (sin estado intermedio que puede quedar desincronizado)
  const orders: Order[] = (ordersQuery.data as any) || [];

  // ── Expiring accounts ──
  const now = new Date();
  const expiringOrders = orders.filter((o) => {
    if (!o.expiresAt) return false;
    const exp = new Date(o.expiresAt);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // ─────────────────────────────────────────────
  // LOADING SCREEN (verificando token al recargar)
  // Mostrar spinner solo si había token y aún no se ha verificado
  // ─────────────────────────────────────────────
  if (hasToken && !isAuthenticated && meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Cargando tu sesión...</p>
        </div>
      </div>
    );
  }

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
              <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-2 text-sm font-medium transition-colors ${isLoginMode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                Iniciar Sesión
              </button>
              <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-2 text-sm font-medium transition-colors ${!isLoginMode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                Registrarse
              </button>
            </div>
            <form onSubmit={isLoginMode ? (e) => { e.preventDefault(); loginMutation.mutate({ email, password }); } : (e) => { e.preventDefault(); registerMutation.mutate({ email, password, name, phone }); }} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div><Label>Nombre</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" /></div>
                  <div><Label>Teléfono</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+573001234567" /></div>
                </>
              )}
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required /></div>
              <div><Label>Contraseña</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required /></div>
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
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-1">
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <span className="text-lg font-bold text-blue-700 uppercase tracking-wide">Reseller</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${activeTab === id ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-blue-700"}`}>
                  {label}
                </button>
              ))}
              <a href="#" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700">Mis Reportes</a>
              <a href="#" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700">Tutoriales</a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex p-2 text-gray-500 hover:text-blue-700 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-1.5">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-bold">${(user?.balance ?? 0).toLocaleString("es-CO")}</span>
              </div>
              <button className="hidden sm:flex p-2 text-gray-500 hover:text-blue-700 transition-colors">
                <QrCode className="h-5 w-5" />
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Cerrar sesión">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {showMobileMenu && (
            <nav className="md:hidden pb-3 flex flex-col gap-1 border-t border-gray-100 pt-2">
              {navItems.map(({ id, label }) => (
                <button key={id} onClick={() => { setActiveTab(id as any); setShowMobileMenu(false); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${activeTab === id ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}>
                  {label}
                </button>
              ))}
              <a href="#" className="px-3 py-2 text-sm text-gray-600">Mis Reportes</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-600">Tutoriales</a>
            </nav>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* ════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <AnnouncementCarousel announcements={announcements} />
              </div>
              <div className="flex flex-col gap-4">
                {/* Saldo */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-700 font-bold text-lg">Saldo Actual</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Mira tu saldo en tiempo real</p>
                    <p className="text-2xl font-bold text-blue-700 mt-2">
                      ${(user?.balance ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                {/* Compras recientes */}
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
                  <button onClick={() => setActiveTab("store")} className="text-blue-600 text-xs underline mt-3 block">Ver más</button>
                </div>
              </div>
            </div>

            {/* Cuentas próximas a vencer */}
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
                      {["Producto", "Datos de cuenta", "Fecha de compra", "Fecha de vencimiento", "Vence en"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiringOrders.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No hay licencias a punto de vencer.</td></tr>
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
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${diffDays <= 2 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
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
          <div className="space-y-8">
            {/* Announcement carousel in store too */}
            <AnnouncementCarousel announcements={announcements} />

            {/* ── Cuentas Instantáneas ── */}
            {instantProducts.length > 0 && (
              <section>
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">Cuentas Instantáneas</h2>
                  <div className="w-24 h-0.5 bg-blue-700 mx-auto mt-1 mb-2" />
                  <p className="text-gray-500 text-sm">Podras comprar las siguientes cuentas de forma inmediata con el saldo que tengas en la plataforma.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {instantProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isOnDemand={false}
                      onBuy={() => {
                        if (!product.inStock) { toast.error("Producto agotado"); return; }
                        addToCart(product, "instant");
                      }}
                      onAddCart={() => addToCart(product, "instant")}
                      onInfo={() => setDescModal(product)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cuentas Bajo Pedido */}
            {onDemandProducts.length > 0 && (
              <section>
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">Cuentas Bajo Pedido</h2>
                  <div className="w-24 h-0.5 bg-blue-700 mx-auto mt-1 mb-2" />
                  <p className="text-sm text-gray-500">Podrás comprar las siguientes cuentas realizando la solicitud via WhatsApp dentro de nuestro horario.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {onDemandProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isOnDemand={true}
                      onBuy={() => addToCart(product, "on-demand")}
                      onAddCart={() => addToCart(product, "on-demand")}
                      onInfo={() => setDescModal(product)}
                    />
                  ))}
                </div>
              </section>
            )}

            {resellerProducts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay productos disponibles en la tienda reseller aún.</p>
                <p className="text-xs mt-1">El administrador debe activar productos desde el panel de administración.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Description Modal ── */}
      {descModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setDescModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {descModal.imageUrl && (
                  <img
                    src={descModal.imageUrl}
                    alt={descModal.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{descModal.name}</h3>
                  <p className="text-blue-700 font-semibold text-sm mt-0.5">
                    $ {(descModal.resellerPrice ?? descModal.basePrice).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDescModal(null)}
                className="ml-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Modal body */}
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {descModal.resellerDescription || descModal.description || "Sin descripci\u00f3n disponible."}
              </p>
            </div>
            {/* Modal footer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setDescModal(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Cart ── */}
      <FloatingCart
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        onCheckout={handleInstantCheckout}
        onClear={() => setCart([])}
        whatsappPhone={whatsappPhone}
        user={user}
      />
    </div>
  );
}
