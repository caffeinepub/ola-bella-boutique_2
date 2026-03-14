import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageCircle, Package, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend";
import { Category } from "../backend";
import { useProducts } from "../hooks/useQueries";

interface CatalogPageProps {
  navigate: (path: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  todos: "Todos",
  [Category.bolsas]: "Bolsas",
  [Category.maquillaje]: "Maquillaje",
  [Category.perfumes]: "Perfumes",
};

const CATEGORY_EMOJI: Record<string, string> = {
  todos: "✨",
  [Category.bolsas]: "👜",
  [Category.maquillaje]: "💄",
  [Category.perfumes]: "🌸",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

function buildWhatsAppUrl(product: Product): string {
  const msg = `Hola, me interesa el producto ${product.name} (Código: ${product.productCode}), ¿me pueden dar más información?`;
  return `https://wa.me/4808193963?text=${encodeURIComponent(msg)}`;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <motion.article
        data-ocid={`product.item.${index + 1}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 flex flex-col"
      >
        {/* Image — object-contain so the full product is always visible */}
        <div
          className="relative w-full bg-secondary"
          style={{ aspectRatio: "3/5" }}
        >
          {product.imageId ? (
            <button
              type="button"
              className="absolute inset-0 w-full h-full p-0 border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ cursor: "pointer" }}
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ver imagen de ${product.name}`}
            >
              <img
                src={product.imageId}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <span className="text-xs font-sans">Sin imagen</span>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 pointer-events-none">
            <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] font-sans font-medium backdrop-blur-sm px-1.5 py-0.5">
              {CATEGORY_LABELS[product.category]}
            </Badge>
          </div>
        </div>

        {/* Compact product info below image */}
        <div className="flex flex-col px-3 pt-2 pb-3 gap-2">
          <h3 className="font-sans text-xs font-semibold text-foreground leading-tight line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-1">
            <span className="font-sans text-sm font-bold text-primary">
              ${product.price.toLocaleString("es-MX")}
            </span>
            <span className="text-[10px] text-muted-foreground font-sans bg-muted px-1.5 py-0.5 rounded-full truncate">
              {product.productCode}
            </span>
          </div>

          <a
            data-ocid={`product.button.${index + 1}`}
            href={buildWhatsAppUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full bg-[oklch(0.55_0.18_145)] hover:bg-[oklch(0.48_0.18_145)] text-white font-sans font-medium text-xs py-2 px-3 rounded-xl transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            Más información
          </a>
        </div>
      </motion.article>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            data-ocid="product.modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              data-ocid="product.close_button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              src={product.imageId as string}
              alt={product.name}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-card">
      <div style={{ aspectRatio: "3/5" }} className="w-full overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="px-3 pt-2 pb-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export default function CatalogPage({ navigate: _navigate }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const { data: products = [], isLoading } = useProducts();

  const filtered =
    activeCategory === "todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="relative">
        <div
          className="relative h-[340px] md:h-[420px] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.95 0.03 355) 0%, oklch(0.92 0.04 340) 40%, oklch(0.90 0.05 355) 100%)",
          }}
        >
          <img
            src="/assets/generated/hero-boutique.dim_1200x500.jpg"
            alt="Ola Bella Boutique"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.58 0.10 350 / 0.12) 0%, oklch(0.97 0.012 80 / 0.75) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary/80 font-medium mb-3">
                Tu próxima parada &mdash; Una ola de belleza y elegancia
              </p>
              <h1 className="font-display text-5xl md:text-7xl italic text-foreground mb-3 tracking-tight">
                Ola Bella
              </h1>
              <p
                className="font-display text-lg md:text-xl italic text-primary/90 mb-4"
                style={{ fontStyle: "italic" }}
              >
                Boutique
              </p>
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="font-sans text-sm">
                  Puerto Peñasco, Sonora
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="bg-card border-b border-border shadow-xs">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="font-display text-base font-semibold text-foreground">
                Catálogo
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList
              data-ocid="catalog.tab"
              className="bg-secondary border border-border h-auto p-1 gap-1 flex-wrap"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  data-ocid={`catalog.${key}.tab`}
                  className="font-sans text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg transition-all"
                >
                  <span className="mr-1.5">{CATEGORY_EMOJI[key]}</span>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div
            data-ocid="catalog.loading_state"
            className="grid grid-cols-2 gap-4"
          >
            {SKELETON_KEYS.map((k) => (
              <ProductSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            data-ocid="catalog.empty_state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div
              className="w-24 h-24 rounded-full mb-6 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.94 0.025 355), oklch(0.90 0.04 340))",
              }}
            >
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              {activeCategory === "todos"
                ? "El catálogo está vacío"
                : `Sin productos en ${CATEGORY_LABELS[activeCategory]}`}
            </h2>
            <p className="font-sans text-muted-foreground max-w-sm leading-relaxed">
              {activeCategory === "todos"
                ? "Próximamente encontrarás nuestra selección de productos exclusivos."
                : "Por el momento no hay productos disponibles en esta categoría."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="font-display text-lg italic text-primary/80 mb-1">
            Ola Bella Boutique
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Puerto Peñasco, Sonora, México
          </p>
        </div>
      </footer>
    </div>
  );
}
