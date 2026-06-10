"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-slate-500 font-medium text-sm">Mengalihkan ke halaman masuk...</p>
    </div>
  );
}