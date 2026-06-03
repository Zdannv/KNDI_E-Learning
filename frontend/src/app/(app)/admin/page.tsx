"use client";

/**
 * src/app/(app)/admin/page.tsx
 *
 * Sensei analytics dashboard.
 *
 * Fixes:
 *   - Each API call is individually wrapped so one failure doesn't break
 *     the whole dashboard. Materials/quizzes with null response default to [].
 *   - Stats are computed with null-safe defaults so the page always renders.
 */

import React, { useCallback, useMemo } from "react";
import {
  BookOpen,
  FileText,
  Trophy,
  Users,
  Target,
  Activity,
  Medal,
  Clock,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import {
  assignmentApi,
  HistoryListItem,
  materialApi,
  quizApi,
} from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";

// ─── Combined fetch ────────────────────────────────────────────────────────────

interface DashboardData {
  totalMateri: number;
  totalKuis:   number;
  history:     HistoryListItem[];
}

// ─── Loading skeletons ────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-36">
      <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
      <div className="h-3 bg-slate-200 rounded w-32 mb-2" />
      <div className="h-8 bg-slate-200 rounded w-16" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-6 py-4">
        <div className="h-6 w-6 bg-slate-200 rounded-full mx-auto animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-28 animate-pulse" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-slate-200 rounded w-24 mx-auto animate-pulse" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-6 bg-slate-200 rounded w-12 ml-auto animate-pulse" />
      </td>
    </tr>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColorText(pct: number) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreColorBg(pct: number) {
  if (pct >= 80) return "bg-green-50 text-green-600";
  if (pct >= 60) return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-600";
}

function displayName(assignmentId: number) {
  return `Siswa #${String(assignmentId).padStart(4, "0")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  /**
   * Each API call is individually wrapped with a fallback so that:
   *   - If materials returns null/throws → default to []
   *   - If quizzes returns null/throws   → default to []
   *   - If history returns null/throws   → default to []
   *
   * This means the dashboard always renders something useful even if
   * one endpoint is temporarily unavailable or returns no data.
   */
  const fetchAll = useCallback(
    async (): Promise<DashboardData> => {
      const [materials, quizzes, history] = await Promise.all([
        materialApi.getAll().catch(() => []),
        quizApi.list().catch(() => []),
        assignmentApi.getAllHistory().catch(() => []),
      ]);

      return {
        totalMateri: (materials ?? []).length,
        totalKuis:   (quizzes  ?? []).length,
        history:     history  ?? [],
      };
    },
    []
  );

  const { data, isLoading, error, refetch } = useAsync<DashboardData>(fetchAll);

  // ── Derived stats — always safe to compute ─────────────────────────────────
  const stats = useMemo(() => {
    const history       = data?.history ?? [];
    const totalAttempts = history.length;
    const avgPct        = totalAttempts > 0
      ? (history.reduce((acc, h) => acc + h.score_percent, 0) / totalAttempts).toFixed(1)
      : "0.0";
    const passRate      = totalAttempts > 0
      ? ((history.filter((h) => h.score_percent >= 60).length / totalAttempts) * 100).toFixed(0)
      : "0";

    return {
      totalMateri:  data?.totalMateri  ?? 0,
      totalKuis:    data?.totalKuis    ?? 0,
      totalAttempts,
      avgPct,
      passRate,
    };
  }, [data]);

  const topPerformers = useMemo(
    () =>
      [...(data?.history ?? [])]
        .sort((a, b) => b.score_percent - a.score_percent)
        .slice(0, 5),
    [data]
  );

  const recentActivities = useMemo(
    () => (data?.history ?? []).slice(0, 5),
    [data]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Analitik</h1>
        <p className="text-slate-600">
          Pantau ringkasan performa siswa, total materi, dan tingkat partisipasi kuis.
        </p>
      </div>

      {/* Non-fatal error banner — still shows the rest of the page */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Sebagian data gagal dimuat. Menampilkan data yang tersedia.
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-sm font-semibold shrink-0 hover:text-amber-900"
          >
            <RefreshCw className="w-4 h-4" /> Muat ulang
          </button>
        </div>
      )}

      {/* ── Stat cards — always rendered, show 0 when no data ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>{[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}</>
        ) : (
          <>
            {/* Total Materi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Aktif</span>
                </div>
                <p className="text-slate-500 font-medium text-sm mb-1">Total Materi</p>
                <div className="text-3xl font-black text-slate-800">{stats.totalMateri}</div>
                {stats.totalMateri === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Belum ada materi</p>
                )}
              </div>
            </div>

            {/* Total Kuis */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-slate-500 font-medium text-sm mb-1">Total Kuis</p>
                <div className="text-3xl font-black text-slate-800">{stats.totalKuis}</div>
                {stats.totalKuis === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Belum ada kuis</p>
                )}
              </div>
            </div>

            {/* Total Partisipasi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  {stats.totalAttempts > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Lulus: {stats.passRate}%
                    </span>
                  )}
                </div>
                <p className="text-slate-500 font-medium text-sm mb-1">Total Pengerjaan Kuis</p>
                <div className="text-3xl font-black text-slate-800">{stats.totalAttempts}</div>
                {stats.totalAttempts === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Belum ada siswa mengerjakan</p>
                )}
              </div>
            </div>

            {/* Rata-rata Nilai */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-slate-500 font-medium text-sm mb-1">Rata-Rata Nilai</p>
                <div className="flex items-baseline gap-1">
                  <div className="text-3xl font-black text-slate-800">{stats.avgPct}</div>
                  <span className="text-sm font-semibold text-slate-400">%</span>
                </div>
                {stats.totalAttempts === 0 && (
                  <p className="text-xs text-slate-400 mt-1">Belum ada data</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Leaderboard + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Bintang Kelas (Top 5 Nilai)</h2>
          </div>

          <div className="flex-1 overflow-x-auto">
            {isLoading ? (
              <table className="w-full">
                <tbody>{[...Array(3)].map((_, i) => <TableRowSkeleton key={i} />)}</tbody>
              </table>
            ) : topPerformers.length === 0 ? (
              /* Empty state — NOT an error, just no data yet */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-slate-50 p-5 rounded-full mb-4 border border-slate-100">
                  <Trophy className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700 mb-1">Belum Ada Data</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Leaderboard akan tampil setelah ada siswa yang menyelesaikan kuis.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold w-20 text-center">Rank</th>
                    <th className="px-6 py-4 font-semibold">Siswa</th>
                    <th className="px-6 py-4 font-semibold">Kuis</th>
                    <th className="px-6 py-4 font-semibold text-right">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topPerformers.map((record, index) => (
                    <tr key={record.assignment_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        {index === 0 && <Medal className="w-6 h-6 text-yellow-500 fill-yellow-100 mx-auto" />}
                        {index === 1 && <Medal className="w-6 h-6 text-slate-400 fill-slate-100 mx-auto" />}
                        {index === 2 && <Medal className="w-6 h-6 text-amber-700 fill-amber-100 mx-auto" />}
                        {index > 2   && <span className="font-bold text-slate-400">#{index + 1}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {String(record.assignment_id).slice(-1)}
                          </div>
                          <span className="font-semibold text-slate-700">
                            {displayName(record.assignment_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md line-clamp-1 max-w-45 block"
                          title={record.quiz_title}
                        >
                          {record.quiz_title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center justify-center font-bold text-base px-3 py-1 rounded-lg ${scoreColorBg(record.score_percent)}`}>
                          {record.score_percent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {isLoading ? (
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-slate-200 rounded w-24" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              /* Empty state — not an error */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700 text-sm mb-1">Belum Ada Aktivitas</p>
                <p className="text-xs text-slate-400 max-w-45">
                  Aktivitas akan muncul setelah siswa mengerjakan kuis.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {recentActivities.map((activity, i) => (
                  <div key={activity.assignment_id} className="relative flex gap-4">
                    {i !== recentActivities.length - 1 && (
                      <div className="absolute left-4 top-10 -bottom-5 w-0.5 bg-slate-100" />
                    )}
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-slate-100 z-10 ${
                        activity.score_percent >= 60 ? "bg-green-50" : "bg-red-50"
                      }`}>
                        {activity.score_percent >= 60
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800">
                          {displayName(activity.assignment_id)}
                        </p>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                          {activity.time_str}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Menyelesaikan{" "}
                        <span className="font-semibold text-slate-700">
                          &ldquo;{activity.quiz_title}&rdquo;
                        </span>{" "}
                        dengan nilai{" "}
                        <span className={`font-bold ${scoreColorText(activity.score_percent)}`}>
                          {activity.score_percent.toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}