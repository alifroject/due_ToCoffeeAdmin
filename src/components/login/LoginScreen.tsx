// components/LoginScreen.tsx
"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/app/firebase/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white text-black p-8 rounded-xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
