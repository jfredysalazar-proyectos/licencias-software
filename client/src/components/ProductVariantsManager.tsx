import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export interface Variant {
  id?: number;
  name: string;
  position: number;
  options: VariantOption[];
}

export interface VariantOption {
  id?: number;
  value: string;
  position: number;
}

interface ProductVariantsManagerProps {
  productId?: number;
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export default function ProductVariantsManager({
  variants,
  onChange,
}: ProductVariantsManagerProps) {
  const [newVariantName, setNewVariantName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<{ [key: number]: string }>({});

  const addVariant = () => {
    if (!newVariantName.trim()) {
      toast.error("El nombre de la variante es requerido");
      return;
    }

    const newVariant: Variant = {
      name: newVariantName,
      position: variants.length,
      options: [],
    };

    onChange([...variants, newVariant]);
    setNewVariantName("");
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateVariantName = (index: number, name: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const addOption = (variantIndex: number) => {
    const optionValue = newOptionValues[variantIndex]?.trim();
    if (!optionValue) {
      toast.error("El valor de la opción es requerido");
      return;
    }

    const updated = [...variants];
    const variant = updated[variantIndex];
    
    variant.options.push({
      value: optionValue,
      position: variant.options.length,
    });

    onChange(updated);
    setNewOptionValues({ ...newOptionValues, [variantIndex]: "" });
  };

  const removeOption = (variantIndex: number, optionIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].options = updated[variantIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    onChange(updated);
  };

  const updateOptionValue = (variantIndex: number, optionIndex: number, value: string) => {
    const updated = [...variants];
    updated[variantIndex].options[optionIndex].value = value;
    onChange(updated);
  };

  return (
    <div className="space-y-6 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variantes del Producto</h3>
        <p className="text-sm text-muted-foreground">
          Ej: Tiempo de Licencia, Versión, Tipo de Cuenta
        </p>
      </div>

      {/* Existing Variants */}
      {variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="border rounded-lg p-4 bg-background space-y-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Input
                value={variant.name}
                onChange={(e) => updateVariantName(variantIndex, e.target.value)}
                placeholder="Nombre de la variante"
                className="font-medium"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(variantIndex)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {/* Options */}
          <div className="ml-7 space-y-2">
            <Label className="text-sm text-muted-foreground">Opciones:</Label>
            
            {variant.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <Input
                  value={option.value}
                  onChange={(e) =>
                    updateOptionValue(variantIndex, optionIndex, e.target.value)
                  }
                  placeholder="Valor de la opción"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(variantIndex, optionIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add Option */}
            <div className="flex items-center gap-2">
              <Input
                value={newOptionValues[variantIndex] || ""}
                onChange={(e) =>
                  setNewOptionValues({ ...newOptionValues, [variantIndex]: e.target.value })
                }
                placeholder="Nueva opción (ej: 1 mes, 3 meses)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption(variantIndex);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(variantIndex)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            {variant.options.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Agrega al menos una opción para esta variante
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Add New Variant */}
      <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
        <Label>Nueva Variante</Label>
        <div className="flex items-center gap-2">
          <Input
            value={newVariantName}
            onChange={(e) => setNewVariantName(e.target.value)}
            placeholder="Nombre de la variante (ej: Tiempo de Licencia)"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVariant();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar Variante
          </Button>
        </div>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay variantes configuradas.</p>
          <p className="text-sm mt-1">
            Las variantes permiten ofrecer diferentes opciones del mismo producto con precios
            distintos.
          </p>
        </div>
      )}
    </div>
  );
}
