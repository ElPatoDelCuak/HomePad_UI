import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/Navigation";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomePad - Hogar & Compras",
  description: "Gestor familiar de despensa e inventario doméstico",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HomePad",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <body className="min-h-screen bg-slate-50 text-slate-900 pb-20 lg:pb-0">
        <main className="mx-auto min-h-screen max-w-md relative lg:max-w-6xl lg:pt-20">{children}</main>
        <Navigation />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
