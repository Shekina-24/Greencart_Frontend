'use client';

import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ToastProvider";
import GtmProvider from "@/components/GtmProvider";
import ConsentBanner from "@/components/ConsentBanner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <GtmProvider />
        <ConsentBanner />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
