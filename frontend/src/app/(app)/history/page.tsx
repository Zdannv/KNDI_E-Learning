"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { AlertCircle, BookOpen, CalendarClock, CheckCircle2, ClipboardList, RefreshCw, Trophy, Users, XCircle } from "lucide-react";

import { assignmentApi, HistoryListItem } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/context/AuthContext";

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

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const isSensei = user?.role === 'sensei'
  const fetchHistory = useCallback((): Promise<HistoryListItem[]> => {
    if (authLoading || !user) {
      return Promise.resolve([])
    }
    return isSensei ? assignmentApi.getAllHistory() : assignmentApi.getHistory()
  }, [isSensei, authLoading, user])
  
  const {
    data: history, isLoading: dataLoading, error
  } = useAsync<HistoryListItem[]>(fetchHistory)
  const isLoading = authLoading || dataLoading

  const stats = useMemo(() => {
    const list = history ?? []
    const total = list.length
    const passedCount = list.filter((h) => h.score_percent > 60).length
    const averagePct = total > 0 
              ? (list.reduce((acc, h) => acc + h.score_percent, 0) / total).toFixed(1)
              : "0"
    const uniqueStats = isSensei
              ? new Set(list.map((h) => h.student_name ?? h.assignment_id)).size
              : 0
    
    return { total, passedCount, averagePct, uniqueStats }
  }, [history, isSensei])

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>
      
      {isLoading && <HistorySkeleton />}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to load history</p>
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
          <h3 className="font-bold text-slate-700 text-lg mb-2">
            {isSensei ? "Belum ada siswa yang mengerjakan kuis" : "Belum ada riwayat nilai"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {isSensei
              ? "Siswa yang telah menyelesaikan kuis akan muncul di sini."
              : "Segera kerjakan kuis untuk melihat nilai Anda di sini!"}
          </p>
          {!isSensei && (
            <Link
              href="/kuis"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
            >
              <span>Back to courses page</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>
      )}
 
      {!isLoading && !error && history && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div
            className={`hidden md:grid px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider ${
              isSensei ? "grid-cols-12" : "grid-cols-12"
            }`}
          >
            <div className={isSensei ? "col-span-3" : "col-span-5"}>Quizzes</div>
            {isSensei && (
              <div className="col-span-2">Student Name</div>
            )}
            <div className={`${isSensei ? "col-span-3" : "col-span-3"} text-center`}>
              End Time
            </div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
  
          <div className="divide-y divide-slate-50">
            {history.map((item, index) => (
              <HistoryRow
                key={item.assignment_id}
                item={item}
                index={index}
                isSensei={isSensei}
              />
            ))}
          </div>
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
