"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Reports() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/general-analytics");
  }, [router]);

  return null; // 👈 don't render anything
}
