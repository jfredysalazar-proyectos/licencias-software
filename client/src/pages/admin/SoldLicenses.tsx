import { useState } from "react";
import { Plus, Edit, Trash2, MessageCircle, Calendar, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const emptyForm: LicenseFormData = {
  customerName: "",
  customerEmail: "",
  customerWhatsapp: "",
  productId: 0,
  productName: "",
  licenseCode: "",
  expirationDate: "",
  notes: "",
};

export default function SoldLicenses() {
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  const [formData, setFormData] = useState<LicenseFormData>(emptyForm);

  const utils = trpc.useUtils();
  const { data: licenses, isLoading, error: licensesError } = trpc.admin.soldLicenses.list.useQuery(undefined, {
    retry: 1,
  });
  const { data: products } = trpc.products.list.useQuery();

  const createMutation = trpc.admin.soldLicenses.create.useMutation({
    onSuccess: () => {
      toast.success("Licencia registrada exitosamente");
      utils.admin.soldLicenses.list.invalidate();
      closeForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.soldLicenses.update.useMutation({
    onSuccess: () => {
      toast.success("Licencia actualizada exitosamente");
      utils.admin.soldLicenses.list.invalidate();
      closeForm();
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

  const openNewForm = () => {
    setEditingLicense(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (license: any) => {
    setEditingLicense(license);
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
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLicense(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData, expirationDate: formData.expirationDate.toString() };
    if (editingLicense) {
      updateMutation.mutate({ id: editingLicense.id, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
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
    const message = `Hola ${license.customerName},\n\nTe recordamos que tu licencia de *${license.productName}* está próxima a vencer.\n\n📋 *Detalles de la licencia:*\n🔑 Código: ${license.licenseCode}\n📅 Fecha de vencimiento: ${expirationFormatted}\n⏰ Días restantes: ${daysLeft > 0 ? daysLeft : "VENCIDA"}\n\nPara renovar tu licencia o adquirir una nueva, contáctanos.\n\n¡Gracias por confiar en nosotros!`;
    const whatsappNumber = license.customerWhatsapp.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Licencias Vendidas</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Gestiona las licencias vendidas y envía recordatorios a clientes
            </p>
          </div>
          <Button type="button" onClick={openNewForm} className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva Licencia
          </Button>
        </div>

        {/* ── INLINE FORM PANEL ── */}
        {showForm && (
          <div
            id="license-form-section"
            className="mb-6 border border-blue-200 rounded-xl bg-blue-50 shadow-sm"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200 bg-blue-100 rounded-t-xl">
              <h2 className="text-lg font-semibold text-blue-900">
                {editingLicense ? "Editar Licencia" : "Nueva Licencia"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors"
                aria-label="Cerrar formulario"
              >
                <X className="h-5 w-5 text-blue-700" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6">
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
                    className="bg-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="customerEmail">Email del Cliente *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    required
                    className="bg-white"
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
                    className="bg-white"
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
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value={0}>Seleccionar producto...</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Código de licencia */}
                <div className="space-y-1">
                  <Label htmlFor="licenseCode">Código de Licencia *</Label>
                  <Input
                    id="licenseCode"
                    value={formData.licenseCode}
                    onChange={(e) => setFormData((p) => ({ ...p, licenseCode: e.target.value }))}
                    placeholder="Código, usuario o clave de acceso"
                    required
                    className="bg-white"
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
                    className="bg-white"
                  />
                </div>

                {/* Notas */}
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Instrucciones de instalación, credenciales adicionales, etc."
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-blue-200">
                <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Guardando..." : editingLicense ? "Actualizar Licencia" : "Registrar Licencia"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} className="bg-white">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── LOADING / ERROR STATES ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            <span className="text-gray-500">Cargando Licencias...</span>
          </div>
        )}

        {licensesError && !isLoading && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            Error al cargar las licencias. Por favor recarga la página.
          </div>
        )}

        {/* ── DESKTOP TABLE ── */}
        {!isLoading && !licensesError && (
          <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {licenses?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No hay licencias registradas aún.
                      </td>
                    </tr>
                  )}
                  {licenses?.map((license) => {
                    const days = getDaysUntilExpiration(license.expirationDate);
                    return (
                      <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{license.customerName}</p>
                          <p className="text-xs text-gray-500">{license.customerEmail}</p>
                          <p className="text-xs text-gray-500">{license.customerWhatsapp}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{license.productName}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1 break-all">
                            {license.licenseCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(license.expirationDate).toLocaleDateString("es-CO")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getExpirationBadgeColor(days)}`}>
                            {days < 0 ? "Vencida" : `${days} días`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={generateWhatsAppMessage(license)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Enviar recordatorio por WhatsApp"
                              className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openEditForm(license)}
                              title="Editar licencia"
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(license.id)}
                              title="Eliminar licencia"
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MOBILE CARDS ── */}
        {!isLoading && !licensesError && (
          <div className="md:hidden space-y-3">
            {licenses?.length === 0 && (
              <p className="text-center text-gray-400 py-12">No hay licencias registradas aún.</p>
            )}
            {licenses?.map((license) => {
              const days = getDaysUntilExpiration(license.expirationDate);
              return (
                <div key={license.id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{license.customerName}</p>
                      <p className="text-xs text-gray-500">{license.customerEmail}</p>
                      <p className="text-xs text-gray-500">{license.customerWhatsapp}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${getExpirationBadgeColor(days)}`}>
                      {days < 0 ? "Vencida" : `${days} días`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm mb-3">
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-20 shrink-0">Producto:</span>
                      <span className="text-gray-700 font-medium">{license.productName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-20 shrink-0">Código:</span>
                      <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 break-all">{license.licenseCode}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 w-20 shrink-0">Vence:</span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(license.expirationDate).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={generateWhatsAppMessage(license)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditForm(license)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(license.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
