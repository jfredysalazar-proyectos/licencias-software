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
  const { data: licenses, isLoading } = trpc.admin.soldLicenses.list.useQuery();
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

    if (editingLicense) {
      updateMutation.mutate({
        id: editingLicense.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
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
      expirationDate: license.expirationDate.split("T")[0], // Format to YYYY-MM-DD
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
      setFormData({
        ...formData,
        productId: product.id,
        productName: product.name,
      });
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | Date) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Cargando licencias...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Licencias Vendidas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las licencias vendidas y envía recordatorios a clientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Licencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLicense ? "Editar Licencia" : "Registrar Nueva Licencia"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nombre del Cliente *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Correo Electrónico *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, customerWhatsapp: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, licenseCode: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Información adicional sobre la licencia..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLicense ? "Actualizar" : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses && licenses.length > 0 ? (
              licenses.map((license) => {
                const daysLeft = getDaysUntilExpiration(license.expirationDate);
                return (
                  <tr key={license.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {license.customerName}
                      </div>
                      <div className="text-sm text-gray-500">{license.customerEmail}</div>
                      <div className="text-sm text-gray-500">{license.customerWhatsapp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{license.productName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-mono max-w-xs truncate">
                        {license.licenseCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(license.expirationDate).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpirationBadgeColor(
                          daysLeft
                        )}`}
                      >
                        {daysLeft < 0 ? (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            Vencida
                          </>
                        ) : (
                          `${daysLeft} días`
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(generateWhatsAppMessage(license), "_blank")
                          }
                          title="Enviar recordatorio por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(license)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(license.id)}
                        >
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
  );
}
