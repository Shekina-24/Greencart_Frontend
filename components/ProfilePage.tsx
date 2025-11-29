'use client';

import { useState } from "react";
import { getStoredTokens } from "@/lib/auth/tokens";
import { updateMe } from "@/lib/services/users";
import type { User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import ShoppingShell from "./ShoppingShell";

function ProfileForm({ user }: { user: User }) {
  const { reloadUser } = useAuth();
  const [firstName, setFirstName] = useState<string>(user.firstName ?? "");
  const [lastName, setLastName] = useState<string>(user.lastName ?? "");
  const [region, setRegion] = useState<string>(user.region ?? "");
  const fullLabel = user.role === "producer" ? "Producteur" : user.role === "admin" ? "Admin" : "Consommateur";
  const [newsletter, setNewsletter] = useState<boolean>(Boolean(user.consentNewsletter));
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(Boolean(user.consentAnalytics));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const tokens = getStoredTokens();
    if (!tokens) {
      setError("Veuillez vous reconnecter.");
      return;
    }

    setIsSaving(true);
    try {
      await updateMe(tokens.accessToken, {
        firstName,
        lastName,
        region,
        consentNewsletter: newsletter,
        consentAnalytics: analyticsConsent
      });
      setSuccess("Profil mis a jour.");
      try { await (reloadUser as any)(); } catch {}
    } catch (err) {
      if (err && typeof err === 'object' && 'payload' in err) {
        const payload = (err as any).payload;
        if (payload && typeof payload === 'object' && 'detail' in payload) {
          const detail = (payload as any).detail;
          setError(typeof detail === 'string' ? detail : "Mise a jour impossible.");
        } else {
          setError("Mise a jour impossible.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Mise a jour impossible.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid" style={{ gap: "var(--space-3)" }} onSubmit={handleSubmit}>
      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge">{fullLabel}</span>
        <div className="muted" style={{ fontSize: "var(--fs-small)" }}>Email : {user.email}</div>
        <div className="muted" style={{ fontSize: "var(--fs-small)" }}>Compte créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</div>
      </div>
      <div className="grid" style={{ gap: "var(--space-2)", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="input-label">
          Prenom
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label className="input-label">
          Nom
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
      </div>
      <label className="input-label">
        Region
        <input className="input" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Occitanie, Ile-de-France, ..." />
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        Recevoir des nouvelles responsables (newsletter)
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={analyticsConsent} onChange={(e) => setAnalyticsConsent(e.target.checked)} />
        Partager des donnees d&apos;usage anonymisees (amelioration)
      </label>
      {user.role === "producer" ? (
        <div className="alert alert--info">
          Profil producteur : rendez-vous sur <strong>Producteurs &gt; Dashboard</strong> pour gérer vos produits, commandes et recommandations IA.
        </div>
      ) : null}
      {user.role === "admin" ? (
        <div className="alert alert--info">
          Profil admin : gérez les utilisateurs et rapports depuis le menu Administration.
        </div>
      ) : null}

      {error ? <div className="alert alert--warning">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}

      <div>
        <button className="btn btn--primary" type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  return (
    <main className="container" style={{ display: "grid", gap: "var(--space-12)" }}>
      <section className="section">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div>
            <div className="badge badge--impact">Mon compte</div>
            <h1 style={{ marginTop: "var(--space-2)" }}>Profil</h1>
            <p className="muted">Mettez a jour vos informations personnelles.</p>
          </div>

          {user ? <ProfileForm user={user} /> : <p className="muted">Veuillez vous connecter.</p>}
        </div>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ShoppingShell requireAuth>
      {() => <ProfileContent />}
    </ShoppingShell>
  );
}
