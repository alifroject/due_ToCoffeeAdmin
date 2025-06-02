"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { dbFire } from "@/app/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Props = {
  userId: string;
};

export default function EditProfileForm({ userId }: Props) {
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("/default-admin.png");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setMessage("User ID tidak ditemukan");
        return;
      }

      try {
        const userDoc = doc(dbFire, "users", userId);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPhotoURL(data.photoURL || "/default-admin.png");
        } else {
          setMessage("User data tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Gagal memuat data pengguna");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoURL(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageAndGetURL = async (file: File): Promise<string> => {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      console.error("Upload image error:", err);
      throw new Error("Gagal mengupload foto");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      setMessage("Kamu harus login sebagai user ini untuk mengubah profil.");
      setLoading(false);
      return;
    }

    try {
      let uploadedPhotoURL = photoURL;

      if (newPhotoFile) {
        uploadedPhotoURL = await uploadImageAndGetURL(newPhotoFile);
      }

      const userDocRef = doc(dbFire, "users", userId);
      await updateDoc(userDocRef, {
        name,
        photoURL: uploadedPhotoURL,
      });

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: uploadedPhotoURL,
      });

      setMessage("✅ Profil berhasil diperbarui.");
      setNewPhotoFile(null);
      setPhotoURL(uploadedPhotoURL);

      // Auto-close success modal
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Update profile error:", error);
      setMessage(error.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md space-y-6"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Kembali
        </button>

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Edit Profil
        </h2>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Foto Profil
          </label>
          <div className="flex items-center gap-4">
            <img
              src={photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full border object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="text-sm text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Batal
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {message.startsWith("✅") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center animate-pop">
            <div className="text-green-500 text-5xl mb-2">✅</div>
            <p className="text-base font-semibold text-gray-700">
              Profil berhasil diperbarui!
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
