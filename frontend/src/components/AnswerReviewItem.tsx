"use client"

import { AssignmentHistoryAnswer } from "@/app/lib/use-api"
import { CheckCircle2, Clock, FileText, Shuffle, XCircle } from "lucide-react"

interface AnswerReviewItemProps {
    answer: AssignmentHistoryAnswer
    index:  number
}

interface MatchingCardResultProps {
    correctPairs: number
    totalPairs:  number
    isCorrect:   boolean
}

function MatchingCardResult({ correctPairs, totalPairs, isCorrect }: MatchingCardResultProps) {
    const correct = correctPairs
    const wrong   = totalPairs - correct

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            isCorrect ? "bg-green-400" : correct > 0 ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: totalPairs > 0 ? `${(correct / totalPairs) * 100}%` : "0%" }}
                    />
                </div>
                <span className={`text-sm font-bold tabular-nums ${
                    isCorrect ? "text-green-700" : correct > 0 ? "text-amber-700" : "text-red-700"
                }`}>
                    {correct} / {totalPairs}
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: correct }).map((_, i) => (
                    <span
                        key={`correct-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        Pair {i + 1}
                    </span>
                ))}
                {Array.from({ length: wrong }).map((_, i) => (
                    <span
                        key={`wrong-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium"
                    >
                        <XCircle className="w-3 h-3" />
                        Pair {correct + i + 1}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function AnswerReviewItem({ answer, index }: AnswerReviewItemProps) {
    const isEssay       = answer.question_type === 4
    const isMatchingCard = answer.question_type === 3
    const isPending     = isEssay && answer.pending_grade === true

    // ── Card color ────────────────────────────────────────────────────────────
    const cardColor = (() => {
        if (isEssay) {
            return isPending
                ? "bg-amber-50 border-amber-200"   // waiting for sensei
                : "bg-blue-50 border-blue-200"     // graded
        }
        if (isMatchingCard) {
            if (answer.is_correct)      return "bg-green-50 border-green-100"
            if (answer.score_earned > 0) return "bg-amber-50 border-amber-100"
            return "bg-red-50 border-red-100"
        }
        return answer.is_correct
            ? "bg-green-50 border-green-100"
            : "bg-red-50 border-red-100"
    })()

    // ── Icon ──────────────────────────────────────────────────────────────────
    const icon = (() => {
        if (isEssay) {
            return isPending
                ? <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                : <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        }
        if (isMatchingCard) {
            return <Shuffle className={`w-5 h-5 shrink-0 mt-0.5 ${
                answer.is_correct ? "text-green-500" : answer.score_earned > 0 ? "text-amber-500" : "text-red-500"
            }`} />
        }
        return answer.is_correct
            ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            : <XCircle      className="w-5 h-5 text-red-500   shrink-0 mt-0.5" />
    })()

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${cardColor}`}>
            {icon}

            <div className="flex-1 min-w-0 space-y-1">
                {/* Question text */}
                <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">
                    {answer.question_text}
                </p>

                {/* Question Media */}
                {answer.question_image_url && (
                    <div className="mt-2 max-w-xs rounded-lg overflow-hidden border border-slate-100">
                        <img src={answer.question_image_url} alt="Soal Gambar" className="w-full h-auto object-cover" />
                    </div>
                )}
                {answer.question_audio_url && (
                    <div className="mt-2">
                        <audio src={answer.question_audio_url} controls className="w-full max-w-xs h-10" />
                    </div>
                )}

                {/* Answer body per type */}
                {isEssay ? (
                    isPending ? (
                        // ── Pending essay ─────────────────────────────────────
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 italic whitespace-pre-wrap">
                                {answer.your_answer || "—"}
                            </p>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Menunggu penilaian Sensei
                            </span>
                        </div>
                    ) : (
                        // ── Graded essay ──────────────────────────────────────
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 italic whitespace-pre-wrap">
                                {answer.your_answer || "—"}
                            </p>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Nilai: {answer.score_earned.toFixed(2)} poin
                            </span>
                        </div>
                    )
                ) : isMatchingCard ? (
                    <MatchingCardResult
                        correctPairs={answer.correct_pairs ?? 0}
                        totalPairs={answer.total_pairs ?? 0}
                        isCorrect={answer.is_correct}
                    />
                ) : (
                    <div className="space-y-2">
                        <div className={`text-sm ${answer.is_correct ? "text-green-700" : "text-red-700"}`}>
                            <span>Jawaban kamu: </span>
                            <span className="font-bold">{answer.your_answer || "—"}</span>
                            {answer.your_answer_image_url && (
                                <div className="mt-1.5 max-w-xs rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={answer.your_answer_image_url} alt="Jawaban Gambar" className="w-full h-auto object-cover rounded" />
                                </div>
                            )}
                            {answer.your_answer_audio_url && (
                                <div className="mt-1.5">
                                    <audio src={answer.your_answer_audio_url} controls className="w-full max-w-xs h-10" />
                                </div>
                            )}
                        </div>
                        {!answer.is_correct && answer.correct_answer && (
                            <div className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200/60 rounded-lg px-2.5 py-1.5 inline-block space-y-1.5">
                                <div>Jawaban yang benar: <span className="font-bold">{answer.correct_answer}</span></div>
                                {answer.correct_answer_image_url && (
                                    <div className="max-w-xs rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={answer.correct_answer_image_url} alt="Kunci Jawaban Gambar" className="w-full h-auto object-cover rounded" />
                                    </div>
                                )}
                                {answer.correct_answer_audio_url && (
                                    <div>
                                        <audio src={answer.correct_answer_audio_url} controls className="w-full max-w-xs h-10" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}