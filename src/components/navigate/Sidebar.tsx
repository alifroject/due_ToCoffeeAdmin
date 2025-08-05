"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "../../app/firebase/firebase";
import {
  Home,
  PackageOpen,
  ListOrdered,
  History,
  Settings,
  LogOut,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const topNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
    subItems: [
      { label: "Sales Analytics", href: "/dashboard/general-analytics" },
      { label: "Inventory Analytics", href: "/dashboard/inventory-analytics" },
    ],
  },
  {
    label: "Products",
    href: "/product",
    icon: <PackageOpen className="w-5 h-5" />,
  },
  {
    label: "Order Queue",
    href: "/order-queue",
    icon: <ListOrdered className="w-5 h-5" />,
  },
  {
    label: "Transaction History",
    href: "/transaction-history",
    icon: <History className="w-5 h-5" />,
  },
  {
    label: "Discounts ",
    href: "/discount",
    icon: <DollarSign className="w-5 h-5" />,
  },
];

const settingItem = {
  label: "Settings",
  href: "/setting",
  icon: <Settings className="w-5 h-5" />,
};

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "min-h-screen text-white p-4 flex flex-col justify-between transition-all duration-300 shadow-xl border-r border-white/10 backdrop-blur-md",
        "bg-gradient-to-b from-neutral-900 via-black to-neutral-900/90",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top section */}
      <div>
        <h1
          className={cn(
            "text-2xl font-bold mb-6 transition-all duration-300 tracking-wide",
            collapsed ? "text-sm text-center" : "text-white"
          )}
        >
          {collapsed ? "☕" : "Coffee Admin"}
        </h1>

        <nav className="flex flex-col space-y-2">
          {topNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openDropdowns[item.label];

            return (
              <div key={item.href} className="flex flex-col">
                <button
                  onClick={() =>
                    hasSubItems ? toggleDropdown(item.label) : router.push(item.href)
                  }
                  className={cn(
                    "py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-between group",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-800 font-semibold shadow-md"
                      : "hover:bg-white/10",
                    collapsed ? "justify-center" : "space-x-3"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
                    <span className="group-hover:text-emerald-400 transition-colors duration-200">
                      {item.icon}
                    </span>
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                  {!collapsed && hasSubItems && (
                    isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Subitems */}
                {hasSubItems && isOpen && !collapsed && (
                  <div className="ml-8 mt-1 flex flex-col space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "text-sm text-gray-300 hover:text-white py-1 px-2 rounded-lg hover:bg-white/10 transition-all duration-200",
                          pathname === sub.href ? "bg-neutral-700 text-white font-semibold" : ""
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

    

     
    </aside>
  );
}
