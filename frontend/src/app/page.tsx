"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  FileText,
  ArrowRight,
  Download,
  Users,
  Globe,
  Award,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon_kndi.svg" alt="Logo KNDI" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              KNDI Learning
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">Tentang Kelas</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Fitur</a>
            <a href="#quiz-types" className="hover:text-indigo-600 transition-colors">Model Kuis</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <Link
                href={user.role === "sensei" ? "/admin" : "/courses"}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold py-2 px-5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-200 active:scale-95"
              >
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold py-2 px-5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-200 active:scale-95"
              >
                Masuk <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-white border-b border-slate-200/50">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] rounded-full bg-indigo-50/60 blur-3xl -z-10" />
        <div className="absolute -bottom-8 left-10 w-80 h-80 rounded-full bg-rose-50/50 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-semibold text-xs tracking-wider uppercase">
              <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
              Nihongo Training Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Jembatan Komunikasi, <br />
              <span className="bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent">
                Gerbang Kolaborasi
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mx-auto max-w-2xl">
              Sebagai bagian dari perusahaan Jepang, kelancaran komunikasi adalah kunci kesuksesan bersama. 
              Program pelatihan internal ini hadir untuk membekali para programmer dan staf PT Kyodo News Digital Indonesia 
              dengan keterampilan bahasa Jepang taktis yang dibutuhkan langsung dalam meeting, diskusi proyek, dan kolaborasi harian.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <Link
                  href={user.role === "sensei" ? "/admin" : "/courses"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-98"
                >
                  Masuk Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-98"
                >
                  Mulai Belajar Sekarang
                </Link>
              )}
              <a
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl transition-all"
              >
                Pelajari Selengkapnya
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Background Story Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Latar Belakang & Tujuan</h2>
            <div className="w-12 h-1.5 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-6 text-lg leading-relaxed">
              Mengenal lebih dekat mengapa platform dan kelas pembelajaran bahasa Jepang ini dibentuk khusus untuk karyawan PT KNDI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Story Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Menjembatani Bahasa & Budaya</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sebagai anak perusahaan dari perusahaan pers Jepang, atasan dan klien kami mayoritas adalah penutur asli bahasa Jepang. 
                  Meskipun divisi **Communicator** selalu bersiap sebagai penerjemah dan penengah antara atasan/klien dengan tim programmer, 
                  muncul antusiasme dari tim developer sendiri untuk memahami bahasa Jepang demi koordinasi yang lebih natural dan efisien.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-rose-600 text-xs font-bold uppercase tracking-wider">
                <span>Kyodo News Digital Indonesia</span>
              </div>
            </div>

            {/* Story Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Inisiatif Kelas Khusus Karyawan</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mendengar keinginan para staf, Manager PT KNDI resmi menginisiasi kelas bahasa Jepang mingguan untuk seluruh divisi. 
                  Rekan-rekan dari divisi **Communicator** bertindak sebagai **Sensei**, menyusun kurikulum, membagikan modul modul penting, 
                  serta menguji pemahaman lewat kuis interaktif. Aplikasi e-learning ini dirancang khusus untuk mewadahi aktivitas pembelajaran tersebut secara digital.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <span>Communicator Team as Sensei</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fitur & Layanan Utama</h2>
            <div className="w-12 h-1.5 bg-indigo-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-6 text-lg">
              Semua fitur dirancang sesederhana mungkin untuk mempermudah pengerjaan dan monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col space-y-4 group hover:bg-indigo-50/20 hover:border-indigo-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Akses Modul Online</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Karyawan dapat melihat daftar modul pembelajaran bahasa Jepang terstruktur yang diunggah langsung oleh Sensei.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col space-y-4 group hover:bg-rose-50/20 hover:border-rose-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Unduh Materi Pembelajaran</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dapatkan salinan materi dalam format PDF/dokumen presentasi untuk dipelajari kapan saja secara luring (offline).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col space-y-4 group hover:bg-purple-50/20 hover:border-purple-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Evaluasi Melalui Kuis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tantang kemampuan Anda setelah membaca modul. Kerjakan kuis yang disediakan dan langsung lihat hasil skor serta pembahasannya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Types Showcase Section */}
      <section id="quiz-types" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Variasi Soal Kuis</h2>
            <div className="w-12 h-1.5 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-6 text-lg">
              Untuk mempercepat daya serap ingatan, kuis kami memiliki 4 format variasi soal:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Type 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">Format 1</span>
              <h4 className="text-base font-bold text-slate-800">Pilihan Ganda</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Memilih jawaban yang tepat dari beberapa opsi. Cocok untuk menguji pemahaman arti kosa kata (Vocab).
              </p>
            </div>

            {/* Type 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">Format 2</span>
              <h4 className="text-base font-bold text-slate-800">Isian Singkat</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mengisi kolom kosong secara langsung dengan ejaan romaji atau hiragana yang tepat. Melatih ejaan bahasa.
              </p>
            </div>

            {/* Type 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700">Format 3</span>
              <h4 className="text-base font-bold text-slate-800">Matching Choice</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Menghubungkan kartu di sisi kiri dengan kartu pasangan di sisi kanan. Melatih asosiasi kanji dan artinya.
              </p>
            </div>

            {/* Type 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700">Format 4</span>
              <h4 className="text-base font-bold text-slate-800">Esai / Uraian</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Menuliskan kalimat bahasa Jepang utuh atau menjawab penjelasan tata bahasa (Grammar) secara terperinci.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white">
            <img src="/icon_kndi.svg" alt="Logo KNDI" className="w-6 h-6 object-contain" />
            <span className="font-bold tracking-wider text-sm uppercase">PT Kyodo News Digital Indonesia</span>
          </div>
          <p className="text-xs opacity-75">
            © {new Date().getFullYear()} KNDI Nihongo E-Learning Platform. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="text-[10px] opacity-50">
            Dikembangkan secara khusus untuk kolaborasi internal programmer dan divisi communicator KNDI.
          </p>
        </div>
      </footer>
    </div>
  );
}
