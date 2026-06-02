"use client";

import { useRouter } from "next/navigation";
import { Presentation, Award, ClipboardList, LogOut, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grow w-full">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Selamat Datang Kembali!</h1>
                    <p className="text-slate-600">Pilih modul navigasi di bawah ini untuk memulai aktivitas pembelajaran Anda hari ini.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit mb-5">
                                <Presentation className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Materi Kuliah & Pelatihan</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Pelajari slide presentasi dan berkas PDF edukatif yang diunggah oleh Sensei sebagai bahan ajar mandiri Anda.
                            </p>
                        </div>
                        <Link
                            href="/courses"
                            className="mt-6 w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                        >
                            Buka Modul Materi
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit mb-5">
                                <Award className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Kuis & Penugasan</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Kerjakan berbagai tipe latihan kuis interaktif mulai dari mencocokkan kartu kosakata hingga isian singkat.
                            </p>
                        </div>
                        <Link
                            href="/quizzes"
                            className="mt-6 w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                        >
                            Lihat Daftar Kuis
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit mb-5">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Riwayat & Hasil Nilai</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Periksa lembar rekapitulasi evaluasi nilai akhir serta status kelulusan dari kuis yang sudah selesai Anda kerjakan.
                            </p>
                        </div>
                        <Link
                            href="/history"
                            className="mt-6 w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition"
                        >
                            Cek Perkembangan Nilai
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}