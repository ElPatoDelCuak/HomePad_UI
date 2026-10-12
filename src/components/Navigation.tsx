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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
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
                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200",
                isActive
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive ? "bg-emerald-50 text-emerald-600" : ""
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
