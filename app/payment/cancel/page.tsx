import Link from "next/link";

export const metadata = {
  title: "Paiement annulé | GreenCart",
  description: "Votre session de paiement a été annulée."
};

export default function PaymentCancel({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const orderId = typeof searchParams?.order === "string" ? searchParams.order : null;
  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-8)", padding: "var(--space-10) 0" }}>
      <section className="section" style={{ textAlign: "center" }}>
        <div className="badge badge--secondary">Paiement annulé</div>
        <h1 style={{ marginTop: "var(--space-2)" }}>Paiement annulé</h1>
        <p className="muted">Vous pouvez réessayer le paiement ou revenir au catalogue.</p>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", marginTop: "var(--space-4)" }}>
          <Link className="btn btn--primary" href="/checkout">Réessayer</Link>
          <Link className="btn btn--ghost" href="/catalogue">Retour au catalogue</Link>
          {orderId ? (
            <Link className="btn btn--ghost" href={`/compte/commandes?order=${orderId}`}>Voir commande #{orderId}</Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

