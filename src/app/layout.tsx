import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomePad - Hogar & Compras",
  description: "Gestor familiar de despensa e inventario doméstico",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HomePad",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 pb-20 select-none">
        <main className="max-w-md mx-auto min-h-screen relative">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
