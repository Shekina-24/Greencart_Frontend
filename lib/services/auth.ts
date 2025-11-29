'use client';

import { apiFetch } from "@/lib/api";
import { storeTokens, type StoredTokens } from "@/lib/auth/tokens";
import type { User, UserRole } from "@/lib/types";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface ApiUser {
  id: number;
  email: string;
  role: UserRole;
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

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  region?: string;
  consentNewsletter?: boolean;
  consentAnalytics?: boolean;
}

export interface AuthResult {
  user: User;
  tokens: StoredTokens;
}

export async function login(credentials: LoginInput): Promise<AuthResult> {
  const tokens = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

  storeTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  });

  const user = await getCurrentUser(tokens.access_token);
  return {
    user,
    tokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  };
}

export async function register(payload: RegisterInput): Promise<User> {
  const body = {
    email: payload.email,
    password: payload.password,
    role: payload.role ?? "consumer",
    first_name: payload.firstName,
    last_name: payload.lastName,
    region: payload.region,
    consent_newsletter: payload.consentNewsletter ?? false,
    consent_analytics: payload.consentAnalytics ?? false
  };
  const user = await apiFetch<ApiUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return mapUser(user);
}

export async function refreshTokens(refreshTokenValue: string): Promise<StoredTokens> {
  const tokens = await apiFetch<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshTokenValue })
  });

  storeTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  });

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  const user = await apiFetch<ApiUser>("/auth/me", {
    authToken: accessToken
  });
  return mapUser(user);
}

function mapUser(user: ApiUser): User {
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
