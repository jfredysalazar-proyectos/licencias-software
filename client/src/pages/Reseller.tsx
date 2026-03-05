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

interface Tutorial {
  id: string;
  title: string;
  youtubeUrl: string;
}

// Helper: extraer ID de YouTube de cualquier formato de URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)?([\w-]{11})(?:[?&]|$)/,
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  // Patrón más robusto
  const robust = /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const m = url.match(robust);
  return m ? m[1] : null;
}

interface CarouselSlide {
  id: string;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
}

// ─────────────────────────────────────────────
// Shared Carousel Inner Content
// ─────────────────────────────────────────────
function CarouselInner({
  slides, current, prev, next, setCurrent, resetTimer,
}: {
  slides: CarouselSlide[];
  current: number;
  prev: () => void;
  next: () => void;
  setCurrent: (i: number) => void;
  resetTimer: () => void;
}) {
  const slide = slides[current];
  return (
    <div className="relative w-full h-full select-none">
      <img
        src={slide.imageUrl}
        alt={slide.title || `Slide ${current + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {slide.title && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-5 pb-3 sm:pb-4 z-10">
            <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-md line-clamp-2">{slide.title}</p>
          </div>
        </>
      )}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 sm:p-1.5 transition-colors touch-manipulation"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 sm:p-1.5 transition-colors touch-manipulation"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); resetTimer(); }}
                className={`h-1.5 sm:h-2 rounded-full transition-all touch-manipulation ${
                  i === current ? "w-4 sm:w-5 bg-white" : "w-1.5 sm:w-2 bg-white/50"
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Image Carousel (Panel Dashboard) — Responsive
// ─────────────────────────────────────────────
function ImageCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1)
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
  };

  useEffect(() => {
    setCurrent(0); resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const prev = () => { setCurrent((c) => (c - 1 + slides.length) % slides.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % slides.length); resetTimer(); };

  if (slides.length === 0) return null;

  const slide = slides[current];
  const inner = <CarouselInner slides={slides} current={current} prev={prev} next={next} setCurrent={setCurrent} resetTimer={resetTimer} />;

  return (
    // En móvil: aspect-ratio 4/3 para que sea más alto y visible
    // En tablet/desktop: altura fija clamp para coincidir con el grid
    <div
      className="relative rounded-xl overflow-hidden bg-gray-200 w-full"
      style={{ height: "clamp(180px, 42vw, 550px)" }}
    >
      {slide.linkUrl ? (
        <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 block">{inner}</a>
      ) : (
        <div className="absolute inset-0">{inner}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Banner Carousel (Tienda) — Responsive
// ─────────────────────────────────────────────
function BannerCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1)
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
  };

  useEffect(() => {
    setCurrent(0); resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const prev = () => { setCurrent((c) => (c - 1 + slides.length) % slides.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % slides.length); resetTimer(); };

  if (slides.length === 0) return null;

  const slide = slides[current];
  const inner = <CarouselInner slides={slides} current={current} prev={prev} next={next} setCurrent={setCurrent} resetTimer={resetTimer} />;

  return (
    // En móvil: altura mínima de 110px, en desktop hasta 310px
    // Proporción 1800/310 ≈ 5.8:1 — usamos clamp para que sea usable en móvil
    <div
      className="relative rounded-xl overflow-hidden bg-gray-200 w-full"
      style={{ height: "clamp(110px, 17vw, 310px)" }}
    >
      {slide.linkUrl ? (
        <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 block">{inner}</a>
      ) : (
        <div className="absolute inset-0">{inner}</div>
      )}
    </div>
  );
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
// Floating WhatsApp Support Button
// ─────────────────────────────────────────────
const WHATSAPP_SUPPORT_PHONE = "573334315646";

function FloatingWhatsAppSupport({ user }: { user: ResellerUser | null }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    const name = user?.name || user?.email || "Reseller";
    const msg = [
      `Hola, soy *${name}* y tengo una consulta como Reseller de Licencias de Software Colombia.`,
      ``,
      `Por favor, ¿me pueden ayudar?`,
    ].join("\n");
    window.open(
      `https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-2">
      {/* Tooltip */}
      {hovered && (
        <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
          Soporte Reseller
        </div>
      )}
      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Contactar soporte por WhatsApp"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ background: "#25D366" }}
        aria-label="Soporte WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8"
          fill="white"
        >
          <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.675 1.817 6.699L2.667 29.333l6.797-1.783A13.28 13.28 0 0 0 16.003 29.333c7.363 0 13.33-5.97 13.33-13.333 0-7.363-5.967-13.333-13.33-13.333zm0 24.267a11.02 11.02 0 0 1-5.617-1.537l-.403-.24-4.033 1.057 1.077-3.923-.263-.413A10.99 10.99 0 0 1 5.003 16c0-6.067 4.933-11 11-11s11 4.933 11 11-4.933 11-11 11zm6.04-8.23c-.33-.167-1.953-.963-2.257-1.073-.303-.11-.523-.167-.743.167-.22.33-.853 1.073-1.047 1.293-.193.22-.387.247-.717.083-.33-.167-1.393-.513-2.653-1.637-.98-.873-1.643-1.953-1.837-2.283-.193-.33-.02-.51.147-.673.15-.147.33-.383.497-.573.167-.19.22-.33.33-.55.11-.22.057-.413-.027-.58-.083-.167-.743-1.793-1.017-2.457-.267-.643-.54-.557-.743-.567l-.633-.01c-.22 0-.577.083-.88.413-.303.33-1.153 1.127-1.153 2.747s1.18 3.187 1.343 3.407c.167.22 2.323 3.547 5.627 4.973.787.34 1.4.543 1.877.697.787.25 1.503.213 2.07.13.633-.093 1.953-.797 2.227-1.567.273-.77.273-1.43.19-1.567-.08-.137-.3-.22-.63-.387z" />
        </svg>
      </button>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "store" | "support" | "tutorials">("dashboard");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [descModal, setDescModal] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  // Órdenes: fetch directo (no React Query) para evitar problemas de caché/estado
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("resellerToken");
    if (!token) return;
    try {
      const res = await fetch("/api/trpc/customer.myOrders?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json?.[0]?.result?.data?.json;
      if (Array.isArray(data)) setOrders(data);
    } catch {}
  };

  // Cargar órdenes cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

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
      setTimeout(() => fetchOrders(), 300);
    },
    onError: (error) => toast.error(error.message || "Error al registrarse"),
  });

  const loginMutation = trpc.customer.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("resellerToken", data.token);
      setUser(data.customer as any);
      setIsAuthenticated(true);
      toast.success("¡Bienvenido!");
      setTimeout(() => fetchOrders(), 300);
    },
    onError: (error) => toast.error(error.message || "Error al iniciar sesión"),
  });

  const { data: whatsappData } = trpc.settings.getWhatsapp.useQuery();
  const whatsappPhone = whatsappData?.phone ?? null;

  const { data: announcementData } = trpc.settings.getAnnouncement.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  const announcementMessage = announcementData?.message || "";

  const { data: carouselData } = trpc.settings.getResellerCarousel.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const carouselSlides: CarouselSlide[] = (carouselData?.slides as CarouselSlide[]) || [];

  const { data: storeBannerData } = trpc.settings.getResellerStoreBanner.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const bannerSlides: CarouselSlide[] = (storeBannerData?.slides as CarouselSlide[]) || [];

  const { data: tutorialsData } = trpc.settings.getTutorials.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: paymentConfigData } = trpc.settings.getPaymentConfig.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const paymentConfig = paymentConfigData || { nequiQr: "", daviviendaQr: "", instructions: "", whatsappPhone: "", whatsappMessage: "" };
  // Videos de prueba por defecto si no hay tutoriales configurados
  const DEFAULT_TUTORIALS: Tutorial[] = [
    {
      id: "demo1",
      title: "Cómo instalar Windows 11 paso a paso",
      youtubeUrl: "https://www.youtube.com/watch?v=tPGRTHFJNaA",
    },
    {
      id: "demo2",
      title: "Cómo activar Microsoft Office 365",
      youtubeUrl: "https://www.youtube.com/watch?v=5bFCMoLF4Ck",
    },
    {
      id: "demo3",
      title: "Cómo instalar y activar Adobe Photoshop",
      youtubeUrl: "https://www.youtube.com/watch?v=wRCBZOH1cAI",
    },
  ];
  const tutorials: Tutorial[] = (tutorialsData?.tutorials as Tutorial[])?.length
    ? (tutorialsData!.tutorials as Tutorial[])
    : DEFAULT_TUTORIALS;

  const createOrderMutation = trpc.reseller.createOrder.useMutation({
    onSuccess: (data) => {
      if (data.success && user) {
        const instantItems = cart.filter(i => i.orderType === "instant");
        const instantTotal = instantItems.reduce((s, i) => s + i.price * i.quantity, 0);
        setUser({ ...user, balance: user.balance - instantTotal });
        toast.success(data.message);
        // Refrescar las órdenes para mostrar la compra recién realizada
        fetchOrders();
        // Abrir WhatsApp con los detalles del pedido
        const phone = whatsappPhone?.replace(/\D/g, "") || "";
        if (phone) {
          const lines = instantItems.map(i => `• ${i.productName} x${i.quantity} = $${(i.price * i.quantity).toLocaleString("es-CO")} COP`);
          const orderId = (data as any).orderId ? `#${(data as any).orderId}` : "";
          const msg = [
            `🛒 *NUEVO PEDIDO RESELLER ${orderId}*`,
            `👤 *Reseller:* ${user.name || user.email || ""}`,
            `📧 *Email:* ${user.email || ""}`,
            `📱 *Teléfono:* ${user.phone || "No registrado"}`,
            ``,
            `*Productos:*`,
            ...lines,
            ``,
            `💰 *Total pagado:* $${instantTotal.toLocaleString("es-CO")} COP`,
            `✅ *Pago:* Descontado del saldo de la plataforma`,
          ].join("\n");
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
        }
        setCart(prev => prev.filter(i => i.orderType !== "instant"));
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

  // ── Expiring accounts ──
  const now = new Date();
  const expiringOrders = orders
    .filter((o) => {
      if (!o.expiresAt) return false;
      const exp = new Date(o.expiresAt);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    })
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);

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
    { id: "support", label: "Soporte", icon: Headphones },
    { id: "tutorials", label: "Tutoriales", icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Barra de Anuncios Ticker ── */}
      {announcementMessage && (
        <div className="bg-blue-900 text-white overflow-hidden" style={{ height: "36px" }}>
          <div className="flex items-center h-full">
            <div className="shrink-0 bg-blue-700 px-3 h-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <span>📢</span>
              <span>Aviso</span>
            </div>
            <div className="overflow-hidden flex-1 relative">
              <div
                className="flex whitespace-nowrap"
                style={{
                  animation: "ticker-scroll 30s linear infinite",
                }}
              >
                <span className="text-sm px-8">{announcementMessage}</span>
                <span className="text-sm px-8" aria-hidden="true">{announcementMessage}</span>
                <span className="text-sm px-8" aria-hidden="true">{announcementMessage}</span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes ticker-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
          `}</style>
        </div>
      )}

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

            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex p-2 text-gray-500 hover:text-blue-700 transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              {/* Saldo + Agregar Saldo */}
              <div className="hidden sm:flex flex-col items-center">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-bold">${(user?.balance ?? 0).toLocaleString("es-CO")}</span>
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-0.5 leading-none transition-colors"
                >
                  + Agregar Saldo
                </button>
              </div>

              {/* Botón QR = Agregar Saldo */}
              <button
                onClick={() => setShowPaymentModal(true)}
                className="hidden sm:flex p-2 text-gray-500 hover:text-blue-700 transition-colors"
                title="Agregar Saldo"
              >
                <QrCode className="h-5 w-5" />
              </button>

              {/* Móvil: botón Agregar Saldo */}
              <button
                onClick={() => setShowPaymentModal(true)}
                className="sm:hidden flex items-center gap-1 bg-blue-600 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <DollarSign className="h-3.5 w-3.5" />
                ${(user?.balance ?? 0).toLocaleString("es-CO")}
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

            </nav>
          )}
        </div>
      </header>

      {/* ────────────────────────────────
          MODAL: AGREGAR SALDO
      ──────────────────────────────── */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-xl p-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Agregar Saldo</h2>
                  <p className="text-xs text-gray-500">Selecciona tu método de pago preferido</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Instrucciones */}
              {paymentConfig.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{paymentConfig.instructions}</p>
                </div>
              )}

              {/* QR Cards */}
              {(paymentConfig.nequiQr || paymentConfig.daviviendaQr) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentConfig.nequiQr && (
                    <div className="border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3 bg-white shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span className="font-bold text-gray-800 text-sm">Nequi</span>
                      </div>
                      <img
                        src={paymentConfig.nequiQr}
                        alt="QR Nequi"
                        className="w-full max-w-[180px] h-auto object-contain rounded-xl border border-gray-100"
                      />
                      <p className="text-xs text-gray-500 text-center">Escanea con tu app Nequi</p>
                    </div>
                  )}
                  {paymentConfig.daviviendaQr && (
                    <div className="border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3 bg-white shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="font-bold text-gray-800 text-sm">Davivienda</span>
                      </div>
                      <img
                        src={paymentConfig.daviviendaQr}
                        alt="QR Davivienda"
                        className="w-full max-w-[180px] h-auto object-contain rounded-xl border border-gray-100"
                      />
                      <p className="text-xs text-gray-500 text-center">Escanea con tu app Davivienda</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <QrCode className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Métodos de pago no configurados aún.</p>
                  <p className="text-xs mt-1">Contacta al administrador para más información.</p>
                </div>
              )}

              {/* Botón Reportar Pago por WhatsApp */}
              {(paymentConfig.whatsappPhone || "573334315646") && (
                <a
                  href={`https://wa.me/${paymentConfig.whatsappPhone || "573334315646"}?text=${encodeURIComponent(paymentConfig.whatsappMessage || `Hola, quiero reportar un pago para recargar mi saldo reseller.\n\nUsuario: ${user?.email || ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Reportar Pago por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* ════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                {/* Carrusel de imágenes si hay slides, si no muestra el AnnouncementCarousel */}
                {carouselSlides.length > 0 ? (
                  <ImageCarousel slides={carouselSlides} />
                ) : (
                  <AnnouncementCarousel announcements={announcements} />
                )}
              </div>
              <div className="flex flex-col gap-4">
                {/* Saldo */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between">
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
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Saldo
                  </button>
                </div>
                {/* Compras recientes */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
                  <h3 className="text-blue-700 font-bold text-lg">Compras Recientes</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Últimas compras realizadas en la plataforma</p>
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm mt-3">No hay compras aún.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {(showAllRecent ? recentOrders : recentOrders.slice(0, 3)).map((o) => {
                        let items: any[] = [];
                        try { items = JSON.parse(o.items); } catch {}
                        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) : "";
                        return (
                          <li key={o.id} className="text-xs text-gray-600 flex justify-between items-center border-b border-gray-50 pb-1.5">
                            <div className="flex flex-col min-w-0">
                              <span className="truncate max-w-[160px] font-medium">{items[0]?.productName || `Pedido #${o.id}`}</span>
                              <span className="text-gray-400 text-[10px]">{dateStr} · Pedido #{o.id}</span>
                            </div>
                            <span className="font-semibold text-blue-700 ml-2 shrink-0">${(o.totalAmount ?? 0).toLocaleString("es-CO")}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {recentOrders.length > 3 && (
                    <button
                      onClick={() => setShowAllRecent(!showAllRecent)}
                      className="text-blue-600 text-xs underline mt-3 block hover:text-blue-800 transition-colors"
                    >
                      {showAllRecent ? "Ver menos" : `Ver más (${recentOrders.length - 3} más)`}
                    </button>
                  )}
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
                        try {
                          // Intentar parsear el JSON; si falla por caracteres de control, limpiarlos
                          try { items = JSON.parse(o.items); }
                          catch { items = JSON.parse(o.items.replace(/[\x00-\x1F\x7F]/g, ' ')); }
                        } catch {}
                        // Decodificar accountData si está en base64
                        const rawAccountData = items[0]?.accountData;
                        let accountDataText = '';
                        if (rawAccountData) {
                          if (items[0]?.accountDataEncoded) {
                            try { accountDataText = atob(rawAccountData); } catch { accountDataText = rawAccountData; }
                          } else {
                            accountDataText = rawAccountData;
                          }
                        }
                        const exp = new Date(o.expiresAt!);
                        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                         <tr key={o.id} className="hover:bg-gray-50">
                             <td className="px-4 py-3 font-medium">{items[0]?.productName || `Pedido #${o.id}`}</td>
                             <td className="px-4 py-3">
                               {accountDataText ? (
                                 <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 whitespace-pre-wrap break-words max-w-xs font-mono">{accountDataText}</pre>
                               ) : (
                                 <span className="text-gray-400 text-xs italic">Sin datos</span>
                               )}
                             </td>
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
            TUTORIALS TAB
        ════════════════════════════════ */}
        {activeTab === "tutorials" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-red-100 rounded-xl p-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Tutoriales</h2>
              </div>
              <p className="text-sm text-gray-500 ml-12">Aprende a instalar, configurar y activar los programas y licencias que adquieres en nuestra plataforma.</p>
            </div>

            {/* Grid de videos */}
            {tutorials.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400 text-sm">No hay tutoriales disponibles aún.</p>
                <p className="text-gray-400 text-xs mt-1">El administrador puede agregar videos desde el panel de configuración.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tutorials.map((tut) => {
                  const ytId = extractYouTubeId(tut.youtubeUrl);
                  const thumbUrl = ytId
                    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                    : null;
                  const embedUrl = ytId
                    ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`
                    : null;
                  return (
                    <div
                      key={tut.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                      {/* Miniatura / Reproductor */}
                      <div className="relative bg-gray-900" style={{ aspectRatio: "16/9" }}>
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={tut.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                            loading="lazy"
                          />
                        ) : thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={tut.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-gray-500" />
                          </div>
                        )}
                      </div>
                      {/* Título */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                          {tut.title || "Sin título"}
                        </h3>
                        {tut.youtubeUrl && (
                          <a
                            href={tut.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current flex-shrink-0"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            Ver en YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            SUPPORT TAB
        ════════════════════════════════ */}
        {activeTab === "support" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-blue-100 rounded-xl p-2">
                  <Headphones className="h-5 w-5 text-blue-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Soporte de Compras</h2>
              </div>
              <p className="text-sm text-gray-500 ml-12">Aquí puedes ver todas tus órdenes y solicitar soporte directo para cualquier compra.</p>
            </div>

            {/* Tabla de órdenes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Historial de Pedidos</h3>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      {["Fecha y N° Pedido", "Datos de la Cuenta", "Pedir Soporte"].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-gray-400 text-sm">
                          <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          No tienes pedidos registrados aún.
                        </td>
                      </tr>
                    ) : (
                      [...orders]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((o) => {
                          let items: any[] = [];
                          try {
                            try { items = JSON.parse(o.items); }
                            catch { items = JSON.parse(o.items.replace(/[\x00-\x1F\x7F]/g, " ")); }
                          } catch {}
                          const rawAccountData = items[0]?.accountData;
                          let accountDataText = "";
                          if (rawAccountData) {
                            if (items[0]?.accountDataEncoded) {
                              try { accountDataText = atob(rawAccountData); } catch { accountDataText = rawAccountData; }
                            } else {
                              accountDataText = rawAccountData;
                            }
                          }
                          const productName = items[0]?.productName || `Pedido #${o.id}`;
                          const dateStr = new Date(o.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
                          const waMsg = encodeURIComponent(`Hola, necesito Soporte para esta Compra:\n\n📦 *Pedido #${o.id}*\n🛍️ Producto: ${productName}\n📅 Fecha: ${dateStr}`);
                          const waUrl = `https://wa.me/573334315646?text=${waMsg}`;
                          return (
                            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                              {/* Fecha y N° Pedido */}
                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-blue-700 text-sm">Pedido #{o.id}</span>
                                  <span className="text-xs text-gray-500">{dateStr}</span>
                                  <span className={`mt-1 inline-block w-fit px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    o.status === "completed" ? "bg-green-100 text-green-700" :
                                    o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>{o.status === "completed" ? "Completado" : o.status === "pending" ? "Pendiente" : o.status}</span>
                                </div>
                              </td>
                              {/* Datos de la Cuenta */}
                              <td className="px-5 py-4">
                                <p className="font-medium text-gray-800 text-sm mb-1">{productName}</p>
                                {accountDataText ? (
                                  <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 whitespace-pre-wrap break-words max-w-sm font-mono leading-relaxed">{accountDataText}</pre>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">Sin datos de cuenta asignados</span>
                                )}
                              </td>
                              {/* Pedir Soporte */}
                              <td className="px-5 py-4">
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                                  aria-label={`Pedir soporte para Pedido #${o.id}`}
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  Pedir Soporte
                                </a>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <div className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    No tienes pedidos registrados aún.
                  </div>
                ) : (
                  [...orders]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((o) => {
                      let items: any[] = [];
                      try {
                        try { items = JSON.parse(o.items); }
                        catch { items = JSON.parse(o.items.replace(/[\x00-\x1F\x7F]/g, " ")); }
                      } catch {}
                      const rawAccountData = items[0]?.accountData;
                      let accountDataText = "";
                      if (rawAccountData) {
                        if (items[0]?.accountDataEncoded) {
                          try { accountDataText = atob(rawAccountData); } catch { accountDataText = rawAccountData; }
                        } else {
                          accountDataText = rawAccountData;
                        }
                      }
                      const productName = items[0]?.productName || `Pedido #${o.id}`;
                      const dateStr = new Date(o.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
                      const waMsg = encodeURIComponent(`Hola, necesito Soporte para esta Compra:\n\n📦 *Pedido #${o.id}*\n🛍️ Producto: ${productName}\n📅 Fecha: ${dateStr}`);
                      const waUrl = `https://wa.me/573334315646?text=${waMsg}`;
                      return (
                        <div key={o.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-blue-700 text-sm">Pedido #{o.id}</span>
                              <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                              o.status === "completed" ? "bg-green-100 text-green-700" :
                              o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>{o.status === "completed" ? "Completado" : o.status === "pending" ? "Pendiente" : o.status}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm mb-1">{productName}</p>
                            {accountDataText ? (
                              <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 whitespace-pre-wrap break-words font-mono leading-relaxed">{accountDataText}</pre>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Sin datos de cuenta asignados</span>
                            )}
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Pedir Soporte por WhatsApp
                          </a>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "store" && (
          <div className="space-y-8">
            {/* Banner carrusel en Tienda: si hay banners usa BannerCarousel, si no el AnnouncementCarousel */}
            {bannerSlides.length > 0 ? (
              <BannerCarousel slides={bannerSlides} />
            ) : (
              <AnnouncementCarousel announcements={announcements} />
            )}

            {/* ── Cuentas Instantáneas ── */}
            {instantProducts.length > 0 && (
              <section>
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">LICENCIAS Y CUENTAS INSTANTÁNEAS</h2>
                  <div className="w-24 h-0.5 bg-blue-700 mx-auto mt-1 mb-2" />
                  <p className="text-gray-500 text-sm">Podrás comprar las siguientes licencias y cuentas de forma inmediata con el saldo que tengas en la plataforma.</p>
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

      {/* ── Floating WhatsApp Support ── */}
      <FloatingWhatsAppSupport user={user} />
    </div>
  );
}
