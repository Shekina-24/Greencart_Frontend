import { apiFetch } from "@/lib/api";

export interface PublicDataset {
  dataset: string;
  path: string;
  exists: boolean;
  sizeBytes: number;
  updatedAt: number | null;
  count: number;
  sample: Array<Record<string, unknown>>;
}

export interface PublicDatasetList {
  items: PublicDataset[];
}

export async function fetchPublicDatasets(authToken: string): Promise<PublicDatasetList> {
  const res = await apiFetch<{ items: Array<{ dataset: string; path: string; exists: boolean; size_bytes: number; updated_at: number | null; count: number; sample: Array<Record<string, unknown>> }> }>("/admin/public-data", {
    authToken
  });
  return {
    items: res.items.map((item) => ({
      dataset: item.dataset,
      path: item.path,
      exists: item.exists,
      sizeBytes: item.size_bytes,
      updatedAt: item.updated_at,
      count: item.count,
      sample: item.sample
    }))
  };
}

export async function uploadPublicDataset(authToken: string, dataset: string, file: File): Promise<PublicDataset> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(new URL(`/api/v1/admin/public-data/${encodeURIComponent(dataset)}/upload`, process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    body: formData
  });
  if (!res.ok) {
    throw new Error("Upload failed");
  }
  const data = await res.json();
  return {
    dataset: data.dataset,
    path: data.path,
    exists: data.exists,
    sizeBytes: data.size_bytes,
    updatedAt: data.updated_at,
    count: data.count,
    sample: data.sample
  };
}
