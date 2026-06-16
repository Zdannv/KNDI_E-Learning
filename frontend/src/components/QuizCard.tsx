"use client";

import { Quiz } from "@/app/lib/use-api";
import { BookOpen, CheckCircle2, Clock, Loader2, Play, RefreshCw } from "lucide-react";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: number) => void;
  isStarted: boolean;
  isCompleted: boolean;
  isPassed: boolean;
  accentIndex: number;
}

const ACCENTS = [
  { stripe: "bg-violet-500", badge: "bg-violet-50", icon: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", ring: "ring-violet-100" },
  { stripe: "bg-rose-500",   badge: "bg-rose-50",   icon: "text-rose-600",   btn: "bg-rose-600   hover:bg-rose-700",   ring: "ring-rose-100"   },
  { stripe: "bg-amber-500",  badge: "bg-amber-50",  icon: "text-amber-600",  btn: "bg-amber-600  hover:bg-amber-700",  ring: "ring-amber-100"  },
  { stripe: "bg-teal-500",   badge: "bg-teal-50",   icon: "text-teal-600",   btn: "bg-teal-600   hover:bg-teal-700",   ring: "ring-teal-100"   },
  { stripe: "bg-sky-500",    badge: "bg-sky-50",    icon: "text-sky-600",    btn: "bg-sky-600    hover:bg-sky-700",    ring: "ring-sky-100"    },
  { stripe: "bg-emerald-500",badge: "bg-emerald-50",icon: "text-emerald-600",btn: "bg-emerald-600 hover:bg-emerald-700",ring: "ring-emerald-100"},
] as const;

export default function QuizCard({ quiz, onStart, isStarted, isCompleted, isPassed, accentIndex }: QuizCardProps) {
  const accent = ACCENTS[accentIndex % ACCENTS.length];
  const questionCount = quiz.question?.length ?? 0;
  const isDone = isCompleted;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-1.5 w-full ${accent.stripe}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent.badge}`}>
            <BookOpen className={`w-5 h-5 ${accent.icon}`} />
          </div>

          {/* Status badge */}
          {isDone && isPassed && (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lulus
            </span>
          )}
          {isDone && !isPassed && (
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-100">
              <RefreshCw className="w-3.5 h-3.5" />
              Remedial
            </span>
          )}
        </div>

        <span className="text-xs font-bold tracking-widest text-slate-300 uppercase mb-1.5">
          Kuis {String(accentIndex + 1).padStart(2, "0")}
        </span>

        <h3 className="text-base font-bold text-slate-800 leading-snug mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {quiz.description ? (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-5">{quiz.description}</p>
        ) : (
          <p className="text-sm text-slate-300 italic flex-1 mb-5">Tidak ada deskripsi.</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {questionCount > 0 ? `${questionCount} soal` : "—"}
          </div>

          {/* Action button */}
          {isDone && isPassed ? (
            <div className="flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-600 border border-green-100 px-4 py-2 rounded-lg cursor-not-allowed select-none">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Selesai
            </div>
          ) : isDone && !isPassed ? (
            <button
              onClick={() => onStart(quiz.id)}
              disabled={isStarted}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
            >
              {isStarted ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memulai...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5" /> Coba Ulang</>
              )}
            </button>
          ) : (
            <button
              onClick={() => onStart(quiz.id)}
              disabled={isStarted}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg ${accent.btn} text-white disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all duration-150`}
            >
              {isStarted ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memulai...</>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /> Mulai</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}