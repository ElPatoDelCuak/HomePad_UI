"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/inventory",
    label: "Despensa",
    icon: Package,
  },
  {
    href: "/shopping",
    label: "Compra",
    icon: ShoppingCart,
  },
  {
    href: "/products",
    label: "Productos",
    icon: LayoutGrid,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-md safe-area-bottom lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b"
    >
      <div className="mx-auto flex min-h-16 max-w-md items-center justify-around px-4 lg:max-w-6xl lg:justify-start lg:gap-2 lg:min-h-20 lg:px-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/inventory" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center py-1 transition-all duration-200 lg:min-h-12 lg:flex-none lg:flex-row lg:gap-2 lg:rounded-xl lg:px-4",
                isActive
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-1.5 transition-all duration-200",
                  isActive ? "bg-emerald-50 text-emerald-600" : ""
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
