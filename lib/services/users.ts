import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

interface ApiUser {
  id: number;
  email: string;
  role: "consumer" | "producer" | "admin";
  first_name: string | null;
  last_name: string | null;
  region: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  consent_newsletter: boolean;
  consent_analytics: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateMeInput {
  firstName?: string | null;
  lastName?: string | null;
  region?: string | null;
  consentNewsletter?: boolean | null;
  consentAnalytics?: boolean | null;
}

export async function updateMe(authToken: string, payload: UpdateMeInput): Promise<User> {
  const body: Record<string, unknown> = {};
  if (payload.firstName !== undefined) body.first_name = payload.firstName;
  if (payload.lastName !== undefined) body.last_name = payload.lastName;
  if (payload.region !== undefined) body.region = payload.region;
  if (payload.consentNewsletter !== undefined) body.consent_newsletter = payload.consentNewsletter;
  if (payload.consentAnalytics !== undefined) body.consent_analytics = payload.consentAnalytics;

  const user = await apiFetch<ApiUser>("/users/me", {
    method: "PATCH",
    authToken,
    body: JSON.stringify(body)
  });
  return mapUser(user);
}

export function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    region: user.region,
    isActive: user.is_active,
    emailVerifiedAt: user.email_verified_at,
    lastLoginAt: user.last_login_at,
    consentNewsletter: user.consent_newsletter,
    consentAnalytics: user.consent_analytics,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

