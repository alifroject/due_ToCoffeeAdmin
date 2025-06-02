"use client";

import { useState, useEffect } from "react";
import { auth } from "@/app/firebase/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

export default function ChangePasswordForm({ userId }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    current: "",
    newPass: "",
    repeat: "",
  });

  const router = useRouter();

  // Live validation while typing
  useEffect(() => {
    const newErrors = { ...errors };

    if (
      newPassword &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newPassword)
    ) {
      newErrors.newPass =
        "⚠️ Password must include uppercase, lowercase, and a special character.";
    } else {
      newErrors.newPass = "";
    }

    if (repeatPassword && newPassword !== repeatPassword) {
      newErrors.repeat = "⚠️ Confirm password must match the new password.";
    } else {
      newErrors.repeat = "";
    }

    setErrors(newErrors);
  }, [newPassword, repeatPassword]);

  const validate = () => {
    let valid = true;
    const newErrors = {
      current: "",
      newPass: "",
      repeat: "",
    };

    if (!currentPassword) {
      newErrors.current = "⚠️ Please fill up this field.";
      valid = false;
    }

    if (!newPassword) {
      newErrors.newPass = "⚠️ Please fill up this field.";
      valid = false;
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newPassword)
    ) {
      newErrors.newPass =
        "⚠️ Password must include uppercase, lowercase, and a special character.";
      valid = false;
    }

    if (!repeatPassword) {
      newErrors.repeat = "⚠️ Please fill up this field.";
      valid = false;
    } else if (newPassword !== repeatPassword) {
      newErrors.repeat = "⚠️ Confirm password must match the new password.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      setMessage("❌ Autentikasi gagal. Silakan login kembali.");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      // Set success message to trigger modal
      setMessage("✅ Password berhasil diperbarui.");

      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setErrors({ current: "", newPass: "", repeat: "" });
    } catch (error: any) {
      setMessage(`❌ ${error.message || "Terjadi kesalahan."}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (message.startsWith("✅")) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2000); // Popup visible for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);


  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200 relative">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Ganti Password
      </h2>

      <form onSubmit={handleChangePassword} className="space-y-6">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Password Saat Ini
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`mt-1 text-black block w-full rounded-md border ${errors.current ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2`}
            required
          />
          {errors.current && (
            <p className="text-red-600 text-sm mt-1">{errors.current}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Password Baru
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`mt-1 text-black block w-full rounded-md border ${errors.newPass ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2`}
            required
          />
          <p className="text-gray-500 text-xs mt-1">
            Password must contain:
            <br />
            • Uppercase letter
            <br />
            • Lowercase letter
            <br />
            • Special character (!@#$%^&*)
          </p>
          {errors.newPass && (
            <p className="text-red-600 text-sm mt-1">{errors.newPass}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="repeatPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Ulangi Password Baru
          </label>
          <input
            id="repeatPassword"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={`mt-1 text-black block w-full rounded-md border ${errors.repeat ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2`}
            required
          />
          {errors.repeat && (
            <p className="text-red-600 text-sm mt-1">{errors.repeat}</p>
          )}
        </div>

        {/* Message (Error) */}
        {message && !message.startsWith("✅") && (
          <div className="text-sm text-center font-medium text-red-600">
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-1/2 bg-gray-200 text-gray-800 font-semibold py-2 rounded-md hover:bg-gray-300 transition"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {message.startsWith("✅") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center animate-pop max-w-xs mx-4">
            <div className="text-green-500 text-5xl mb-2">✅</div>
            <p className="text-base font-semibold text-gray-700">
              Password berhasil diperbarui!
            </p>
          </div>
          <style jsx>{`
            @keyframes pop {
              0% {
                transform: scale(0.5);
                opacity: 0;
              }
              50% {
                transform: scale(1.2);
                opacity: 1;
              }
              100% {
                transform: scale(1);
              }
            }
            .animate-pop {
              animation: pop 0.4s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
