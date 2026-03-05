import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Megaphone } from "lucide-react";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.admin.settings.list.useQuery();
  const [formData, setFormData] = useState({
    whatsapp_number: "",
    site_name: "",
    site_email: "",
  });
  const [announcement, setAnnouncement] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    if (settings) {
      const whatsapp = settings.find((s) => s.key === "whatsapp_number");
      const siteName = settings.find((s) => s.key === "site_name");
      const siteEmail = settings.find((s) => s.key === "site_email");
      const ann = settings.find((s) => s.key === "reseller_announcement");

      setFormData({
        whatsapp_number: whatsapp?.value || "",
        site_name: siteName?.value || "",
        site_email: siteEmail?.value || "",
      });
      setAnnouncement(ann?.value || "");
    }
  }, [settings]);

  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => {
      utils.admin.settings.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar configuración");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        toast.success("Configuración actualizada exitosamente");
      })
      .catch(() => {
        toast.error("Error al actualizar algunas configuraciones");
      });
  };

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      await updateMutation.mutateAsync({
        key: "reseller_announcement",
        value: announcement,
        description: "Anuncio en barra superior del portal reseller",
      });
      await utils.admin.settings.list.invalidate();
      toast.success("Anuncio actualizado. Aparecerá en el portal reseller.");
    } catch {
      toast.error("Error al guardar el anuncio");
    } finally {
      setSavingAnnouncement(false);
    }
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

        {/* Barra de Anuncios Reseller */}
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Megaphone className="h-5 w-5" />
              Anuncio para Portal Reseller
            </CardTitle>
            <CardDescription>
              El mensaje que escribas aquí aparecerá como una barra animada en la parte superior del portal reseller. Déjalo vacío para ocultarla.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reseller_announcement">Mensaje del anuncio</Label>
              <Textarea
                id="reseller_announcement"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Ej: 🎉 Nuevos productos disponibles esta semana · Recarga tu saldo y aprovecha los descuentos · Contáctanos por WhatsApp para más info"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Puedes usar · para separar varios mensajes en la misma barra. Emojis permitidos.
              </p>
            </div>
            {announcement && (
              <div className="rounded-lg border border-blue-200 bg-blue-900 text-white px-4 py-2 overflow-hidden">
                <p className="text-xs text-blue-300 mb-1">Vista previa:</p>
                <p className="text-sm font-medium truncate">📢 {announcement}</p>
              </div>
            )}
            <Button
              onClick={handleSaveAnnouncement}
              disabled={savingAnnouncement}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {savingAnnouncement ? "Guardando..." : "Guardar Anuncio"}
            </Button>
          </CardContent>
        </Card>

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
                  placeholder="573334315646"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Número con código de país sin +, ej: 573334315646
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
