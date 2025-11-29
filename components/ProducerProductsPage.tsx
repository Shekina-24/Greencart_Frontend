'use client';

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getStoredTokens } from "@/lib/auth/tokens";
import type { Product, ProductImage } from "@/lib/types";
import {
  createMyProduct,
  deleteMyProduct,
  fetchMyProducts,
  updateMyProduct
} from "@/lib/services/producer";
import { uploadImage } from "@/lib/services/uploads";
import ShoppingShell from "./ShoppingShell";
import Modal from "./Modal";
import { useToast } from "@/components/ToastProvider";

const PAGE_SIZE = 10;

interface FormState {
  title: string;
  description: string;
  category: string;
  region: string;
  origin: string;
  price: string;
  promoPrice: string;
  stock: string;
  impactCo2: string;
  dlcDate: string;
  status: string;
  isPublished: boolean;
  images: ProductImage[];
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  region: "",
  origin: "",
  price: "",
  promoPrice: "",
  stock: "",
  impactCo2: "",
  dlcDate: "",
  status: "draft",
  isPublished: false,
  images: []
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: FormState, productId?: number | null) => Promise<void>;
  isSubmitting: boolean;
  initialProduct: Product | null;
  authToken: string | null;
}

function formatPrice(product: Product): string {
  if (typeof product.priceCents === "number") {
    return `${(product.priceCents / 100).toFixed(2)} EUR`;
  }
  return `${product.price.toFixed(2)} EUR`;
}

function buildFormState(product: Product | null): FormState {
  if (!product) {
    return { ...EMPTY_FORM };
  }
  const basePriceCents = product.priceCents ?? Math.round(product.price * 100);
  return {
    title: product.name,
    description: product.description ?? "",
    category: product.category ?? "",
    region: product.region ?? "",
    origin: product.origin ?? "",
    price: (basePriceCents / 100).toFixed(2),
    promoPrice: product.promoPriceCents ? (product.promoPriceCents / 100).toFixed(2) : "",
    stock: typeof product.stock === "number" ? String(product.stock) : "",
    impactCo2: product.impactCo2Grams ? String(product.impactCo2Grams) : "",
    dlcDate: "",
    status: product.status ?? "draft",
    isPublished: Boolean(product.isPublished),
    images: product.images ?? []
  };
}

function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialProduct,
  authToken
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildFormState(initialProduct));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildFormState(initialProduct));
    setUploadError(null);
  }, [initialProduct]);

  const updateField = (field: keyof FormState, value: string | boolean | ProductImage[]) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setUploadError("Session expirée. Reconnectez-vous.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file, authToken);
      setForm((current) => {
        const nextImages = [...current.images, { url, isPrimary: current.images.length === 0 }];
        return { ...current, images: nextImages };
      });
    } catch (error) {
      console.error("[ProducerProducts] Upload failed", error);
      setUploadError("Téléversement impossible. Réessayez avec une image plus légère.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const markPrimary = (index: number) => {
    setForm((current) => {
      const nextImages = current.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index
      }));
      return { ...current, images: nextImages };
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const nextImages = current.images.filter((_, idx) => idx !== index);
      if (!nextImages.some((img) => img.isPrimary) && nextImages.length > 0) {
        nextImages[0] = { ...nextImages[0], isPrimary: true };
      }
      return { ...current, images: nextImages };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void onSubmit(form, initialProduct?.id ?? null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? "Modifier le produit" : "Ajouter un produit"}
      actions={
        <button className="btn btn--primary" type="submit" form="producer-product-form" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : initialProduct ? "Mettre à jour" : "Créer"}
        </button>
      }
    >
      <form id="producer-product-form" className="grid" style={{ gap: "var(--space-3)" }} onSubmit={handleSubmit}>
        <label className="input-label">
          Nom du produit
          <input
            className="input"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>

        <label className="input-label">
          Description
          <textarea
            className="textarea"
            rows={3}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </label>

        <div className="grid" style={{ gap: "var(--space-2)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label className="input-label">
            Catégorie
            <input className="input" value={form.category} onChange={(event) => updateField("category", event.target.value)} />
          </label>
          <label className="input-label">
            Région
            <input className="input" value={form.region} onChange={(event) => updateField("region", event.target.value)} />
          </label>
          <label className="input-label">
            Origine / Unité
            <input className="input" value={form.origin} onChange={(event) => updateField("origin", event.target.value)} />
          </label>
        </div>

        <div className="grid" style={{ gap: "var(--space-2)", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <label className="input-label">
            Prix (EUR)
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              required
            />
          </label>
          <label className="input-label">
            Prix promo (EUR)
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.promoPrice}
              onChange={(event) => updateField("promoPrice", event.target.value)}
            />
          </label>
          <label className="input-label">
            Stock
            <input
              className="input"
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              required
            />
          </label>
          <label className="input-label">
            Impact CO2 (g)
            <input
              className="input"
              type="number"
              min="0"
              value={form.impactCo2}
              onChange={(event) => updateField("impactCo2", event.target.value)}
            />
          </label>
        </div>

        <div className="grid" style={{ gap: "var(--space-2)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label className="input-label">
            DLC (date limite)
            <input
              className="input"
              type="date"
              value={form.dlcDate}
              onChange={(event) => updateField("dlcDate", event.target.value)}
            />
          </label>
          <label className="input-label">
            Statut
            <select
              className="select"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </label>
          <label className="checkbox" style={{ alignSelf: "flex-end" }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            Visible dans le catalogue
          </label>
        </div>

        <div className="grid" style={{ gap: "var(--space-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Images</strong>
            <label className="btn btn--ghost" style={{ cursor: "pointer" }}>
              {uploading ? "Téléversement..." : "Ajouter une image"}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
          {uploadError ? <div className="alert alert--warning">{uploadError}</div> : null}
          {form.images.length === 0 ? (
            <p className="muted">Ajoutez au moins une image pour mettre en avant votre lot.</p>
          ) : (
            <div className="grid" style={{ gap: "var(--space-2)" }}>
              {form.images.map((image, idx) => (
                <div
                  key={image.url}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid var(--border-muted)",
                    padding: "var(--space-2)",
                    borderRadius: 8
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Image
                      src={image.url}
                      alt="Aperçu produit"
                      width={64}
                      height={64}
                      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                    />
                    <span className="muted" style={{ fontSize: "var(--fs-small)" }}>
                      {image.isPrimary ? "Image principale" : "Miniature"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {!image.isPrimary ? (
                      <button className="btn btn--ghost" type="button" onClick={() => markPrimary(idx)}>
                        Définir principale
                      </button>
                    ) : null}
                    <button className="btn btn--ghost" type="button" onClick={() => removeImage(idx)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

function ProducerProductsContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authToken = getStoredTokens()?.accessToken ?? null;

  const loadProducts = useCallback(() => {
    if (!authToken) {
      return;
    }
    setIsLoading(true);
    setError(null);
    void fetchMyProducts(authToken, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
      .then((response) => {
        setProducts(response.items);
        setTotal(response.total);
      })
      .catch((err) => {
        console.error("[ProducerProducts] Failed to fetch products", err);
        setError("Impossible de récupérer vos produits.");
      })
      .finally(() => setIsLoading(false));
  }, [authToken, page]);

  useEffect(() => {
    if (authToken) {
      loadProducts();
    }
  }, [authToken, loadProducts]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (form: FormState, productId?: number | null) => {
    if (!authToken) {
      showToast("Session expirée. Reconnectez-vous.", "warning");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        region: form.region || null,
        origin: form.origin || null,
        dlcDate: form.dlcDate || null,
        impactCo2Grams: form.impactCo2 ? Number(form.impactCo2) : null,
        priceCents: Math.round(Number(form.price || 0) * 100),
        promoPriceCents: form.promoPrice ? Math.round(Number(form.promoPrice) * 100) : null,
        stock: Number(form.stock || 0),
        status: form.status,
        isPublished: form.isPublished,
        images: form.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary }))
      };

      if (!productId) {
        await createMyProduct(authToken, payload);
        showToast("Produit créé avec succès", "success");
      } else {
        await updateMyProduct(authToken, productId, payload);
        showToast("Produit mis à jour", "success");
      }
      closeModal();
      loadProducts();
    } catch (err) {
      console.error("[ProducerProducts] Submit failed", err);
      showToast("Impossible d'enregistrer le produit.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!authToken) return;
    if (!window.confirm(`Supprimer le produit "${product.name}" ?`)) {
      return;
    }
    try {
      await deleteMyProduct(authToken, product.id);
      showToast("Produit supprimé.", "success");
      loadProducts();
    } catch (error) {
      console.error("[ProducerProducts] Delete failed", error);
      showToast("Suppression impossible.", "error");
    }
  };

  const handleTogglePublish = async (product: Product) => {
    if (!authToken) return;
    const nextPublished = !product.isPublished;
    try {
      await updateMyProduct(authToken, product.id, {
        isPublished: nextPublished,
        status: nextPublished ? "published" : "draft"
      });
      showToast(nextPublished ? "Produit publié" : "Produit masqué", "success");
      loadProducts();
    } catch (error) {
      console.error("[ProducerProducts] Toggle publish failed", error);
      showToast("Action impossible.", "error");
    }
  };

  return (
    <>
      <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
        <section className="section">
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div>
                <div className="badge badge--impact">Espace producteur</div>
                <h1 style={{ marginTop: "var(--space-2)" }}>Mes produits</h1>
                <p className="muted">Publiez et mettez à jour vos lots en quelques clics.</p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <button className="btn btn--primary" type="button" onClick={openCreateModal}>
                  Ajouter un produit
                </button>
                <span className="muted" style={{ alignSelf: "center" }}>
                  {isLoading ? "Chargement..." : `${total} produit${total > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>

            {error ? <div className="alert alert--warning">{error}</div> : null}

            {products.length === 0 && !isLoading ? (
              <p className="muted">Commencez par ajouter votre premier produit.</p>
            ) : (
              <div className="grid" style={{ gap: "var(--space-3)" }}>
                {products.map((product) => (
                  <article key={product.id} className="card" style={{ display: "grid", gap: "var(--space-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <strong>{product.name}</strong>
                      <span className="badge">{product.status ?? "draft"}</span>
                    </div>
                    <div className="muted" style={{ fontSize: "var(--fs-small)" }}>
                      {product.category || "Sans catégorie"} · {product.region || "Région n/d"}
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <span>{formatPrice(product)}</span>
                      {typeof product.stock === "number" ? <span>Stock : {product.stock}</span> : null}
                      {product.isPublished ? (
                        <span className="badge badge--impact">Publié</span>
                      ) : (
                        <span className="badge badge--secondary">Masqué</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <button className="btn btn--ghost" type="button" onClick={() => openEditModal(product)}>
                        Modifier
                      </button>
                      <button className="btn btn--ghost" type="button" onClick={() => handleTogglePublish(product)}>
                        {product.isPublished ? "Masquer" : "Publier"}
                      </button>
                      <button className="btn btn--ghost" type="button" onClick={() => handleDelete(product)}>
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
              <button className="btn btn--ghost" type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Précédent
              </button>
              <span className="muted">
                Page {page} / {totalPages}
              </span>
              <button className="btn btn--ghost" type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>
                Suivant
              </button>
            </div>
          </div>
        </section>
      </main>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialProduct={editingProduct}
        authToken={authToken}
      />
    </>
  );
}

export default function ProducerProductsPage() {
  return (
    <ShoppingShell requireAuth requiredRole="producer">
      {() => <ProducerProductsContent />}
    </ShoppingShell>
  );
}
