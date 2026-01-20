import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import ProductVariantsManager, { Variant } from "@/components/ProductVariantsManager";

export default function ProductVariants() {
  const params = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const productId = params.productId;
  const utils = trpc.useUtils();
  
  const { data: product } = trpc.admin.products.getById.useQuery(
    { id: parseInt(productId!) },
    { enabled: !!productId }
  );
  
  const { data: existingVariants, isLoading } = trpc.admin.variants.list.useQuery(
    { productId: parseInt(productId!) },
    { enabled: !!productId }
  );

  const [variants, setVariants] = useState<Variant[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingVariants) {
      setVariants(
        existingVariants.map((v) => ({
          id: v.id,
          name: v.name,
          position: v.position,
          options: v.options || [],
        }))
      );
    }
  }, [existingVariants]);

  const handleSave = async () => {
    if (!productId) return;

    setIsSaving(true);
    try {
      // Delete existing variants
      if (existingVariants) {
        await Promise.all(
          existingVariants.map((v) =>
            utils.client.mutation("admin.variants.delete", { id: v.id })
          )
        );
      }

      // Create new variants
      for (const variant of variants) {
        if (variant.options.length > 0) {
          await utils.client.mutation("admin.variants.create", {
            productId: parseInt(productId),
            name: variant.name,
            position: variant.position,
            options: variant.options.map((o) => o.value),
          });
        }
      }

      toast.success("Variantes guardadas exitosamente");
      utils.admin.variants.list.invalidate({ productId: parseInt(productId) });
      setLocation("/admin/products");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar variantes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin/products")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Variantes de Producto</h1>
              {product && (
                <p className="text-muted-foreground mt-1">{product.name}</p>
              )}
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        {/* Variants Manager */}
        <ProductVariantsManager
          productId={parseInt(productId!)}
          variants={variants}
          onChange={setVariants}
        />

        {/* Info Card */}
        <div className="border rounded-lg p-6 bg-muted/30">
          <h3 className="font-semibold mb-2">💡 Cómo funcionan las variantes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Variantes</strong>: Son las características que pueden variar en tu
              producto (ej: Tiempo de Licencia, Versión, Tipo de Cuenta)
            </li>
            <li>
              • <strong>Opciones</strong>: Son los valores específicos de cada variante (ej: 1
              mes, 3 meses, 6 meses)
            </li>
            <li>
              • Los clientes podrán seleccionar una opción de cada variante al comprar el
              producto
            </li>
            <li>
              • Puedes agregar tantas variantes como necesites para tu producto
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
