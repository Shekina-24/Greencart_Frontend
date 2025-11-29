import { apiFetch } from "@/lib/api";

interface UploadResponse {
  url: string;
}

export async function uploadImage(file: File, authToken?: string | null): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(new URL("/api/v1/uploads/image", (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000")), {
    method: "POST",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    body: form,
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  const data = (await response.json()) as UploadResponse;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  const absolute = new URL(data.url, base).toString();
  return absolute;
}

