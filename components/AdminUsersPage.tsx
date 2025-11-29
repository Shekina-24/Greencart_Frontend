'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getStoredTokens } from '@/lib/auth/tokens';
import { apiFetch } from '@/lib/api';
import ShoppingShell from '@/components/ShoppingShell';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'consumer' | 'producer' | 'admin';

interface UserRead {
  id: number;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  region: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserListResponse {
  items: UserRead[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchUsers(authToken: string, params: { limit?: number; offset?: number } = {}): Promise<UserListResponse> {
  return apiFetch<UserListResponse>(`/admin/users`, { authToken, params: { limit: params.limit ?? 50, offset: params.offset ?? 0 } });
}

async function updateUserRole(authToken: string, userId: number, role: UserRole): Promise<UserRead> {
  return apiFetch<UserRead>(`/admin/users/${userId}/role`, { method: 'PATCH', authToken, body: JSON.stringify({ role }) });
}

async function updateUserStatus(authToken: string, userId: number, isActive: boolean): Promise<UserRead> {
  return apiFetch<UserRead>(`/admin/users/${userId}/status`, { method: 'PATCH', authToken, body: JSON.stringify({ is_active: isActive }) });
}

async function createUser(authToken: string, payload: { email: string; password: string; role: UserRole }): Promise<UserRead> {
  return apiFetch<UserRead>(`/admin/users`, { method: 'POST', authToken, body: JSON.stringify(payload) });
}

async function deleteUser(authToken: string, userId: number): Promise<void> {
  await apiFetch(`/admin/users/${userId}`, { method: 'DELETE', authToken });
}

function RoleSelect({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value as UserRole)}>
      <option value="consumer">Consommateur</option>
      <option value="producer">Producteur</option>
      <option value="admin">Admin</option>
    </select>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("consumer");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    setIsLoading(true);
    setError(null);
    void fetchUsers(tokens.accessToken)
      .then((res) => setUsers(res.items))
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setIsLoading(false));
  }, []);

  const onRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      const tokens = getStoredTokens();
      if (!tokens) return;
      const updated = await updateUserRole(tokens.accessToken, userId, newRole);
      setUsers((cur) => cur.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
    } catch {
      // ignore for now
    }
  };

  const onStatusToggle = async (userId: number, isActive: boolean) => {
    try {
      const tokens = getStoredTokens();
      if (!tokens) return;
      const updated = await updateUserStatus(tokens.accessToken, userId, isActive);
      setUsers((cur) => cur.map((u) => (u.id === updated.id ? { ...u, is_active: updated.is_active } : u)));
    } catch {
      // ignore
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = getStoredTokens();
    if (!tokens) return;
    setError(null);
    try {
      const created = await createUser(tokens.accessToken, { email, password, role });
      setUsers((cur) => [created, ...cur]);
      setEmail("");
      setPassword("");
      setRole("consumer");
    } catch (err) {
      setError("Création impossible (email déjà utilisé ?)");
    }
  };

  const onDelete = async (userId: number) => {
    const tokens = getStoredTokens();
    if (!tokens) return;
    try {
      await deleteUser(tokens.accessToken, userId);
      setUsers((cur) => cur.filter((u) => u.id !== userId));
    } catch {
      // ignore errors
    }
  };

  const userCount = useMemo(() => users.length, [users]);

  return (
    <main className="container" style={{ display: 'grid', gap: 'var(--space-12)' }}>
      <nav aria-label="Fil d'ariane" style={{ fontSize: 'var(--fs-small)' }}>
        <Link className="muted" href="/">Accueil</Link>
        {" / Admin / Utilisateurs"}
      </nav>

      <section className="section">
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div>
            <div className="badge badge--impact">Administration</div>
            <h1 style={{ marginTop: 'var(--space-2)' }}>Utilisateurs</h1>
            <p className="muted">Création, activation et gestion des rôles ({userCount}).</p>
          </div>

          <div className="card" style={{ display: 'grid', gap: 8 }}>
            <strong>Créer un utilisateur</strong>
            <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }} onSubmit={onCreate}>
              <label className="input-label">
                Email
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="input-label">
                Mot de passe
                <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className="input-label">
                Rôle
                <RoleSelect value={role} onChange={setRole} />
              </label>
              <div style={{ alignSelf: 'end' }}>
                <button className="btn btn--primary" type="submit">Créer</button>
              </div>
            </form>
          </div>

          {error ? <div className="alert alert--warning">{error}</div> : null}
          {isLoading ? (
            <p className="muted">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="muted">Aucun utilisateur.</p>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Nom</th>
                    <th>Région</th>
                    <th>Créé</th>
                    <th>Actif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>
                        <RoleSelect value={u.role} onChange={(r) => onRoleChange(u.id, r)} />
                      </td>
                      <td>{u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}</td>
                      <td>{u.region ?? '—'}</td>
                      <td>{new Date(u.created_at).toLocaleString('fr-FR')}</td>
                      <td>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={u.is_active}
                            onChange={(e) => onStatusToggle(u.id, e.target.checked)}
                            disabled={currentUser?.id === u.id}
                          />
                          <span className="muted" style={{ fontSize: 'var(--fs-small)' }}>{u.is_active ? 'Actif' : 'Inactif'}</span>
                        </label>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn--ghost"
                            type="button"
                            onClick={() => onRoleChange(u.id, u.role === 'consumer' ? 'producer' : 'consumer')}
                          >
                            Basculer C/P
                          </button>
                          <button
                            className="btn btn--ghost"
                            type="button"
                            onClick={() => onDelete(u.id)}
                            disabled={currentUser?.id === u.id}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <ShoppingShell requireAuth requiredRole="admin">
      {() => <AdminUsersContent />}
    </ShoppingShell>
  );
}
