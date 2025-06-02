"use client";

import { useParams } from "next/navigation";
import EditProfileForm from "./editProfile";

export default function UbahProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full bg-white p-6 rounded shadow">
        
        <EditProfileForm userId={id as string} />
      </div>
    </div>
  );
}
