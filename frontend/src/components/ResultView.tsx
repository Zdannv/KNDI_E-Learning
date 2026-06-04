"use client"

import { AssignmentResult } from "@/app/lib/use-api"
import { ClipboardList, RotateCcw, Trophy } from "lucide-react";
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
    if (pct >= 80) return "border-green-500";
    if (pct >= 60) return "border-amber-600";
    return "border-red-500";
}

function scoreLabel(pct: number): string {
    if (pct >= 60) return "Passed";
    return "Failed — Keep learning!";
}

export default function ResultViewProps(props: ResultViewProps) {
    const pct = props.result.score_percent

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            <div
                className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6 text-center ${scoreBannerColor(pct)}`}
            >
                <div className="p-10 text-white">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-white/80" />
                        <h1 className="text-2xl font-bold">Quiz Result</h1>
                    </div>
                    <p className="text-white/70 text-sm mb-6">{props.result.quiz_title}</p>
 
                    <div
                        className={`inline-flex flex-col items-center justify-center bg-white rounded-full h-36 w-36 border-8 ${scoreRingColor(pct)}`}
                    >
                        <span className="text-4xl font-black">{pct.toFixed(0)}</span>
                        <span className="text-xs font-semibold text-slate-400 mt-0.5">
                            dari 100
                        </span>
                    </div>
 
                    <p className="mt-4 text-white font-bold text-lg">{scoreLabel(pct)}</p>
 
                    <p className="text-white/60 text-xs mt-1">
                        {props.result.score_earned.toFixed(1)} / {props.result.total_point.toFixed(1)} poin
                    </p>
                </div>
            </div>
 
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                        Question Evaluation
                </h2>
 
                <div className="space-y-3">
                    {props.result.answers.map((ans, i) => (
                        <AnswerReviewItem key={i} answer={ans} index={i} />
                    ))}
                </div>
            </div>
 
            <button
                onClick={props.onReset}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3 px-6 rounded-xl font-bold transition-all"
            >
                <RotateCcw className="w-5 h-5" />
                    Back to quiz page
            </button>
        </div>

    )
}