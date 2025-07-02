"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/navigate/Sidebar";
import LoginScreen from "@/components/login/LoginScreen";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, dbFire } from "@/app/firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import AdminDropdown from "@/components/account/AdminDropdown";

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Restore dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      const isDark = saved === "true";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  // Toggle dark mode and update class
  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userRef = doc(dbFire, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email || "",
            name: currentUser.displayName || "Admin",
            photoURL: currentUser.photoURL || "/default-admin.png",
            role: "admin",
            phoneNumber: currentUser.phoneNumber || "",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isActive: true,
          });
        } else {
          await setDoc(userRef, {
            lastLogin: serverTimestamp(),
          }, { merge: true });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) return <LoginScreen />;

  return (
    <div className="md:flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={showSidebar} />
      </div>

      {/* Main */}
      <main className="flex-1 bg-white dark:bg-black text-black dark:text-white overflow-y-auto relative">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 shadow bg-blue-200 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar((prev) => !prev)} className="text-black focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 hidden md:inline">admin due to coffee</span>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="text-black dark:text-white text-xl"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <AdminDropdown />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowDrawer(true)}
            className="bg-black text-white py-2 px-4 rounded-full shadow-lg"
          >
            Menu
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
