import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Settings, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const { data: paymentMethods, isLoading, refetch } = trpc.admin.paymentMethods.list.useQuery();
  const updateMutation = trpc.admin.paymentMethods.update.useMutation({
    onSuccess: () => {
      toast.success("Método de pago actualizado");
      refetch();
      setConfigDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleToggle = async (id: number, enabled: boolean) => {
    updateMutation.mutate({ id, enabled });
  };

  const handleConfigure = (method: any) => {
    setSelectedMethod(method);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const config: any = {};

    // Parse config based on method type
    if (selectedMethod.name === "whatsapp") {
      config.phone = formData.get("phone");
      config.message_template = formData.get("message_template");
    } else if (selectedMethod.name === "hoodpay") {
      const businessId = formData.get("business_id");
      config.business_id = businessId ? parseInt(businessId as string, 10) : undefined;
      config.api_key = formData.get("api_key");
      config.webhook_secret = formData.get("webhook_secret");
      config.currency = formData.get("currency") || "USD";
      config.test_mode = formData.get("test_mode") === "on";
    }

    updateMutation.mutate({
      id: selectedMethod.id,
      config: JSON.stringify(config),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Métodos de Pago</h1>
        <p className="text-muted-foreground">
          Configura los métodos de pago disponibles para tus clientes
        </p>
      </div>

      <div className="space-y-4">
        {paymentMethods?.map((method) => {
          const config = method.config ? JSON.parse(method.config as string) : {};
          const isEnabled = method.enabled === 1;

          return (
            <Card key={method.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{method.displayName}</CardTitle>
                      <CardDescription>
                        {method.name === 'whatsapp' ? 'Contacta por WhatsApp para completar tu compra' : 'Paga con criptomonedas de forma segura'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigure(method)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggle(method.id, checked)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
              {isEnabled && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {method.name === "whatsapp" && (
                      <div>
                        <strong>Teléfono:</strong> {config.phone || "No configurado"}
                      </div>
                    )}
                    {method.name === "hoodpay" && (
                      <div className="space-y-1">
                        <div>
                          <strong>Business ID:</strong> {config.business_id || "No configurado"}
                        </div>
                        <div>
                          <strong>Moneda:</strong> {config.currency || "USD"}
                        </div>
                        <div>
                          <strong>Modo:</strong> {config.test_mode ? "Prueba" : "Producción"}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" overlayClassName="bg-black/30">
          <DialogHeader>
            <DialogTitle>Configurar {selectedMethod?.displayName}</DialogTitle>
            <DialogDescription>
              Configura los detalles de este método de pago
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            {selectedMethod?.name === "whatsapp" && (
              <>
                <div>
                  <Label htmlFor="phone">Número de WhatsApp</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+573334315646"
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).phone
                        : ""
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Incluye el código de país (ej: +57 para Colombia)
                  </p>
                </div>
                <div>
                  <Label htmlFor="message_template">Mensaje Predeterminado</Label>
                  <Textarea
                    id="message_template"
                    name="message_template"
                    placeholder="Hola, estoy interesado en comprar..."
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).message_template
                        : ""
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            {selectedMethod?.name === "hoodpay" && (
              <>
                <div>
                  <Label htmlFor="business_id">Business ID</Label>
                  <Input
                    id="business_id"
                    name="business_id"
                    placeholder="29974"
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).business_id
                        : ""
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Encuentra tu Business ID en el dashboard de Hoodpay
                  </p>
                </div>
                <div>
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    name="api_key"
                    type="password"
                    placeholder="eyJhb..."
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).api_key
                        : ""
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Genera una API key en Settings → Developer de Hoodpay
                  </p>
                </div>
                <div>
                  <Label htmlFor="webhook_secret">Webhook Secret</Label>
                  <Input
                    id="webhook_secret"
                    name="webhook_secret"
                    type="password"
                    placeholder="whsec_..."
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).webhook_secret
                        : ""
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Se genera automáticamente al crear un webhook en Hoodpay
                  </p>
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    name="currency"
                    placeholder="USD"
                    defaultValue={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).currency
                        : "USD"
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Código de moneda (USD, COP, EUR, etc.)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="test_mode"
                    name="test_mode"
                    defaultChecked={
                      selectedMethod.config
                        ? JSON.parse(selectedMethod.config as string).test_mode
                        : false
                    }
                  />
                  <Label htmlFor="test_mode">Modo de Prueba</Label>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfigDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
