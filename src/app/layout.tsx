"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/navigate/Sidebar";
import LoginScreen from "@/components/login/LoginScreen";
import { useState, useEffect } from "react";
import { dbFire, auth } from "../app/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import "./globals.css";
import AdminDropdown from "@/components/account/AdminDropdown";
import Head from 'next/head';
import { Inter } from 'next/font/google'

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


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
          await setDoc(
            userRef,
            { lastLogin: serverTimestamp() },
            { merge: true }
          );
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins&family=Montserrat&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />

      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!loading && !user && <LoginScreen />}

        {user && (
          <div className="md:flex min-h-screen">
            <div className="hidden md:block">
              <Sidebar collapsed={showSidebar} />
            </div>

            <main className="flex-1 bg-blue-50 overflow-y-auto relative">
              {/* HEADER */}
              <div className="w-full flex items-center justify-between px-6 py-4 shadow-md sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-blue-100 via-sky-200 to-blue-100 border-b border-blue-300/30 transition-all duration-300 font-sans">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSidebar((prev) => !prev)}
                    className="text-sky-700 hover:text-sky-900 focus:outline-none transition-transform duration-200 hover:scale-110"
                    title="Toggle Sidebar"
                  >
                    <svg
                      className="w-7 h-7 md:w-6 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  {!showSidebar ? (
                    <span className="hidden md:inline text-base md:text-lg font-medium text-gray-700 tracking-wider italic transition-all duration-300">
                      admin due to coffee <span className="animate-pulse">☕</span>
                    </span>
                  ) : (
                    <span className="hidden md:inline text-xl font-extrabold text-sky-800 tracking-wider transition-all duration-300">
                      admin due to coffee <span className="animate-pulse">☕</span>
                    </span>
                  )}
                </div>

                <AdminDropdown />
              </div>


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


            {showDrawer && (
              <div className="fixed inset-0 bg-black/40 z-50 md:hidden flex items-end">
                <div className="bg-[#0f0f0f] text-white w-full max-h-[90%] p-4 rounded-t-2xl shadow-lg overflow-y-auto relative">
                  <button
                    className="absolute right-4 top-4 text-white text-xl font-bold"
                    onClick={() => setShowDrawer(false)}
                  >
                    ✕
                  </button>
                  <Sidebar />
                </div>
              </div>
            )}
          </div>
        )}
      </body>
    </html>
  );
}
