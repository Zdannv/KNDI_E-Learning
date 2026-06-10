"use client"

import { AssignmentResult } from "@/app/lib/use-api"
import { Clock, ClipboardList, RotateCcw, Trophy } from "lucide-react";
import AnswerReviewItem from "./AnswerReviewItem";

interface ResultViewProps {
    result: AssignmentResult
    onReset: () => void
}

function scoreRingColor(pct: number): string {
    if (pct >= 80) return "border-green-400 text-green-600";
    if (pct >= 60) return "border-amber-400 text-amber-600";
    return "border-red-400 text-red-500";
}

function scoreBannerColor(pct: number): string {
    if (pct >= 80) return "bg-green-600";
    if (pct >= 60) return "bg-amber-500";
    return "bg-red-500";
}

function scoreLabel(pct: number): string {
    if (pct >= 60) return "Passed";
    return "Failed — Keep learning!";
}

export default function ResultView({ result, onReset }: ResultViewProps) {
    const pct = result.score_percent

    const hasPendingEssay = result.answers.some(
        (a) => a.question_type === 4 && a.pending_grade === true
    )

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            {/* Score banner */}
            <div className={`rounded-2xl overflow-hidden shadow-sm border border-white/10 mb-6 text-center ${scoreBannerColor(pct)}`}>
                <div className="p-10 text-white">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-white/80" />
                        <h1 className="text-2xl font-bold">Quiz Result</h1>
                    </div>
                    <p className="text-white/70 text-sm mb-6">{result.quiz_title}</p>

                    <div className={`inline-flex flex-col items-center justify-center bg-white rounded-full h-36 w-36 border-8 ${scoreRingColor(pct)}`}>
                        <span className="text-4xl font-black">{pct.toFixed(0)}</span>
                        <span className="text-xs font-semibold text-slate-400 mt-0.5">dari 100</span>
                    </div>

                    <p className="mt-4 text-white font-bold text-lg">{scoreLabel(pct)}</p>
                    <p className="text-white/60 text-xs mt-1">
                        {result.score_earned.toFixed(2)} / {result.total_point.toFixed(1)} poin
                    </p>
                </div>
            </div>

            {/* Pending essay notice — only shown when at least one essay is ungraded */}
            {hasPendingEssay && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl mb-6">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                        <p className="text-sm font-bold">Ada soal esai yang belum dinilai</p>
                        <p className="text-sm mt-0.5">
                            Nilai Anda akan diperbarui secara otomatis setelah Sensei menyelesaikan penilaian.
                        </p>
                    </div>
                </div>
            )}

            {/* Answer review */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                    Question Evaluation
                </h2>
                <div className="space-y-3">
                    {result.answers.map((ans, i) => (
                        <AnswerReviewItem key={i} answer={ans} index={i} />
                    ))}
                </div>
            </div>

            <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3 px-6 rounded-xl font-bold transition-all"
            >
                <RotateCcw className="w-5 h-5" />
                Back to quiz page
            </button>
        </div>
    )
}