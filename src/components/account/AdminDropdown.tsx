"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { dbFire } from "@/app/firebase/firebase";

export default function AdminDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState("/default-admin.png");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(dbFire, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhotoURL(data.photoURL || "/default-admin.png");
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleChangePassword = () => {
    if (user?.uid) {
      router.push(`/ubahPassword/${user.uid}`);
    } else {
      alert("User ID not found");
    }
  };

  const handleEditProfile = () => {
    if (user?.uid) {
      router.push(`/ubahProfile/${user.uid}`);
    } else {
      alert("User ID not found");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative  inline-block" ref={dropdownRef}>
      <img
        src={photoURL}
        alt="Admin"
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <ul className="text-sm text-gray-700">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleChangePassword}
            >
              Ubah Password Admin
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleEditProfile}
            >
              Edit Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
              onClick={handleSignOut}
            >
              Sign Out
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
