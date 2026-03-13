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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { Category } from "../backend";
import { useActor } from "../hooks/useActor";
import { useBlobUpload } from "../hooks/useBlobUpload";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../hooks/useQueries";

const ADMIN_EMAIL = "admin@tutienda.com";
const ADMIN_PASSWORD = "olabella2024";
const STORAGE_KEY = "ola_bella_admin";
const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

interface AdminPageProps {
  navigate: (path: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  [Category.bolsas]: "Bolsas",
  [Category.maquillaje]: "Maquillaje",
  [Category.perfumes]: "Perfumes",
};

interface ProductFormData {
  name: string;
  price: string;
  productCode: string;
  category: string;
  imageUrl: string | null;
}

const emptyForm: ProductFormData = {
  name: "",
  price: "",
  productCode: "",
  category: "",
  imageUrl: null,
};

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      onLogin();
    } else {
      setError("Correo o contraseña incorrectos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.94 0.025 355), oklch(0.88 0.05 345))",
            }}
          >
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Ola Bella
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            Panel de administración
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-sans text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              data-ocid="login.input"
              id="email"
              type="email"
              placeholder="admin@tutienda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-sans"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-sans text-sm font-medium">
              Contraseña
            </Label>
            <Input
              data-ocid="login.input"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-sans"
              required
            />
          </div>

          {error && (
            <p
              data-ocid="login.error_state"
              className="text-sm text-destructive font-sans bg-destructive/10 px-3 py-2 rounded-lg"
            >
              {error}
            </p>
          )}

          <Button
            data-ocid="login.submit_button"
            type="submit"
            className="w-full font-sans font-medium"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function ProductFormModal({
  open,
  onClose,
  editingProduct,
}: {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
}) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { actor, isFetching: actorLoading } = useActor();
  const { uploadFile, progress, isUploading } = useBlobUpload();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        setForm({
          name: editingProduct.name,
          price: editingProduct.price.toString(),
          productCode: editingProduct.productCode,
          category: editingProduct.category,
          imageUrl: editingProduct.imageId ?? null,
        });
        setLocalPreview(editingProduct.imageId ?? null);
      } else {
        setForm(emptyForm);
        setLocalPreview(null);
      }
      setPendingFile(null);
    }
  }, [open, editingProduct]);

  const isActorReady = !!actor && !actorLoading;
  const isSaving = addProduct.isPending || updateProduct.isPending;
  const isSubmitting = isUploading || isSaving;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Just show a local preview; actual upload happens on submit
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setPendingFile(file);
    // Clear the previously saved URL until we upload the new file
    setForm((f) => ({ ...f, imageUrl: null }));
  };

  const handleRemoveImage = () => {
    setLocalPreview(null);
    setPendingFile(null);
    setForm((f) => ({ ...f, imageUrl: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Conectando al servidor, intenta en un momento.");
      return;
    }

    let imageUrl = form.imageUrl;

    // If there's a new file selected, upload it to blob storage first
    if (pendingFile) {
      try {
        imageUrl = await uploadFile(pendingFile);
      } catch (err) {
        toast.error(
          `Error al subir la imagen: ${
            err instanceof Error ? err.message : String(err)
          }`.slice(0, 150),
        );
        return;
      }
    }

    const payload = {
      name: form.name,
      price: Number.parseFloat(form.price),
      description: "",
      productCode: form.productCode,
      category: form.category,
      imageId: imageUrl,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...payload });
        toast.success("Producto actualizado correctamente");
      } else {
        await addProduct.mutateAsync(payload);
        toast.success("Producto agregado correctamente");
      }
      onClose();
    } catch (err) {
      toast.error(
        `Error al guardar: ${
          err instanceof Error ? err.message : String(err)
        }`.slice(0, 150),
      );
    }
  };

  const previewSrc = localPreview ?? form.imageUrl;

  const statusLabel = !isActorReady
    ? "Conectando..."
    : isUploading
      ? `Subiendo imagen... ${progress}%`
      : isSaving
        ? "Guardando..."
        : editingProduct
          ? "Guardar cambios"
          : "Agregar producto";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="product.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editingProduct ? "Editar producto" : "Agregar producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Nombre</Label>
            <Input
              data-ocid="product.input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Bolsa de piel italiana"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Precio (MXN)</Label>
            <Input
              data-ocid="product.input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="Ej. 1200"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Código de producto</Label>
            <Input
              data-ocid="product.input"
              value={form.productCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, productCode: e.target.value }))
              }
              placeholder="Ej. BOL-001"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger data-ocid="product.select">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Foto del producto</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
              style={{ aspectRatio: "16/9" }}
            >
              {previewSrc ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewSrc}
                    alt="Vista previa"
                    className="w-full h-full object-contain bg-secondary"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1 hover:bg-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label
                  data-ocid="product.upload_button"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="font-sans text-sm text-muted-foreground">
                    Haz clic para subir una foto
                  </span>
                  <span className="font-sans text-xs text-muted-foreground">
                    JPG, PNG o WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            {/* Upload progress bar */}
            {isUploading && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="font-sans text-xs text-muted-foreground text-center">
                  Subiendo imagen... {progress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              data-ocid="product.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-sans"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              data-ocid="product.submit_button"
              type="submit"
              disabled={isSubmitting || !form.category || !isActorReady}
              className="font-sans font-medium"
            >
              {isSubmitting || !isActorReady ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {statusLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Producto eliminado");
    } catch {
      toast.error("Error al eliminar el producto");
    }
    setDeleteTarget(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.94 0.025 355), oklch(0.88 0.05 345))",
              }}
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-none">
                Ola Bella
              </h1>
              <p className="font-sans text-xs text-muted-foreground">
                Panel de administración
              </p>
            </div>
          </div>
          <Button
            data-ocid="admin.logout.button"
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="font-sans text-muted-foreground hover:text-foreground gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Productos
            </h2>
            <p className="font-sans text-sm text-muted-foreground mt-0.5">
              {products.length} producto{products.length !== 1 ? "s" : ""} en
              catálogo
            </p>
          </div>
          <Button
            data-ocid="admin.product.open_modal_button"
            onClick={handleAddNew}
            className="font-sans font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </Button>
        </div>

        {isLoading ? (
          <div data-ocid="admin.loading_state" className="space-y-3">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            data-ocid="admin.product.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-border rounded-2xl p-16 text-center"
          >
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin productos
            </h3>
            <p className="font-sans text-sm text-muted-foreground mb-5">
              Agrega tu primer producto al catálogo.
            </p>
            <Button
              data-ocid="admin.product.primary_button"
              onClick={handleAddNew}
              className="font-sans font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </Button>
          </motion.div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            <div className="divide-y divide-border">
              {products.map((product, i) => (
                <motion.div
                  key={product.id.toString()}
                  data-ocid={`admin.product.row.${i + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {product.imageId ? (
                      <img
                        src={product.imageId}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-foreground truncate">
                        {product.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs font-sans font-medium"
                      >
                        {CATEGORY_LABELS[product.category]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="font-sans text-sm font-medium text-primary">
                        ${product.price.toLocaleString("es-MX")} MXN
                      </span>
                      <span className="font-sans text-xs text-muted-foreground">
                        Cód: {product.productCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      data-ocid={`admin.product.edit_button.${i + 1}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      data-ocid={`admin.product.delete_button.${i + 1}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(product)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto py-4 text-center">
        <p className="font-sans text-xs text-muted-foreground">
          © {currentYear}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Creado con ❤️ en caffeine.ai
          </a>
        </p>
      </footer>

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.product.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              ¿Estás segura de que deseas eliminar{" "}
              <strong>{deleteTarget?.name}</strong>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.product.cancel_button"
              className="font-sans"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.product.confirm_button"
              onClick={handleDelete}
              className="font-sans bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPage({ navigate: _navigate }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1",
  );

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
