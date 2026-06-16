"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpDown, BookOpen, ChevronLeft, ChevronRight, Search, Trophy } from "lucide-react";
import { Quiz } from "@/app/lib/use-api";
import QuizCard from "./QuizCard";

interface QuizListViewProps {
    quizzes:          Quiz[];
    onStart:          (quizId: number) => void;
    isStarting:       boolean;
    startError:       string | null;
    isCompetedQuizId: Set<number>;
    remedialQuizId?:  Set<number>;
}

const ITEMS_PER_PAGE = 10;

export default function QuizListView(props: QuizListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy,      setSortBy]      = useState<"latest" | "oldest">("latest");
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = props.quizzes.filter((quiz) => {
        const q = searchQuery.toLowerCase();
        return (
            quiz.title.toLowerCase().includes(q) ||
            (quiz.description ?? "").toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortBy === "latest" ? -diff : diff;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const safePage   = Math.min(currentPage, totalPages);
    const paginated  = sorted.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleSort   = (v: "latest" | "oldest") => { setSortBy(v); setCurrentPage(1); };

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Kuis</h1>
                <p className="text-slate-600">Pilih kuis yang tersedia untuk menguji kemampuan bahasa Jepang Anda.</p>
                </div>
                
                <Link href="/history" className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-semibold text-indigo-600 hover:bg-slate-50 transition-all flex items-center shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                    Lihat Riwayat Nilai
                </Link>
            </div>

            {props.startError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{props.startError}</p>
                </div>
            )}

            {/* Search + Sort */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="grow flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                
                    <input
                        type="text"
                        placeholder="Cari kuis berdasarkan judul atau deskripsi..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                        <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                        
                        <select value={sortBy} onChange={(e) => handleSort(e.target.value as "latest" | "oldest")} className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer">
                            <option value="latest">Tanggal Dibuat: Terbaru</option>
                            <option value="oldest">Tanggal Dibuat: Terlama</option>
                        </select>
                    </div>

                    <div className="text-sm text-slate-500 font-medium self-center px-1">
                        Total: <span className="font-bold text-slate-800">{sorted.length}</span> kuis
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {sorted.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <div className="bg-slate-50 p-5 rounded-full mb-4 border border-slate-100">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {searchQuery ? "Kuis Tidak Ditemukan" : "Belum Ada Kuis"}
                    </h3>
                    
                    <p className="text-slate-500 max-w-sm text-sm">
                        {searchQuery ? "Tidak ditemukan kuis yang sesuai. Silakan coba kata kunci lain." : "Sensei belum memposting kuis apapun. Silakan cek kembali nanti."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginated.map((quiz, index) => {
                        const isPassed = props.isCompetedQuizId.has(quiz.id);
                        const isRemedial = props.remedialQuizId?.has(quiz.id) ?? false;
                        const isDone = isPassed || isRemedial;

                        return (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onStart={props.onStart}
                                isStarted={props.isStarting}
                                isCompleted={isDone}
                                isPassed={isPassed}
                                accentIndex={(safePage - 1) * ITEMS_PER_PAGE + index}
                            />
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safePage === 1} className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                        <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5">

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${safePage === page ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"}`}>
                                {page}
                            </button>
                        ))}
                    </div>

                    <span className="sm:hidden text-sm font-semibold text-slate-500">Halaman {safePage} dari {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safePage === totalPages} className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                        Selanjutnya <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}