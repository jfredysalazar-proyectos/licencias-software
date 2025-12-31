import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import type { Category } from "../../../../drizzle/schema";

export default function AdminCategories() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    iconUrl: "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.admin.categories.list.useQuery();

  const uploadImageMutation = trpc.admin.uploadImage.useMutation();

  const createMutation = trpc.admin.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoría creada exitosamente");
      utils.admin.categories.list.invalidate();
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear categoría");
    },
  });

  const updateMutation = trpc.admin.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoría actualizada exitosamente");
      utils.admin.categories.list.invalidate();
      resetForm();
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar categoría");
    },
  });

  const deleteMutation = trpc.admin.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoría eliminada exitosamente");
      utils.admin.categories.list.invalidate();
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar categoría");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", iconUrl: "" });
    setIconFile(null);
    setIconPreview("");
    setSelectedCategory(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleIconSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }

    setIconFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    await uploadIcon(file);
  };

  const uploadIcon = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await uploadImageMutation.mutateAsync({
          imageData: base64,
          fileName: file.name,
        });
        setFormData({ ...formData, iconUrl: result.url });
        toast.success("Icono subido exitosamente");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error al subir el icono");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview("");
    setFormData({ ...formData, iconUrl: "" });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nombre y slug son requeridos");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      iconUrl: category.iconUrl || "",
    });
    if (category.iconUrl) {
      setIconPreview(category.iconUrl);
    }
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCategory) return;
    if (!formData.name || !formData.slug) {
      toast.error("Nombre y slug son requeridos");
      return;
    }
    updateMutation.mutate({
      id: selectedCategory.id,
      ...formData,
    });
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedCategory) return;
    deleteMutation.mutate({ id: selectedCategory.id });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categorías</h1>
            <p className="text-muted-foreground">Gestiona las categorías de productos</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Icono</th>
                  <th className="text-left p-4 font-medium">Nombre</th>
                  <th className="text-left p-4 font-medium">Slug</th>
                  <th className="text-left p-4 font-medium">Descripción</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((category) => (
                  <tr key={category.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-4">
                      {category.iconUrl ? (
                        <img
                          src={category.iconUrl}
                          alt={category.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                          Sin icono
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4 text-muted-foreground">{category.slug}</td>
                    <td className="p-4 text-sm">{category.description || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>Crea una nueva categoría de productos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Sistemas Operativos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="sistemas-operativos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe esta categoría..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              {iconPreview ? (
                <div className="relative inline-block">
                  <img src={iconPreview} alt="Preview" className="h-20 w-20 object-contain border border-border rounded" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveIcon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconSelect}
                    className="hidden"
                    id="icon-upload-create"
                  />
                  <label htmlFor="icon-upload-create" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click para subir icono
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP (máx 5MB)
                    </p>
                  </label>
                </div>
              )}
              {isUploading && (
                <p className="text-sm text-muted-foreground">Subiendo icono...</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsCreateOpen(false); }}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || isUploading}>
              {createMutation.isPending ? "Creando..." : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Actualiza la información de la categoría</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              {iconPreview ? (
                <div className="relative inline-block">
                  <img src={iconPreview} alt="Preview" className="h-20 w-20 object-contain border border-border rounded" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveIcon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconSelect}
                    className="hidden"
                    id="icon-upload-edit"
                  />
                  <label htmlFor="icon-upload-edit" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click para subir icono
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP (máx 5MB)
                    </p>
                  </label>
                </div>
              )}
              {isUploading && (
                <p className="text-sm text-muted-foreground">Subiendo icono...</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsEditOpen(false); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || isUploading}>
              {updateMutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría "{selectedCategory?.name}". Los productos
              asociados no serán eliminados pero quedarán sin categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCategory(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
