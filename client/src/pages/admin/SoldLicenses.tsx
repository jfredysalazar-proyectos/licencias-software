import { useState } from "react";
import { Plus, Edit, Trash2, MessageCircle, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface LicenseFormData {
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  productId: number;
  productName: string;
  licenseCode: string;
  expirationDate: string;
  notes: string;
}

export default function SoldLicenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  const [formData, setFormData] = useState<LicenseFormData>({
    customerName: "",
    customerEmail: "",
    customerWhatsapp: "",
    productId: 0,
    productName: "",
    licenseCode: "",
    expirationDate: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: licenses, isLoading, error: licensesError } = trpc.admin.soldLicenses.list.useQuery(undefined, {
    retry: 1,
  });
  const { data: products } = trpc.products.list.useQuery();

  const createMutation = trpc.admin.soldLicenses.create.useMutation({
    onSuccess: () => {
      toast.success("Licencia registrada exitosamente");
      utils.admin.soldLicenses.list.invalidate();
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.soldLicenses.update.useMutation({
    onSuccess: () => {
      toast.success("Licencia actualizada exitosamente");
      utils.admin.soldLicenses.list.invalidate();
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.soldLicenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Licencia eliminada exitosamente");
      utils.admin.soldLicenses.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerWhatsapp: "",
      productId: 0,
      productName: "",
      licenseCode: "",
      expirationDate: "",
      notes: "",
    });
    setEditingLicense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      expirationDate: formData.expirationDate.toString(),
    };
    if (editingLicense) {
      updateMutation.mutate({ id: editingLicense.id, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (license: any) => {
    setEditingLicense(license);
    setFormData({
      customerName: license.customerName,
      customerEmail: license.customerEmail,
      customerWhatsapp: license.customerWhatsapp,
      productId: license.productId,
      productName: license.productName,
      licenseCode: license.licenseCode,
      expirationDate: license.expirationDate.split("T")[0],
      notes: license.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta licencia?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleProductChange = (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setFormData((prev) => ({ ...prev, productId: product.id, productName: product.name }));
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | Date) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpirationBadgeColor = (days: number) => {
    if (days < 0) return "bg-red-100 text-red-800";
    if (days <= 7) return "bg-orange-100 text-orange-800";
    if (days <= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const generateWhatsAppMessage = (license: any) => {
    const daysLeft = getDaysUntilExpiration(license.expirationDate);
    const expirationFormatted = new Date(license.expirationDate).toLocaleDateString("es-CO");
    const message = `Hola ${license.customerName},

Te recordamos que tu licencia de *${license.productName}* está próxima a vencer.

📋 *Detalles de la licencia:*
🔑 Código: ${license.licenseCode}
📅 Fecha de vencimiento: ${expirationFormatted}
⏰ Días restantes: ${daysLeft > 0 ? daysLeft : "VENCIDA"}

Para renovar tu licencia o adquirir una nueva, contáctanos.

¡Gracias por confiar en nosotros!`;
    const whatsappNumber = license.customerWhatsapp.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  // ── DIALOG FORM (shared for create and edit) ──
  const dialogForm = (
    <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingLicense ? "Editar Licencia" : "Registrar Nueva Licencia"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Nombre del Cliente *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Correo Electrónico *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="customerWhatsapp">WhatsApp *</Label>
          <Input
            id="customerWhatsapp"
            placeholder="+57 300 123 4567"
            value={formData.customerWhatsapp}
            onChange={(e) => setFormData((prev) => ({ ...prev, customerWhatsapp: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="product">Producto *</Label>
          <select
            id="product"
            className="w-full border rounded-md p-2"
            value={formData.productId}
            onChange={(e) => handleProductChange(Number(e.target.value))}
            required
          >
            <option value={0}>Seleccionar producto</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="licenseCode">Código de Licencia *</Label>
          <Textarea
            id="licenseCode"
            value={formData.licenseCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, licenseCode: e.target.value }))}
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="expirationDate">Fecha de Vencimiento *</Label>
          <Input
            id="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notas (Opcional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Información adicional sobre la licencia..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { resetForm(); setDialogOpen(false); }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Guardando..."
              : editingLicense ? "Actualizar" : "Registrar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-8">
          <p>Cargando licencias...</p>
        </div>
      </AdminLayout>
    );
  }

  if (licensesError) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error al cargar las licencias</h3>
            </div>
            <p className="text-red-600 mt-2 text-sm">{licensesError.message}</p>
            <p className="text-red-500 mt-1 text-xs">Si el problema persiste, contacta al administrador del sistema.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">

        {/* Header with Dialog trigger for "Nueva Licencia" */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Licencias Vendidas</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gestiona las licencias vendidas y envía recordatorios a clientes
            </p>
          </div>
          {/* Dialog with DialogTrigger for "Nueva Licencia" button */}
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); }} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nueva Licencia</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </DialogTrigger>
            {dialogForm}
          </Dialog>
        </div>

        {/* ── DESKTOP TABLE (hidden on mobile) ── */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licenses && licenses.length > 0 ? (
                  licenses.map((license) => {
                    const daysLeft = getDaysUntilExpiration(license.expirationDate);
                    return (
                      <tr key={license.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900 break-words">
                            {license.customerName}
                          </div>
                          <div className="text-xs text-gray-500 break-all">{license.customerEmail}</div>
                          <div className="text-xs text-gray-500">{license.customerWhatsapp}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 break-words">{license.productName}</div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div className="text-sm text-gray-900 font-mono break-all line-clamp-3">
                            {license.licenseCode}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-900">
                              {new Date(license.expirationDate).toLocaleDateString("es-CO")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpirationBadgeColor(daysLeft)}`}
                          >
                            {daysLeft < 0 ? (
                              <><AlertCircle className="h-3 w-3" />Vencida</>
                            ) : (
                              `${daysLeft} días`
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(generateWhatsAppMessage(license), "_blank")}
                              title="Enviar recordatorio por WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(license)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(license.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay licencias registradas. Haz clic en "Nueva Licencia" para comenzar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MOBILE CARDS (hidden on desktop) ── */}
        <div className="md:hidden space-y-3">
          {licenses && licenses.length > 0 ? (
            licenses.map((license) => {
              const daysLeft = getDaysUntilExpiration(license.expirationDate);
              return (
                <div key={license.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                  {/* Customer + Status row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{license.customerName}</p>
                      <p className="text-xs text-gray-500 break-all">{license.customerEmail}</p>
                      <p className="text-xs text-gray-500">{license.customerWhatsapp}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getExpirationBadgeColor(daysLeft)}`}
                    >
                      {daysLeft < 0 ? (
                        <><AlertCircle className="h-3 w-3" />Vencida</>
                      ) : (
                        `${daysLeft} días`
                      )}
                    </span>
                  </div>

                  {/* Product */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Producto</span>
                    <p className="text-sm text-gray-900">{license.productName}</p>
                  </div>

                  {/* License code */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Código</span>
                    <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 rounded p-2 mt-1">
                      {license.licenseCode}
                    </p>
                  </div>

                  {/* Expiration */}
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>Vence: {new Date(license.expirationDate).toLocaleDateString("es-CO")}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(generateWhatsAppMessage(license), "_blank")}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(license)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(license.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No hay licencias registradas. Toca "Nueva" para comenzar.
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
