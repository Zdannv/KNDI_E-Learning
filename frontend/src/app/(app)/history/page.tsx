"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AlertCircle, BookOpen, CalendarClock, CheckCircle2, ClipboardList, RefreshCw, Trophy, XCircle } from "lucide-react";

import { assignmentApi, HistoryListItem } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";

function scoreColorClass(pct: number): string {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBadgeClass(pct: number): string {
  if (pct >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (pct >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

function scoreLabel(pct: number): string {
  if (pct >= 80) return "Lulus";
  if (pct >= 60) return "Cukup";
  return "Remedial";
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse flex items-center gap-4"
        >
          <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
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

export default function HisotryPage() {
  const fetchHistory = useCallback(() => assignmentApi.getHistory(), []);
  const { data: history, isLoading, error, refetch } = useAsync<HistoryListItem[]>(fetchHistory);

  const totalKuis    = history?.length ?? 0;
  const lulusCount   = history?.filter((h) => h.score_percent >= 60).length ?? 0;
  const avgPct       = totalKuis > 0
    ? (history!.reduce((acc, h) => acc + h.score_percent, 0) / totalKuis).toFixed(1)
    : "0";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Riwayat Nilai</h1>
          <p className="text-slate-600">
            Pantau rekapitulasi nilai dan progres kuis bahasa Jepang Anda.
          </p>
        </div>
      </div>

      {!isLoading && !error && totalKuis > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Kuis Dikerjakan"
            value={totalKuis}
            icon={BookOpen}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Kuis Lulus"
            value={lulusCount}
            icon={CheckCircle2}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            label="Rata-rata Nilai"
            value={`${avgPct}%`}
            icon={Trophy}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-sm font-semibold shrink-0 hover:text-red-800"
          >
            <RefreshCw className="w-4 h-4" /> Coba lagi
          </button>
        </div>
      )}

      {isLoading && <HistorySkeleton />}

      {!isLoading && !error && totalKuis === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-5 border border-slate-100">
            <Trophy className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
          <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
            Anda belum pernah menyelesaikan kuis apa pun. Segera kerjakan kuis untuk
            melihat nilai Anda di sini!
          </p>
          <Link
            href="/kuis"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
          >
            <span>Pergi ke Daftar Kuis</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* History list */}
      {!isLoading && !error && history && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Kuis</div>
            <div className="col-span-3 text-center">Waktu Selesai</div>
            <div className="col-span-2 text-center">Nilai</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {history.map((item, index) => (
              <div
                key={item.assignment_id}
                className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors gap-3 md:gap-0"
              >
                {/* Quiz title */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      item.score_percent >= 60
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 line-clamp-1">
                      {item.quiz_title}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      ID #{item.assignment_id}
                    </p>
                  </div>
                </div>

                {/* Completion time */}
                <div className="md:col-span-3 flex items-center gap-2 md:justify-center text-slate-500">
                  <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">{item.date_str}</span>
                    {item.time_str && (
                      <span className="text-slate-400 ml-1">· {item.time_str}</span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="md:col-span-2 flex md:justify-center">
                  <div className="text-center">
                    <span className={`text-2xl font-black ${scoreColorClass(item.score_percent)}`}>
                      {item.score_percent.toFixed(0)}
                      <span className="text-base font-semibold text-slate-400">%</span>
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.score_earned.toFixed(1)} / {item.total_point.toFixed(1)} poin
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="md:col-span-2 flex md:justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeClass(item.score_percent)}`}
                  >
                    {item.score_percent >= 60 ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {scoreLabel(item.score_percent)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total <span className="font-bold text-slate-700">{totalKuis}</span> kuis selesai
            </p>
            <p className="text-sm text-slate-500">
              Lulus: <span className="font-bold text-green-600">{lulusCount}</span> ·
              Remedial: <span className="font-bold text-red-500">{totalKuis - lulusCount}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}