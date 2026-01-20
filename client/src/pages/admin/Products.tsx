import { useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import ProductVariantsManager, { Variant } from "@/components/ProductVariantsManager";
type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: number;
  basePrice: number;
  imageUrl: string | null;
  featured: number;
  inStock: number;
  features: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products } = trpc.admin.products.list.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    basePrice: "",
    imageUrl: "",
    featured: "0",
    inStock: "1",
    features: "",
  });

  const uploadImageMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: (data) => {
      setFormData({ ...formData, imageUrl: data.url });
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
      toast.success("Producto creado exitosamente");
      utils.admin.products.list.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear producto");
    },
  });

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      utils.admin.products.list.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar producto");
    },
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente");
      utils.admin.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar producto");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      categoryId: "",
      basePrice: "",
      imageUrl: "",
      featured: "0",
      inStock: "1",
      features: "",
    });
    setEditingProduct(null);
    setImagePreview(null);
    setVariants([]);
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId.toString(),
      basePrice: product.basePrice.toString(),
      imageUrl: product.imageUrl || "",
      featured: product.featured.toString(),
      inStock: product.inStock.toString(),
      features: product.features || "",
    });
    // Set image preview with full URL if it's a relative path
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
      setImageError(false);
    } else {
      setImagePreview(null);
      setImageError(false);
    }
    
    // Load variants for this product
    try {
      const productVariants = await utils.admin.variants.list.fetch({ productId: product.id });
      setVariants(productVariants.map(v => ({
        id: v.id,
        name: v.name,
        position: v.position,
        options: v.options || [],
      })));
    } catch (error) {
      console.error("Error loading variants:", error);
      setVariants([]);
    }
    
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      
      // Upload to S3
      setIsUploading(true);
      uploadImageMutation.mutate({
        imageData: result,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: "" });
    setImageError(false);
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      shortDescription: formData.shortDescription || undefined,
      categoryId: parseInt(formData.categoryId),
      basePrice: parseInt(formData.basePrice),
      imageUrl: formData.imageUrl || undefined,
      featured: parseInt(formData.featured),
      inStock: parseInt(formData.inStock),
      features: formData.features || undefined,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
    
    // Note: Variants will be saved separately after product is created
    // For now, we'll implement a simpler flow
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de licencias de software
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
                <DialogDescription>
                  Completa la información del producto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descripción Corta</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Completa *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoría *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Precio (COP) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagen del Producto</Label>
                  <div className="flex flex-col gap-4">
                    {imagePreview && !imageError ? (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-border"
                          onError={() => setImageError(true)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-sm">Subiendo...</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors block"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Haz clic para subir una imagen
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP (máx. 5MB)
                        </p>
                      </label>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="featured">Destacado</Label>
                    <Select
                      value={formData.featured}
                      onValueChange={(value) =>
                        setFormData({ ...formData, featured: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inStock">En Stock</Label>
                    <Select
                      value={formData.inStock}
                      onValueChange={(value) =>
                        setFormData({ ...formData, inStock: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Características (JSON)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={3}
                    placeholder='["Característica 1", "Característica 2"]'
                  />
                </div>

                {/* Product Variants */}
                <ProductVariantsManager
                  productId={editingProduct?.id}
                  variants={variants}
                  onChange={setVariants}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Producto</th>
                <th className="text-left p-4 font-medium">Categoría</th>
                <th className="text-left p-4 font-medium">Precio</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {categories?.find((c) => c.id === product.categoryId)?.name}
                  </td>
                  <td className="p-4 font-medium">
                    ${product.basePrice.toLocaleString("es-CO")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        product.inStock === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock === 1 ? "Disponible" : "Agotado"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/admin/products/${product.id}/variants`}
                        title="Gestionar variantes"
                      >
                        Variantes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/admin/products/${product.id}/pricing`}
                        title="Configurar precios"
                      >
                        Precios
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
