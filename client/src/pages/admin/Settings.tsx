import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Megaphone, Images, Trash2, Plus, GripVertical, Link, Upload, LayoutTemplate } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CarouselSlide {
  id: string;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
}

// ─────────────────────────────────────────────
// Carousel Manager Card
// ─────────────────────────────────────────────
function CarouselManager({
  slides,
  onChange,
  onSave,
  saving,
  uploadImage,
}: {
  slides: CarouselSlide[];
  onChange: (slides: CarouselSlide[]) => void;
  onSave: () => void;
  saving: boolean;
  uploadImage: (file: File) => Promise<string>;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);

  const addSlide = () => {
    if (slides.length >= 6) {
      toast.error("Máximo 6 slides permitidos");
      return;
    }
    onChange([
      ...slides,
      { id: crypto.randomUUID(), imageUrl: "", title: "", linkUrl: "" },
    ]);
  };

  const removeSlide = (index: number) => {
    onChange(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: keyof CarouselSlide, value: string) => {
    onChange(slides.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleFileChange = async (index: number, file: File | null) => {
    if (!file) return;
    setUploading(index);
    try {
      const url = await uploadImage(file);
      updateSlide(index, "imageUrl", url);
      toast.success("Imagen subida correctamente");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(null);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Images className="h-5 w-5" />
          Carrusel de Imágenes — Panel Reseller
        </CardTitle>
        <CardDescription>
          Gestiona hasta 6 imágenes que se mostrarán como carrusel en el Panel del portal Reseller.
          Puedes subir imágenes o pegar una URL externa. El título y el enlace son opcionales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-blue-200 rounded-lg">
            <Images className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay slides configurados. Agrega el primero.</p>
          </div>
        )}

        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  Slide {index + 1}
                </div>
                <button
                  onClick={() => removeSlide(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                  title="Eliminar slide"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Image preview */}
              {slide.imageUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Image URL input */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">URL de imagen</Label>
                <div className="flex gap-2">
                  <Input
                    value={slide.imageUrl}
                    onChange={(e) => updateSlide(index, "imageUrl", e.target.value)}
                    placeholder="https://... o sube una imagen"
                    className="text-sm flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading === index}
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="shrink-0"
                  >
                    {uploading === index ? (
                      <span className="text-xs">Subiendo...</span>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Title (optional) */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Título (opcional)</Label>
                <Input
                  value={slide.title || ""}
                  onChange={(e) => updateSlide(index, "title", e.target.value)}
                  placeholder="Ej: Nuevas ofertas disponibles"
                  className="text-sm"
                />
              </div>

              {/* Link URL (optional) */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600 flex items-center gap-1">
                  <Link className="h-3 w-3" /> Enlace al hacer clic (opcional)
                </Label>
                <Input
                  value={slide.linkUrl || ""}
                  onChange={(e) => updateSlide(index, "linkUrl", e.target.value)}
                  placeholder="https://... o /reseller"
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={addSlide}
            disabled={slides.length >= 6}
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Slide
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Carrusel"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Recomendación: imágenes en proporción 16:9 (ej. 1200×675 px) para mejor visualización.
        </p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Banner Carousel Manager Card (Tienda)
// ─────────────────────────────────────────────
function BannerCarouselManager({
  slides,
  onChange,
  onSave,
  saving,
  uploadImage,
}: {
  slides: CarouselSlide[];
  onChange: (slides: CarouselSlide[]) => void;
  onSave: () => void;
  saving: boolean;
  uploadImage: (file: File) => Promise<string>;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);

  const addSlide = () => {
    if (slides.length >= 6) { toast.error("Máximo 6 banners permitidos"); return; }
    onChange([...slides, { id: crypto.randomUUID(), imageUrl: "", title: "", linkUrl: "" }]);
  };

  const removeSlide = (index: number) => onChange(slides.filter((_, i) => i !== index));

  const updateSlide = (index: number, field: keyof CarouselSlide, value: string) =>
    onChange(slides.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const handleFileChange = async (index: number, file: File | null) => {
    if (!file) return;
    setUploading(index);
    try {
      const url = await uploadImage(file);
      updateSlide(index, "imageUrl", url);
      toast.success("Imagen subida correctamente");
    } catch { toast.error("Error al subir la imagen"); }
    finally { setUploading(null); }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <LayoutTemplate className="h-5 w-5" />
          Banner Carrusel — Sección Tienda
        </CardTitle>
        <CardDescription>
          Gestiona hasta 6 banners horizontales que aparecerán en la parte superior de la sección Tienda del portal Reseller.
          Recomendación: imágenes en proporción 1800×310 px (muy apaisadas).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-indigo-200 rounded-lg">
            <LayoutTemplate className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay banners configurados. Agrega el primero.</p>
          </div>
        )}
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  Banner {index + 1}
                </div>
                <button onClick={() => removeSlide(index)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {slide.imageUrl && (
                <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ aspectRatio: "1800/310" }}>
                  <img src={slide.imageUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">URL de imagen</Label>
                <div className="flex gap-2">
                  <Input value={slide.imageUrl} onChange={(e) => updateSlide(index, "imageUrl", e.target.value)}
                    placeholder="https://... o sube una imagen" className="text-sm flex-1" />
                  <input type="file" accept="image/*" className="hidden"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] ?? null)} />
                  <Button type="button" variant="outline" size="sm" disabled={uploading === index}
                    onClick={() => fileInputRefs.current[index]?.click()} className="shrink-0">
                    {uploading === index ? <span className="text-xs">Subiendo...</span> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Título (opcional)</Label>
                  <Input value={slide.title || ""} onChange={(e) => updateSlide(index, "title", e.target.value)}
                    placeholder="Ej: Ofertas de la semana" className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600 flex items-center gap-1"><Link className="h-3 w-3" /> Enlace (opcional)</Label>
                  <Input value={slide.linkUrl || ""} onChange={(e) => updateSlide(index, "linkUrl", e.target.value)}
                    placeholder="https://... o /reseller" className="text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={addSlide} disabled={slides.length >= 6}
            className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
            <Plus className="h-4 w-4 mr-2" /> Agregar Banner
          </Button>
          <Button onClick={onSave} disabled={saving} className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Banners"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Recomendación: imágenes de 1800×310 px (proporción muy apaisada) para mejor visualización.
        </p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
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

  // Carousel state (Panel)
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [savingCarousel, setSavingCarousel] = useState(false);

  // Banner carousel state (Tienda)
  const [bannerSlides, setBannerSlides] = useState<CarouselSlide[]>([]);
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    if (settings) {
      const whatsapp = settings.find((s) => s.key === "whatsapp_number");
      const siteName = settings.find((s) => s.key === "site_name");
      const siteEmail = settings.find((s) => s.key === "site_email");
      const ann = settings.find((s) => s.key === "reseller_announcement");
      const carousel = settings.find((s) => s.key === "reseller_carousel");

      setFormData({
        whatsapp_number: whatsapp?.value || "",
        site_name: siteName?.value || "",
        site_email: siteEmail?.value || "",
      });
      setAnnouncement(ann?.value || "");

      if (carousel?.value) {
        try {
          const parsed = JSON.parse(carousel.value);
          if (Array.isArray(parsed)) setCarouselSlides(parsed);
        } catch {}
      }

      const banner = settings.find((s) => s.key === "reseller_store_banner");
      if (banner?.value) {
        try {
          const parsed = JSON.parse(banner.value);
          if (Array.isArray(parsed)) setBannerSlides(parsed);
        } catch {}
      }
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

  const uploadImageMutation = trpc.admin.uploadImage.useMutation();

  const handleUploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const result = await uploadImageMutation.mutateAsync({
            imageData: base64,
            fileName: file.name,
            type: "product",
          });
          resolve(result.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = [
      { key: "whatsapp_number", value: formData.whatsapp_number, description: "Número de WhatsApp para checkout" },
      { key: "site_name", value: formData.site_name, description: "Nombre del sitio web" },
      { key: "site_email", value: formData.site_email, description: "Email de contacto del sitio" },
    ];
    Promise.all(updates.map((update) => updateMutation.mutateAsync(update)))
      .then(() => toast.success("Configuración actualizada exitosamente"))
      .catch(() => toast.error("Error al actualizar algunas configuraciones"));
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

  const handleSaveCarousel = async () => {
    setSavingCarousel(true);
    try {
      await updateMutation.mutateAsync({
        key: "reseller_carousel",
        value: JSON.stringify(carouselSlides),
        description: "Carrusel de imágenes del panel reseller",
      });
      await utils.admin.settings.list.invalidate();
      toast.success("Carrusel actualizado. Los cambios ya son visibles en el portal reseller.");
    } catch {
      toast.error("Error al guardar el carrusel");
    } finally {
      setSavingCarousel(false);
    }
  };

  const handleSaveBanner = async () => {
    setSavingBanner(true);
    try {
      await updateMutation.mutateAsync({
        key: "reseller_store_banner",
        value: JSON.stringify(bannerSlides),
        description: "Banner carrusel de la sección Tienda del portal reseller",
      });
      await utils.admin.settings.list.invalidate();
      toast.success("Banners de Tienda actualizados. Los cambios ya son visibles.");
    } catch {
      toast.error("Error al guardar los banners");
    } finally {
      setSavingBanner(false);
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

        {/* Carrusel de Imágenes — Panel */}
        <CarouselManager
          slides={carouselSlides}
          onChange={setCarouselSlides}
          onSave={handleSaveCarousel}
          saving={savingCarousel}
          uploadImage={handleUploadImage}
        />

        {/* Banner Carrusel — Tienda */}
        <BannerCarouselManager
          slides={bannerSlides}
          onChange={setBannerSlides}
          onSave={handleSaveBanner}
          saving={savingBanner}
          uploadImage={handleUploadImage}
        />

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
