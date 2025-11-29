'use client';

import ShoppingShell from "@/components/ShoppingShell";
import AdminAnalyticsEmbed from "@/components/AdminAnalyticsEmbed";

export default function AdminBiPage() {
  return (
    <ShoppingShell requireAuth requiredRole="admin">
      {() => <AdminAnalyticsEmbed title="Tableau Power BI" />}
    </ShoppingShell>
  );
}
