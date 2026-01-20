import { useEffect, useState } from "react";
import { Eye, Flame } from "lucide-react";
import { getViewingCount, getDailySales } from "@/lib/socialProof";

interface SocialProofProps {
  productId: number;
}

export default function SocialProof({ productId }: SocialProofProps) {
  const [viewingCount, setViewingCount] = useState(0);
  const [dailySales, setDailySales] = useState(0);

  useEffect(() => {
    // Generar número de personas viendo (cambia en cada carga)
    setViewingCount(getViewingCount());
    
    // Generar número de ventas del día (consistente por día)
    setDailySales(getDailySales(productId));
  }, [productId]);

  return (
    <div className="flex items-center gap-6 py-4">
      {/* Personas viendo el producto */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
          <Eye className="h-4 w-4" />
        </div>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{viewingCount}</span> personas están viendo este producto ahora
        </span>
      </div>

      {/* Vendidos hoy */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
          <Flame className="h-4 w-4" />
        </div>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{dailySales}</span> vendidos hoy
        </span>
      </div>
    </div>
  );
}
