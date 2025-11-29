import type { NextWebVitalsMetric } from "next/app";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[WebVitals]", metric.name, Math.round(metric.value), metric.id);
  }
  if (typeof window === "undefined") {
    return;
  }
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  window.dataLayer.push({
    event: "web_vitals",
    metric_id: metric.id,
    metric_name: metric.name,
    metric_label: metric.label,
    metric_value: metric.value
  });
}
