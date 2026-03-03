import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Store, Zap, Clock, Package, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: number;
  basePrice: number;
  resellerPrice: number | null;
  imageUrl: string | null;
  featured: number;
  inStock: number;
  features: string | null;
  platforms: string | null;
  orderType?: string;
  showInReseller?: number;
  createdAt: Date;
  updatedAt: Date;
};

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  categoryId: "",
  basePrice: "",
  resellerPrice: "",
  imageUrl: "",
  inStock: "1",
  orderType: "instant",
  showInReseller: "0",
};

export default function AdminResellerProducts() {
  const utils = trpc.useUtils();
  const { data: allProducts = [] } = trpc.admin.products.list.useQuery();
  const { data: categories = [] } = trpc.admin.categories.list.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<"all" | "reseller-only">("all");
  const [filterType, setFilterType] = useState<"all" | "instant" | "on-demand">("all");
  const [formData, setFormData] = useState(defaultForm);

  const uploadImageMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: (data) => {
      setFormData((f) => ({ ...f, imageUrl: data.url }));
      setImagePreview(data.url);
      setIsUploading(false);
      toast.success("Imagen subida exitosamente");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || "Error al subir imagen");
    },
  });

  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success("Producto creado exitosamente");
      closeDialog();
    },
    onError: (e) => toast.error(e.message || "Error al crear producto"),
  });

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success("Producto actualizado");
      closeDialog();
    },
    onError: (e) => toast.error(e.message || "Error al actualizar producto"),
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success("Producto eliminado");
    },
    onError: (e) => toast.error(e.message || "Error al eliminar producto"),
  });

  // Quick toggle showInReseller without opening dialog
  const toggleResellerMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
    },
    onError: (e) => toast.error(e.message || "Error al actualizar"),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData(defaultForm);
    setImagePreview(null);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(defaultForm);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription || "",
      categoryId: String(p.categoryId),
      basePrice: String(p.basePrice),
      resellerPrice: p.resellerPrice ? String(p.resellerPrice) : "",
      imageUrl: p.imageUrl || "",
      inStock: String(p.inStock),
      orderType: p.orderType || "instant",
      showInReseller: String(p.showInReseller ?? 0),
    });
    setImagePreview(p.imageUrl || null);
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadImageMutation.mutate({ base64, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.basePrice || !formData.categoryId) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || " ",
      shortDescription: formData.shortDescription || undefined,
      categoryId: parseInt(formData.categoryId),
      basePrice: parseInt(formData.basePrice),
      resellerPrice: formData.resellerPrice ? parseInt(formData.resellerPrice) : undefined,
      imageUrl: formData.imageUrl || undefined,
      featured: 0,
      inStock: parseInt(formData.inStock),
      orderType: formData.orderType as "instant" | "on-demand",
      showInReseller: parseInt(formData.showInReseller),
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Filter products
  const filteredProducts = (allProducts as Product[]).filter((p) => {
    const matchReseller = filterView === "all" || (filterView === "reseller-only" && p.showInReseller === 1);
    const matchType =
      filterType === "all" ||
      (filterType === "instant" && (!p.orderType || p.orderType === "instant")) ||
      (filterType === "on-demand" && p.orderType === "on-demand");
    return matchReseller && matchType;
  });

  const resellerCount = (allProducts as Product[]).filter((p) => p.showInReseller === 1).length;
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Store className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Productos Reseller</h1>
              <p className="text-sm text-gray-500">
                {resellerCount} producto{resellerCount !== 1 ? "s" : ""} visible{resellerCount !== 1 ? "s" : ""} en la tienda reseller
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Eye className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Control de visibilidad en tienda reseller</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Usa el botón <strong>ojo</strong> en cada producto para activar/desactivar su visibilidad en la tienda de resellers. 
              Solo los productos con el ojo activo aparecerán en <strong>/reseller → Tienda</strong>.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-3">
          <div className="flex gap-1">
            {[
              { key: "all", label: "Todos", count: (allProducts as Product[]).length },
              { key: "reseller-only", label: "En tienda reseller", count: resellerCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterView(key as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filterView === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filterView === key ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-gray-300 mx-1" />
          <div className="flex gap-1">
            {[
              { key: "all", label: "Todos los tipos" },
              { key: "instant", label: "⚡ Instantáneos" },
              { key: "on-demand", label: "🕐 Bajo Pedido" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === key
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all ${
                product.showInReseller === 1
                  ? "border-blue-300 ring-1 ring-blue-200"
                  : "border-gray-200 opacity-70"
              }`}
            >
              {/* Image */}
              <div className="relative h-32">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {/* Order type badge */}
                <div className={`absolute top-2 left-2 text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                  product.orderType === "on-demand"
                    ? "bg-orange-500 text-white"
                    : "bg-green-500 text-white"
                }`}>
                  {product.orderType === "on-demand" ? <Clock className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
                  {product.orderType === "on-demand" ? "Pedido" : "Instant"}
                </div>
                {/* Reseller visibility badge */}
                <div className={`absolute top-2 right-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  product.showInReseller === 1 ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
                }`}>
                  {product.showInReseller === 1 ? "👁 Visible" : "🚫 Oculto"}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-blue-700 font-bold mt-0.5">
                  ${(product.resellerPrice || product.basePrice).toLocaleString("es-CO")}
                </p>
                {product.resellerPrice && (
                  <p className="text-xs text-gray-400 line-through">${product.basePrice.toLocaleString("es-CO")}</p>
                )}
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex gap-1.5">
                {/* Toggle reseller visibility */}
                <button
                  onClick={() => {
                    toggleResellerMutation.mutate({
                      id: product.id,
                      showInReseller: product.showInReseller === 1 ? 0 : 1,
                    });
                  }}
                  title={product.showInReseller === 1 ? "Ocultar de tienda reseller" : "Mostrar en tienda reseller"}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    product.showInReseller === 1
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {product.showInReseller === 1 ? (
                    <><Eye className="h-3 w-3" /> Visible</>
                  ) : (
                    <><EyeOff className="h-3 w-3" /> Oculto</>
                  )}
                </button>
                <button
                  onClick={() => openEdit(product)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${product.name}"?`)) {
                      deleteMutation.mutate({ id: product.id });
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay productos en esta vista.</p>
              {filterView === "reseller-only" && (
                <p className="text-xs mt-1 text-gray-400">Activa el ojo en los productos que quieres mostrar en la tienda reseller.</p>
              )}
              <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Crear primer producto
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre del producto *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setFormData((f) => ({ ...f, name, slug }));
                  }}
                  placeholder="Netflix 1 Pantalla Original 1 Mes"
                  required
                />
              </div>

              <div>
                <Label>Slug (URL) *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="netflix-1-pantalla-1-mes"
                  required
                />
              </div>

              <div>
                <Label>Categoría *</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData((f) => ({ ...f, categoryId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Precio base (COP) *</Label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData((f) => ({ ...f, basePrice: e.target.value }))}
                  placeholder="16000"
                  required
                />
              </div>

              <div>
                <Label>Precio reseller (COP)</Label>
                <Input
                  type="number"
                  value={formData.resellerPrice}
                  onChange={(e) => setFormData((f) => ({ ...f, resellerPrice: e.target.value }))}
                  placeholder="14000 (opcional)"
                />
              </div>

              <div>
                <Label>Tipo de orden *</Label>
                <Select value={formData.orderType} onValueChange={(v) => setFormData((f) => ({ ...f, orderType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-600" />
                        Instantáneo (pago con saldo)
                      </div>
                    </SelectItem>
                    <SelectItem value="on-demand">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Bajo Pedido (solicitar por WhatsApp)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Disponibilidad</Label>
                <Select value={formData.inStock} onValueChange={(v) => setFormData((f) => ({ ...f, inStock: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Disponible</SelectItem>
                    <SelectItem value="0">Agotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* showInReseller toggle */}
              <div className="col-span-2">
                <Label>Visibilidad en tienda reseller</Label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, showInReseller: f.showInReseller === "1" ? "0" : "1" }))}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      formData.showInReseller === "1" ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        formData.showInReseller === "1" ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${formData.showInReseller === "1" ? "text-blue-700" : "text-gray-500"}`}>
                    {formData.showInReseller === "1" ? (
                      <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> Visible en tienda reseller</span>
                    ) : (
                      <span className="flex items-center gap-1"><EyeOff className="h-4 w-4" /> Oculto en tienda reseller</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Activa esta opción para que el producto aparezca en la sección Tienda del área reseller.
                </p>
              </div>

              <div className="col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label>Imagen del producto</Label>
                <div className="flex gap-3 items-start mt-1">
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        {isUploading ? (
                          <p className="text-sm text-gray-500">Subiendo imagen...</p>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Haz clic para subir imagen</p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP hasta 5MB</p>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => { setFormData((f) => ({ ...f, imageUrl: e.target.value })); setImagePreview(e.target.value); }}
                      placeholder="O pega una URL de imagen..."
                      className="mt-2 text-xs"
                    />
                  </div>
                  {imagePreview && (
                    <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview(null)} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={closeDialog} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? "Guardando..." : editingProduct ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
