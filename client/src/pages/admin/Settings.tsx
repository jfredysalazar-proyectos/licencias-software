import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.admin.settings.list.useQuery();
  const [formData, setFormData] = useState({
    whatsapp_number: "",
    site_name: "",
    site_email: "",
  });

  useEffect(() => {
    if (settings) {
      const whatsapp = settings.find((s) => s.key === "whatsapp_number");
      const siteName = settings.find((s) => s.key === "site_name");
      const siteEmail = settings.find((s) => s.key === "site_email");

      setFormData({
        whatsapp_number: whatsapp?.value || "",
        site_name: siteName?.value || "",
        site_email: siteEmail?.value || "",
      });
    }
  }, [settings]);

  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Configuración actualizada exitosamente");
      utils.admin.settings.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar configuración");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update each setting
    const updates = [
      {
        key: "whatsapp_number",
        value: formData.whatsapp_number,
        description: "Número de WhatsApp para checkout",
      },
      {
        key: "site_name",
        value: formData.site_name,
        description: "Nombre del sitio web",
      },
      {
        key: "site_email",
        value: formData.site_email,
        description: "Email de contacto del sitio",
      },
    ];

    Promise.all(updates.map((update) => updateMutation.mutateAsync(update)))
      .then(() => {
        toast.success("Todas las configuraciones actualizadas");
      })
      .catch(() => {
        toast.error("Error al actualizar algunas configuraciones");
      });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración general del sitio
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
              Actualiza la información básica del sitio web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">
                  Número de WhatsApp para Checkout
                </Label>
                <Input
                  id="whatsapp_number"
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp_number: e.target.value })
                  }
                  placeholder="573001234567"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Número con código de país sin +, ej: 573001234567
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_name">Nombre del Sitio</Label>
                <Input
                  id="site_name"
                  type="text"
                  value={formData.site_name}
                  onChange={(e) =>
                    setFormData({ ...formData, site_name: e.target.value })
                  }
                  placeholder="LicenciasdeSoftware.org"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_email">Email de Contacto</Label>
                <Input
                  id="site_email"
                  type="email"
                  value={formData.site_email}
                  onChange={(e) =>
                    setFormData({ ...formData, site_email: e.target.value })
                  }
                  placeholder="contacto@licenciasdesoftware.org"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Acceso</CardTitle>
            <CardDescription>
              Credenciales de acceso al panel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Usuario Administrador</Label>
                <p className="text-sm text-muted-foreground mt-1">admin</p>
              </div>
              <div>
                <Label>Contraseña Inicial</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  admin123 (cambiar después del primer login)
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Por seguridad, se recomienda cambiar la contraseña predeterminada
                  lo antes posible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
