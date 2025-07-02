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
  ChevronUp
} from "lucide-react";
import { useState } from "react";

const topNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5 text-white" />,
    subItems: [
      { label: "Sales Analytics", href: "/dashboard/general-analytics" },
      { label: "Inventory Analytics", href: "/dashboard/inventory-analytics" },
    ],
  },
  { label: "Products", href: "/product", icon: <PackageOpen className="w-5 h-5 text-white" /> },
  { label: "Order Queue", href: "/order-queue", icon: <ListOrdered className="w-5 h-5 text-white" /> },
  { label: "Transaction History", href: "/transaction-history", icon: <History className="w-5 h-5 text-white" /> },
  { label: "Discounts Management", href: "/discount", icon: <DollarSign className="w-5 h-5 text-white" /> },
];

const settingItem = {
  label: "Settings",
  href: "/setting",
  icon: <Settings className="w-5 h-5 text-white" />,
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
        "min-h-screen bg-black text-white border-r border-neutral-800 p-4 flex flex-col justify-between transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top section: nav links */}
      <div>
        <h1
          className={cn(
            "text-2xl font-bold mb-6 text-white transition-all duration-300",
            collapsed && "text-sm text-center"
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
                  onClick={() => hasSubItems ? toggleDropdown(item.label) : router.push(item.href)}
                  className={cn(
                    "py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-between",
                    isActive ? "bg-neutral-700 font-semibold" : "",
                    collapsed ? "justify-center" : "space-x-3"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
                    <span>{item.icon}</span>
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
                          "text-sm text-gray-300 hover:text-white py-1 px-2 rounded hover:bg-neutral-800 transition-colors",
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

      {/* Middle section: settings */}
      <div className="my-4">
        <Link
          href={settingItem.href}
          className={cn(
            "flex items-center gap-2 text-white w-full py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors",
            pathname === settingItem.href ? "bg-neutral-700 font-semibold" : "",
            collapsed && "justify-center px-2 gap-0"
          )}
          title={collapsed ? settingItem.label : undefined}
        >
          <span>{settingItem.icon}</span>
          {!collapsed && <span>{settingItem.label}</span>}
        </Link>
      </div>

      {/* Bottom section: logout */}
      <div>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2 text-white w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors",
            collapsed && "justify-center px-2 gap-0"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 text-white" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
