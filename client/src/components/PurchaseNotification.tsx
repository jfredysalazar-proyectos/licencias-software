import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getRandomName, getRandomCity } from "@/lib/colombianData";

interface Notification {
  id: number;
  name: string;
  productName: string;
  productImage: string;
  city: string;
}

export default function PurchaseNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: products } = trpc.products.list.useQuery();

  useEffect(() => {
    if (!products || products.length === 0 || isDismissed) return;

    // Función para generar una notificación aleatoria
    const generateNotification = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      const newNotification: Notification = {
        id: Date.now(),
        name: getRandomName(),
        productName: randomProduct.name,
        productImage: randomProduct.imageUrl || "/images/placeholder.png",
        city: getRandomCity(),
      };

      setNotification(newNotification);
      setIsVisible(true);

      // Ocultar después de 4 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // Mostrar primera notificación después de 3 segundos
    const initialTimeout = setTimeout(() => {
      generateNotification();
    }, 3000);

    // Mostrar nueva notificación cada 8 segundos (4s visible + 4s oculta)
    const interval = setInterval(() => {
      generateNotification();
    }, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!notification || isDismissed) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-in-out ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm flex items-start gap-3">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <img
            src={notification.productImage}
            alt={notification.productName}
            className="w-12 h-12 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.png";
            }}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {notification.name}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Compró{" "}
            <span className="font-medium text-gray-900">
              {notification.productName}
            </span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{notification.city}</span>
            <span className="mx-1">•</span>
            <span className="text-green-600 font-medium">Hoy</span>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
