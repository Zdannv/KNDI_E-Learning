"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
import { AuthError, AuthUser, useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

function getDestination(fromParam: string | null, user: AuthUser): string {
  if (fromParam && fromParam !== "/login" && fromParam !== "/register") {
    return fromParam;
  }
  return user.role === "sensei" ? "/admin" : "/courses";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const from = searchParams.get("from");
      router.replace(getDestination(from, user));
    }
  }, [authLoading, user, router, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      const raw = localStorage.getItem("app_token_user");
      if (raw) {
        const loggedInUser: AuthUser = JSON.parse(raw);
        const from = searchParams.get("from");
        router.push(getDestination(from, loggedInUser));
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message === "Invalid username or password" ? "Username atau password salah!" : err.message);
      } else {
        setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-8">
      {/* Brand Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <a href="/" className="flex flex-col items-center group">
          <div className="mb-3 group-hover:scale-105 transition-transform duration-200">
            <img src="/icon_kndi.svg" alt="Logo KNDI" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">
            KNDI Learning
          </h1>
        </a>
        <p className="text-slate-500 mt-2 text-xs text-center font-medium max-w-xs">
          Portal Kelas Bahasa Jepang Karyawan
          <br />
          PT Kyodo News Digital Indonesia
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200/80 p-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-indigo-500 to-rose-500" />
        
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" />
          Masuk ke Akun
        </h2>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl mb-5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <p className="text-sm font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-bold text-slate-650 uppercase tracking-wider"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              placeholder="Masukkan username Anda"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60 text-sm font-medium"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-650 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Masukkan password Anda"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-60 text-sm font-medium"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !username.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl active:scale-[0.98] transition-all shadow-md shadow-indigo-150 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}