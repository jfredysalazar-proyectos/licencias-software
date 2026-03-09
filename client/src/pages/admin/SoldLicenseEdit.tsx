import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SoldLicenseEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const licenseId = Number(id);

  const { data: license, isLoading } = trpc.admin.soldLicenses.getById.useQuery(
    { id: licenseId },
    { retry: 1, enabled: !!licenseId }
  );
  const { data: products } = trpc.admin.products.list.useQuery();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerWhatsapp: "",
    productId: 0,
    productName: "",
    licenseCode: "",
    expirationDate: "",
    notes: "",
  });

  useEffect(() => {
    if (license) {
      setFormData({
        customerName: license.customerName,
        customerEmail: license.customerEmail,
        customerWhatsapp: license.customerWhatsapp,
        productId: license.productId,
        productName: license.productName,
        licenseCode: license.licenseCode,
        expirationDate: license.expirationDate
          ? new Date(license.expirationDate).toISOString().split("T")[0]
          : "",
        notes: license.notes || "",
      });
    }
  }, [license]);

  const utils = trpc.useUtils();

  const updateMutation = trpc.admin.soldLicenses.update.useMutation({
    onSuccess: () => {
      toast.success("Licencia actualizada correctamente");
      utils.admin.soldLicenses.list.invalidate();
      navigate("/admin/sold-licenses");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleProductChange = (productId: number) => {
    const product = products?.find((p: any) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      productId,
      productName: product?.name || "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;
    updateMutation.mutate({
      id: licenseId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerWhatsapp: formData.customerWhatsapp,
      productId: formData.productId,
      productName: formData.productName,
      licenseCode: formData.licenseCode,
      expirationDate: formData.expirationDate,
      notes: formData.notes,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
          <span className="text-gray-500">Cargando...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!license && !isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p className="text-red-500">Licencia no encontrada.</p>
          <Button type="button" onClick={() => navigate("/admin/sold-licenses")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/sold-licenses")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Licencia</h1>
            <p className="text-gray-500 text-sm mt-0.5">Modifica los datos de la licencia vendida</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre del cliente */}
              <div className="space-y-1">
                <Label htmlFor="customerName">Nombre del Cliente *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData((p) => ({ ...p, customerName: e.target.value }))}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <Label htmlFor="customerWhatsapp">WhatsApp *</Label>
                <Input
                  id="customerWhatsapp"
                  value={formData.customerWhatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, customerWhatsapp: e.target.value }))}
                  placeholder="+573001234567"
                  required
                />
              </div>

              {/* Producto */}
              <div className="space-y-1">
                <Label htmlFor="productId">Producto *</Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value={0}>Seleccionar producto...</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Código de licencia */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="licenseCode">Código de Licencia *</Label>
                <Input
                  id="licenseCode"
                  value={formData.licenseCode}
                  onChange={(e) => setFormData((p) => ({ ...p, licenseCode: e.target.value }))}
                  placeholder="Código o credenciales de la licencia"
                  required
                />
              </div>

              {/* Fecha de vencimiento */}
              <div className="space-y-1">
                <Label htmlFor="expirationDate">Fecha de Vencimiento *</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData((p) => ({ ...p, expirationDate: e.target.value }))}
                  required
                />
              </div>

              {/* Notas */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Actualizar Licencia"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/sold-licenses")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
