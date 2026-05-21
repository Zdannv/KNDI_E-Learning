"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  AlertCircle,
  BookOpen,
  Users,
} from "lucide-react";
import { AuthError, useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

function RoleCard({
  role,
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  role: "sensei" | "student";
  label: string;
  description: string;
  icon: React.ElementType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${
        selected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`p-2.5 rounded-xl ${
          selected ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-normal">{description}</p>
      </div>
    </button>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"sensei" | "student">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect away
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password, role);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 6;

  return (
    <div className="w-full max-w-md px-6">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-indigo-600 p-3.5 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-200">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          KNDI Learning
        </h1>
        <p className="text-slate-500 mt-2 text-sm">Buat akun baru</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Daftar akun</h2>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Daftar sebagai
            </label>
            <div className="flex gap-3">
              <RoleCard
                role="student"
                label="Siswa"
                description="Akses materi & kuis"
                icon={Users}
                selected={role === "student"}
                onSelect={() => setRole("student")}
              />
              <RoleCard
                role="sensei"
                label="Sensei"
                description="Kelola materi & kuis"
                icon={BookOpen}
                selected={role === "sensei"}
                onSelect={() => setRole("sensei")}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-username"
              className="block text-sm font-semibold text-slate-700"
            >
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              placeholder="Minimal 3 karakter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="nama@perusahaan.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="text-xs text-red-500 mt-1">Password terlalu pendek.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mendaftar...</span>
              </>
            ) : (
              <span>Buat Akun</span>
            )}
          </button>
        </form>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}