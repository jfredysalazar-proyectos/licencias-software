import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import type { SelectedVariant } from "@/contexts/CartContext";

interface Variant {
  id: number;
  name: string;
  position: number;
  options: {
    id: number;
    value: string;
    position: number;
  }[];
}

interface VariantSelectorProps {
  productId: number;
  onVariantsChange: (variants: SelectedVariant[]) => void;
}

export default function VariantSelector({ productId, onVariantsChange }: VariantSelectorProps) {
  const { data: variants, isLoading } = trpc.products.variants.useQuery({ productId });
  const [selectedOptions, setSelectedOptions] = useState<{ [variantId: number]: number }>({});

  // Auto-select first option for each variant
  useEffect(() => {
    if (variants && variants.length > 0) {
      const initialSelections: { [variantId: number]: number } = {};
      variants.forEach((variant) => {
        if (variant.options && variant.options.length > 0) {
          initialSelections[variant.id] = variant.options[0].id;
        }
      });
      setSelectedOptions(initialSelections);
    }
  }, [variants]);

  // Notify parent of selection changes
  useEffect(() => {
    if (variants && Object.keys(selectedOptions).length > 0) {
      const selectedVariants: SelectedVariant[] = variants
        .filter((variant) => selectedOptions[variant.id] !== undefined)
        .map((variant) => {
          const optionId = selectedOptions[variant.id];
          const option = variant.options.find((o) => o.id === optionId);
          return {
            variantId: variant.id,
            variantName: variant.name,
            optionId: optionId,
            optionValue: option?.value || "",
          };
        });
      onVariantsChange(selectedVariants);
    }
  }, [selectedOptions, variants, onVariantsChange]);

  const handleOptionChange = (variantId: number, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [variantId]: parseInt(optionId),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-4">Selecciona las opciones:</h3>
        {variants.map((variant) => (
          <div key={variant.id} className="mb-6">
            <Label className="text-base font-medium mb-3 block">{variant.name}</Label>
            <RadioGroup
              value={selectedOptions[variant.id]?.toString()}
              onValueChange={(value) => handleOptionChange(variant.id, value)}
              className="grid grid-cols-2 gap-3"
            >
              {variant.options.map((option) => (
                <div key={option.id} className="flex items-center">
                  <RadioGroupItem
                    value={option.id.toString()}
                    id={`variant-${variant.id}-option-${option.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`variant-${variant.id}-option-${option.id}`}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium border-2 rounded-lg cursor-pointer transition-all hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary"
                  >
                    {option.value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
