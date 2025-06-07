"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "../../app/firebase/firebase";

// ✅ Import Lucide Icons
import {
  Home,
  PackageOpen,
  ListOrdered,
  History,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

const topNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5 text-white" /> },
  { label: "Products", href: "/product", icon: <PackageOpen className="w-5 h-5 text-white" /> },
  { label: "Order Queue", href: "/order-queue", icon: <ListOrdered className="w-5 h-5 text-white" /> },
  { label: "Transaction History", href: "/transaction-history", icon: <History className="w-5 h-5 text-white" /> },
  { label: "Reports", href: "/report", icon: <BarChart className="w-5 h-5 text-white" /> },
];

const settingItem = {
  label: "Settings",
  href: "/setting",
  icon: <Settings className="w-5 h-5 text-white" />,
};

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

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
          {topNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors flex items-center space-x-3",
                pathname === item.href ? "bg-neutral-700 font-semibold" : "",
                collapsed && "justify-center px-2 space-x-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
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
