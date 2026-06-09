"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClipboardList, PlayCircle, Trophy, Calendar, ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";
import { QuizData, MatchingPair } from "@/data/dummyKuis";

interface MatchingStateEntry {
  matchedPairIds: string[];
  leftSelected: string | null;
  rightSelected: string | null;
  flashRed: boolean;
}

interface QuizListViewProps {
  quizzes: QuizData[];
  onStart: (
    quiz: QuizData,
    shuffled: Record<string, { left: MatchingPair[]; right: MatchingPair[] }>,
    initMatching: Record<string, MatchingStateEntry>
  ) => void;
}

export default function QuizListView({ quizzes, onStart }: QuizListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleStart = (quiz: QuizData) => {
    const newShuffled: Record<string, { left: MatchingPair[]; right: MatchingPair[] }> = {};
    const initMatching: Record<string, MatchingStateEntry> = {};

    quiz.questions.forEach((q) => {
      if (q.type === "matching") {
        newShuffled[q.id] = {
          left: [...q.pairs].sort(() => Math.random() - 0.5),
          right: [...q.pairs].sort(() => Math.random() - 0.5),
        };
        initMatching[q.id] = {
          matchedPairIds: [],
          leftSelected: null,
          rightSelected: null,
          flashRed: false,
        };
      }
    });

    onStart(quiz, newShuffled, initMatching);
  };

  // Filter logic: search by title or description
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort logic
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    const dateA = a.createdAt || "2024-01-01";
    const dateB = b.createdAt || "2024-01-01";
    return sortBy === "latest"
      ? new Date(dateB).getTime() - new Date(dateA).getTime()
      : new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedQuizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuizzes = sortedQuizzes.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "latest" | "oldest");
    setCurrentPage(1);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Maret 2024";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Kuis</h1>
          <p className="text-slate-600">Pilih kuis yang tersedia untuk menguji kemampuan bahasa Jepang Anda.</p>
        </div>
        <Link
          href="/riwayat"
          className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-semibold text-indigo-600 hover:bg-slate-50 transition-all flex items-center shrink-0"
        >
          <Trophy className="w-5 h-5 mr-2 text-amber-500" />
          Lihat Riwayat Nilai
        </Link>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search Bar */}
        <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari kuis berdasarkan judul atau deskripsi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sort Date */}
          <div className="flex items-center space-x-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer"
            >
              <option value="latest">Tanggal Dibuat: Terbaru</option>
              <option value="oldest">Tanggal Dibuat: Terlama</option>
            </select>
          </div>
          
          <div className="text-sm text-slate-500 font-medium self-center px-1">
            Total: <span className="font-bold text-slate-800">{sortedQuizzes.length}</span> kuis
          </div>
        </div>
      </div>

      {/* Quizzes Grid or Empty State */}
      {sortedQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-full mb-6 text-indigo-400">
            <ClipboardList className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Kuis Tidak Ditemukan</h3>
          <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
            Tidak ditemukan kuis yang sesuai dengan kata kunci pencarian Anda. Silakan coba kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-all hover:shadow-md hover:border-indigo-100 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="flex items-center text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>{formatDate(quiz.createdAt)}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">{quiz.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{quiz.questions.length} Soal</span>
                <button
                  onClick={() => handleStart(quiz)}
                  className="flex items-center text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-100"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Mulai Kerjakan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  currentPage === page
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <span className="sm:hidden text-sm font-semibold text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
