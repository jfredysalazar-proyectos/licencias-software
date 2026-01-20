import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VariantCombination {
  [variantId: string]: number; // variantId -> optionId
}

interface SKUWithPrice {
  combination: VariantCombination;
  combinationText: string;
  price: number;
  sku: string;
}

export default function ProductPricing() {
  const params = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const productId = params.productId;
  const utils = trpc.useUtils();

  const { data: product } = trpc.admin.products.getById.useQuery(
    { id: parseInt(productId!) },
    { enabled: !!productId }
  );

  const { data: variants } = trpc.admin.variants.list.useQuery(
    { productId: parseInt(productId!) },
    { enabled: !!productId }
  );

  const { data: existingSkus } = trpc.admin.skus.list.useQuery(
    { productId: parseInt(productId!) },
    { enabled: !!productId }
  );

  const [skuPrices, setSkuPrices] = useState<SKUWithPrice[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Generate all possible combinations
  useEffect(() => {
    if (!variants || variants.length === 0) return;

    const generateCombinations = (
      variantIndex: number,
      currentCombination: VariantCombination
    ): VariantCombination[] => {
      if (variantIndex >= variants.length) {
        return [{ ...currentCombination }];
      }

      const variant = variants[variantIndex];
      const combinations: VariantCombination[] = [];

      for (const option of variant.options) {
        const newCombination = {
          ...currentCombination,
          [variant.id]: option.id,
        };
        combinations.push(
          ...generateCombinations(variantIndex + 1, newCombination)
        );
      }

      return combinations;
    };

    const allCombinations = generateCombinations(0, {});

    const skusWithPrices: SKUWithPrice[] = allCombinations.map((combination) => {
      // Generate combination text
      const combinationText = variants
        .map((variant) => {
          const optionId = combination[variant.id];
          const option = variant.options.find((o) => o.id === optionId);
          return `${variant.name}: ${option?.value || "N/A"}`;
        })
        .join(" | ");

      // Generate SKU code
      const skuCode = variants
        .map((variant) => {
          const optionId = combination[variant.id];
          const option = variant.options.find((o) => o.id === optionId);
          return option?.value.substring(0, 3).toUpperCase() || "XXX";
        })
        .join("-");

      // Check if SKU exists in database
      const existingSku = existingSkus?.find((sku) => {
        const dbCombination = JSON.parse(sku.variantCombination);
        return JSON.stringify(dbCombination) === JSON.stringify(combination);
      });

      return {
        combination,
        combinationText,
        price: existingSku?.price || product?.basePrice || 0,
        sku: existingSku?.sku || `${product?.slug || "PROD"}-${skuCode}`,
      };
    });

    setSkuPrices(skusWithPrices);
  }, [variants, existingSkus, product]);

  const handlePriceChange = (index: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setSkuPrices((prev) =>
      prev.map((sku, i) => (i === index ? { ...sku, price } : sku))
    );
  };

  const handleSave = async () => {
    if (!productId) return;

    setIsSaving(true);
    try {
      // Delete existing SKUs
      if (existingSkus && existingSkus.length > 0) {
        for (const sku of existingSkus) {
          await utils.client.admin.skus.delete.mutate({ id: sku.id });
        }
      }

      // Create new SKUs
      for (const skuPrice of skuPrices) {
        await utils.client.admin.skus.create.mutate({
          productId: parseInt(productId),
          sku: skuPrice.sku,
          variantCombination: JSON.stringify(skuPrice.combination),
          price: skuPrice.price,
          inStock: 1,
        });
      }

      toast.success("Precios guardados exitosamente");
      utils.admin.skus.list.invalidate({ productId: parseInt(productId) });
    } catch (error: any) {
      toast.error(error.message || "Error al guardar precios");
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p>Cargando...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!variants || variants.length === 0) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin/products")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Productos
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Sin Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Este producto no tiene variantes configuradas. Primero debes agregar
                variantes antes de configurar precios diferenciales.
              </p>
              <Button
                onClick={() =>
                  setLocation(`/admin/products/${productId}/variants`)
                }
              >
                Agregar Variantes
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/products")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Productos
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Precios por Variante</h1>
          <p className="text-muted-foreground">
            Producto: <span className="font-semibold">{product.name}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Precio base: ${product.basePrice.toLocaleString("es-CO")} COP
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configurar Precios por Combinación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skuPrices.map((skuPrice, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">
                      {skuPrice.combinationText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {skuPrice.sku}
                    </p>
                  </div>
                  <div className="w-48">
                    <Label htmlFor={`price-${index}`} className="text-xs mb-1">
                      Precio (COP)
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={skuPrice.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/products")}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Precios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
