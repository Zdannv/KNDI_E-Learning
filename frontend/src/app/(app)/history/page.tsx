"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowUpDown, BookOpen, CalendarClock,
  ChevronLeft, ChevronRight, ClipboardList, RefreshCw,
  Search, Trophy, Users, XCircle, CheckCircle2,
} from "lucide-react";

import { assignmentApi, HistoryListItem } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 10;

function scoreColorClass(pct: number) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBadgeClass(pct: number) {
  if (pct >= 80) return "bg-green-100 text-green-700";
  if (pct >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function scoreLabel(pct: number) {
  if (pct >= 80) return "Lulus Baik";
  if (pct >= 60) return "Lulus";
  return "Remedial";
}

function HistorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center px-6 py-5 gap-4 border-b border-slate-50 animate-pulse">
          <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-48" />
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
          <div className="h-7 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isSensei = user?.role === "sensei";

  const fetchHistory = useCallback((): Promise<HistoryListItem[]> => {
    if (authLoading || !user) return Promise.resolve([]);
    return isSensei ? assignmentApi.getAllHistory() : assignmentApi.getHistory();
  }, [isSensei, authLoading, user]);

  const { data: history, isLoading: dataLoading, error } = useAsync<HistoryListItem[]>(fetchHistory);
  const isLoading = authLoading || dataLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy,      setSortBy]      = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(() => {
    const list = history ?? [];
    const total        = list.length;
    const passedCount  = list.filter((h) => h.score_percent >= 60).length;
    const averagePct   = total > 0
      ? (list.reduce((acc, h) => acc + h.score_percent, 0) / total).toFixed(1)
      : "0";
    const uniqueStudents = isSensei
      ? new Set(list.map((h) => h.student_name ?? h.assignment_id)).size
      : 0;
    return { total, passedCount, averagePct, uniqueStudents };
  }, [history, isSensei]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (history ?? []).filter((item) => {
      if (isSensei) {
        return (item.student_name ?? "").toLowerCase().includes(q);
      }
      return item.quiz_title.toLowerCase().includes(q);
    });
  }, [history, searchQuery, isSensei]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.completed_at ?? 0).getTime();
      const timeB = new Date(b.completed_at ?? 0).getTime();
      return sortBy === "latest" ? timeB - timeA : timeA - timeB;
    });
  }, [filtered, sortBy]);

  const totalPages  = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated   = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleSort   = (val: "latest" | "oldest") => { setSortBy(val); setCurrentPage(1); };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Score History
          </h1>
          <p className="text-slate-600">
            {isSensei
              ? "Rekap nilai seluruh siswa yang telah menyelesaikan kuis."
              : "Pantau rekapitulasi nilai dan progres kuis bahasa Jepang Anda."}
          </p>
        </div>
        {!isSensei && (
          <Link
            href="/quizzes"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95 shrink-0"
          >
            <BookOpen className="w-5 h-5" />
            <span>Kerjakan Kuis Lagi</span>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      {!isLoading && !error && (history?.length ?? 0) > 0 && (
        <div className={`grid gap-4 ${isSensei ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
          <StatCard label="Total Pengerjaan" value={stats.total}       icon={ClipboardList} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Lulus"            value={stats.passedCount} icon={CheckCircle2}  color="bg-green-50 text-green-600"   />
          <StatCard label="Rata-rata Nilai"  value={`${stats.averagePct}%`} icon={Trophy}   color="bg-amber-50 text-amber-600"  />
          {isSensei && (
            <StatCard label="Siswa" value={stats.uniqueStudents} icon={Users} color="bg-purple-50 text-purple-600" />
          )}
        </div>
      )}

      {/* Search + Sort bar */}
      {!isLoading && !error && (history?.length ?? 0) > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          {/* Search */}
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={isSensei ? "Cari berdasarkan nama siswa..." : "Cari berdasarkan judul kuis..."}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as "latest" | "oldest")}
                className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer"
              >
                <option value="latest">Terakhir Dikerjakan</option>
                <option value="oldest">Pertama Dikerjakan</option>
              </select>
            </div>

            {/* Count */}
            <div className="text-sm text-slate-500 font-medium px-1 shrink-0">
              Total: <span className="font-bold text-slate-800">{sorted.length}</span> data
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <HistorySkeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat riwayat nilai</p>
            <p className="text-sm text-red-500 mt-1">{String(error)}</p>
          </div>
        </div>
      )}
      {/* ── Empty state ── */}
      {!isLoading && !error && (!history || history.length === 0) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchQuery
              ? "Data Tidak Ditemukan"
              : isSensei ? "Belum Ada Siswa yang Mengerjakan Kuis" : "Belum Ada Riwayat Nilai"}
          </h3>
          <p className="text-slate-500 max-w-md leading-relaxed mb-6">
            {searchQuery
              ? "Tidak ditemukan riwayat yang sesuai dengan pencarian Anda."
              : isSensei
                ? "Siswa yang telah menyelesaikan kuis akan muncul di sini."
                : "Segera kerjakan kuis untuk melihat nilai Anda di sini!"}
          </p>
          {!isSensei && !searchQuery && (
            <Link href="/quizzes" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold">
              <span>Pergi ke Daftar Kuis</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && paginated.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  {isSensei && <th className="px-6 py-4 font-semibold">Nama Siswa</th>}
                  <th className="px-6 py-4 font-semibold">Judul Kuis</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengerjaan</th>
                  <th className="px-6 py-4 font-semibold text-center">Nilai</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  {!isSensei && <th className="px-6 py-4 font-semibold text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((item) => {
                  const isRemedial = item.score_percent < 60;
                  return (
                    <tr key={item.assignment_id} className="hover:bg-slate-50 transition-colors">
                      {/* Student name — sensei only */}
                      {isSensei && (
                        <td className="px-6 py-5">
                          <span className="font-semibold text-slate-700">
                            {item.student_name ?? "—"}
                          </span>
                        </td>
                      )}

                      {/* Quiz title */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 line-clamp-1">{item.quiz_title}</span>
                        </div>
                      </td>

                      {/* Date + time */}
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm">
                          <CalendarClock className="w-4 h-4 text-slate-400" />
                          <span>{item.date_str}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.time_str}</span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-5 text-center">
                        <span className={`font-bold text-lg ${scoreColorClass(item.score_percent)}`}>
                          {Math.round(item.score_percent)}%
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${scoreBadgeClass(item.score_percent)}`}>
                          {scoreLabel(item.score_percent)}
                        </span>
                      </td>

                      {/* Retry action — student only */}
                      {!isSensei && (
                        <td className="px-6 py-5 text-center">
                          {isRemedial ? (
                            <Link
                              href={`/quizzes?start=${item.quiz_id}`}
                              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-100"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Coba Ulang</span>
                            </Link>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">Selesai</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  safePage === page
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <span className="sm:hidden text-sm font-semibold text-slate-500">
            Halaman {safePage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function HistoryRow({
  item,
  index,
  isSensei,
}: {
  item: HistoryListItem;
  index: number;
  isSensei: boolean;
}) {
  const passed = item.score_percent >= 60;
 
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors gap-3 md:gap-0">

      <div className={`${isSensei ? "md:col-span-3" : "md:col-span-5"} flex items-center gap-3`}>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
            passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 line-clamp-1">
            {item.quiz_title}
          </p>
        </div>
      </div>
 
      {isSensei && (
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-violet-600">
              {(item.student_name ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700 truncate">
            {item.student_name ?? "—"}
          </span>
        </div>
      )}

      <div className="md:col-span-3 flex items-center gap-2 md:justify-center text-slate-500">
        <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="text-sm">
          <span className="font-medium text-slate-700">{item.date_str}</span>
        </div>
      </div>

      <div className="md:col-span-2 flex md:justify-center">
        <div className="text-center">
          <span
            className={`text-2xl font-black ${scoreColorClass(item.score_percent)}`}
          >
            {item.score_percent.toFixed(0)}
          </span>
        </div>
      </div>

      {/* ── Status badge ── */}
      <div className="md:col-span-2 flex md:justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeClass(
            item.score_percent
          )}`}
        >
          {passed ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          {scoreLabel(item.score_percent)}
        </span>
      </div>
    </div>
  );
}
