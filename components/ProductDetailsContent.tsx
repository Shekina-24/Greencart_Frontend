import { Clock3, Leaf, MapPin, PackageOpen } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/lib/types";

interface ProductDetailsContentProps {
  product: Product;
  afterDescription?: React.ReactNode;
}

function getDlcMessage(days: number) {
  if (days <= 3) {
    return "DLC proche : planifiez votre consommation.";
  }

  if (days <= 7) {
    return "A consommer dans la semaine.";
  }

  return "DLC confortable pour vos menus a venir.";
}

export default function ProductDetailsContent({
  product,
  afterDescription
}: ProductDetailsContentProps) {
  const dlcMessage = getDlcMessage(product.dlcDays);

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <Image
        src={product.image}
        alt={product.name}
        width={680}
        height={420}
        sizes="(max-width: 900px) 90vw, 640px"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--gc-border)",
          objectFit: "cover"
        }}
        priority
      />

      <div className="grid" style={{ gap: "var(--space-3)" }}>
        <div className="meta" style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <PackageOpen size={18} strokeWidth={1.5} aria-hidden />
            <span>{product.unit}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <MapPin size={18} strokeWidth={1.5} aria-hidden />
            <span>{product.region}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Leaf size={18} strokeWidth={1.5} aria-hidden />
            <strong>{product.co2Saved.toFixed(1)} kg CO2e evites</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Clock3 size={18} strokeWidth={1.5} aria-hidden />
            <span>DLC {product.dlcDays} jours</span>
          </div>
        </div>

        <div className="alert alert--warning" role="status">
          <Clock3 size={18} strokeWidth={1.5} aria-hidden />
          <div>
            <strong style={{ display: "block" }}>Conseil anti-gaspi</strong>
            <span>{dlcMessage}</span>
          </div>
        </div>

        <div>
          <strong>{product.price.toFixed(2)} EUR</strong>
          <p className="muted" style={{ marginTop: "var(--space-2)" }}>
            {product.description}
          </p>
        </div>

        {afterDescription}
      </div>
    </div>
  );
}

