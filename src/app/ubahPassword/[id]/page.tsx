// app/ubahPassword/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import ChangePasswordForm from "./changePassword";

export default function UbahPasswordPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md  p-6  ">
       
        <ChangePasswordForm userId={id as string} />
      </div>
    </div>
  );
}
