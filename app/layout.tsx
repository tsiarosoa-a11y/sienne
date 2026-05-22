import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sienne — Budget & Gestion Personnelle",
  description:
    "Application moderne de gestion budgétaire personnelle. Palette terre de Sienne, calculs automatiques, calendrier des paiements.",
};

export const viewport: Viewport = {
  themeColor: "#FDF6F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-dvh bg-bg text-text1 font-sans">
        <AuthProvider>
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
