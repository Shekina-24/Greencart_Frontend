import Link from "next/link";
import dynamic from "next/dynamic";

const ClientPurchaseTracker = dynamic(() => import("@/components/PurchaseTracker"), { ssr: false });

export const metadata = {
  title: "Paiement réussi | GreenCart",
  description: "Confirmation du paiement et de la commande."
};

export default function PaymentSuccess({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const orderId = typeof searchParams?.order === "string" ? searchParams.order : null;
  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-8)", padding: "var(--space-10) 0" }}>
      <ClientPurchaseTracker orderId={orderId ? Number(orderId) : null} />
      <section className="section" style={{ textAlign: "center" }}>
        <div className="badge badge--impact">Paiement confirmé</div>
        <h1 style={{ marginTop: "var(--space-2)" }}>Merci pour votre achat !</h1>
        <p className="muted">Votre paiement a été validé. Vous pouvez consulter le détail de votre commande.</p>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", marginTop: "var(--space-4)" }}>
          <Link className="btn btn--primary" href="/compte/commandes">Voir mes commandes</Link>
          {orderId ? (
            <Link className="btn btn--ghost" href={`/compte/commandes?order=${orderId}&success=1`}>Commande #{orderId}</Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
