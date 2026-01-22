import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: any) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({ onSelectMethod, disabled }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  
  const { data: paymentMethods, isLoading } = trpc.paymentMethods.getEnabled.useQuery();

  const handleProceed = () => {
    if (!selectedMethod) {
      toast.error("Por favor selecciona un método de pago");
      return;
    }

    const method = paymentMethods?.find(m => m.name === selectedMethod);
    if (method) {
      onSelectMethod(method);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay métodos de pago disponibles</p>
        <p className="text-sm mt-2">Contacta con soporte</p>
      </div>
    );
  }

  const getMethodIcon = (methodName: string) => {
    switch (methodName) {
      case "whatsapp":
        return <MessageCircle className="h-5 w-5" />;
      case "hoodpay":
        return <Wallet className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Selecciona tu método de pago</h3>
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMethod === method.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod(method.name)}
              >
                <RadioGroupItem value={method.name} id={method.name} />
                <Label
                  htmlFor={method.name}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="text-primary">{getMethodIcon(method.name)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{method.displayName}</div>
                    {method.description && (
                      <div className="text-sm text-muted-foreground">
                        {method.description}
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleProceed}
        disabled={!selectedMethod || disabled}
      >
        Continuar con {paymentMethods.find(m => m.name === selectedMethod)?.displayName || "Pago"}
      </Button>
    </div>
  );
}
