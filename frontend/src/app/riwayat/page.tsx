"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Trophy, CalendarClock, BookOpen, AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { QuizHistoryRecord, fallbackHistory } from "@/data/dummyKuis";

export default function RiwayatPage() {
  const [storedHistory, , isClient] = useLocalStorage<QuizHistoryRecord[]>("kndi_history", fallbackHistory);

  const [searchName, setSearchName] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!isClient) return <div className="p-6 h-screen w-full" />; // Hydration guard

  // Filter logic: search by student name
  const filteredHistory = storedHistory.filter((item) => {
    const sName = item.studentName || "Siswa Budi";
    return sName.toLowerCase().includes(searchName.toLowerCase());
  });

  // Sort logic: by date (latest vs oldest)
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const datetimeA = new Date(`${a.dateStr}T${a.timeStr || "00:00:00"}`).getTime();
    const datetimeB = new Date(`${b.dateStr}T${b.timeStr || "00:00:00"}`).getTime();
    return sortBy === "latest" ? datetimeB - datetimeA : datetimeA - datetimeB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "latest" | "oldest");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Riwayat Nilai</h1>
          <p className="text-slate-600">
            Pantau rekapitulasi nilai dan kemajuan kuis bahasa Jepang Anda di sini.
          </p>
        </div>
        
        <Link 
          href="/kuis"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95 shrink-0"
        >
          <BookOpen className="w-5 h-5" />
          <span>Kerjakan Kuis Lagi</span>
        </Link>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search Student Name */}
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama siswa..."
            value={searchName}
            onChange={handleSearchChange}
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
              <option value="latest">Terakhir Ditambahkan</option>
              <option value="oldest">Pertama Kali Ditambahkan</option>
            </select>
          </div>
          
          <div className="text-sm text-slate-500 font-medium self-center px-1">
            Total: <span className="font-bold text-slate-800">{sortedHistory.length}</span> data
          </div>
        </div>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-full mb-6 text-indigo-400">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
          <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
            Tidak ditemukan riwayat pengerjaan kuis yang sesuai dengan kriteria filter Anda.
          </p>
          <Link 
            href="/kuis"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-bold"
          >
            <span>Pergi ke Daftar Kuis</span>
            <ArrowRightIcon className="w-4 h-4 ml-1 mt-0.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 font-semibold">Judul Kuis</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengerjaan</th>
                  <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((history) => {
                  const isRemedial = history.score < 60;
                  return (
                    <tr key={history.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-700">{history.studentName || "Siswa Budi"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-4 shrink-0">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800 line-clamp-1">
                            {history.quizTitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center text-slate-500 text-sm">
                          <CalendarClock className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{history.dateStr}</span>
                          <span className="mx-2 text-slate-300">•</span>
                          <span>{history.timeStr}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center justify-center font-bold text-lg ${
                          history.score >= 80 ? 'text-green-600' :
                          history.score >= 60 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {history.score}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          history.score >= 80 ? 'bg-green-100 text-green-700' :
                          history.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                           {history.score >= 80 ? 'Lulus Baik' :
                            history.score >= 60 ? 'Lulus' : 'Remedial'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {isRemedial ? (
                          <Link 
                            href={`/kuis?start=${history.quizId}`}
                            className="inline-flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-100"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                            <span>Coba Ulang</span>
                          </Link>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
