"use client"

import { AssignmentHistoryAnswer } from "@/app/lib/use-api"
import { CheckCircle2, Shuffle, XCircle } from "lucide-react"

interface AnswerReviewItemProps {
    answer: AssignmentHistoryAnswer
    index: number
}

// ─── Sub-component: Matching Card Result ──────────────────────────────────────
//
// For matching card questions, instead of showing a text answer (which doesn't
// make sense for card pairs), we show a visual "X / Y pairs correct" indicator.

interface MatchingCardResultProps {
    scoreEarned: number
    totalPairs:  number
    isCorrect:   boolean
}

function MatchingCardResult({ scoreEarned, totalPairs, isCorrect }: MatchingCardResultProps) {
    // scoreEarned is a proportional value: correctPairs / totalPairs × q.Point
    // e.g. 3 correct out of 5 pairs → scoreEarned = 0.6
    // To recover the integer pair count: round(scoreEarned × totalPairs)
    // Math.round handles floating-point imprecision (e.g. 0.5999... × 5 = 2.999... → 3)
    const correct = Math.round(scoreEarned * totalPairs)
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
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                   bg-green-100 text-green-700 text-xs font-medium"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        Pair {i + 1}
                    </span>
                ))}
                {Array.from({ length: wrong }).map((_, i) => (
                    <span
                        key={`wrong-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                   bg-red-100 text-red-700 text-xs font-medium"
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
    const isMatchingCard = answer.question_type === 3

    const cardColor = (() => {
        if (isMatchingCard) {
            if (answer.is_correct) return "bg-green-50 border-green-100"
            if (answer.score_earned > 0) return "bg-amber-50 border-amber-100"
            return "bg-red-50 border-red-100"
        }
        return answer.is_correct
            ? "bg-green-50 border-green-100"
            : "bg-red-50 border-red-100"
    })()

    const iconColor = (() => {
        if (isMatchingCard) {
            if (answer.is_correct) return "text-green-500"
            if (answer.score_earned > 0) return "text-amber-500"
            return "text-red-500"
        }
        return answer.is_correct ? "text-green-500" : "text-red-500"
    })()

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${cardColor}`}>
            {/* Status icon */}
            <span className={`shrink-0 mt-0.5 ${iconColor}`}>
                {isMatchingCard ? (
                    <Shuffle className="w-5 h-5" />
                ) : answer.is_correct ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <XCircle className="w-5 h-5" />
                )}
            </span>

            <div className="flex-1 min-w-0">
                {isMatchingCard ? (
                    <MatchingCardResult
                        scoreEarned={answer.score_earned}
                        totalPairs={answer.total_pairs ?? 0}
                        isCorrect={answer.is_correct}
                    />
                ) : (
                    <p className={`text-sm ${answer.is_correct ? "text-green-700" : "text-red-700"}`}>
                        Jawaban kamu:{" "}
                        <span className="font-medium">{answer.your_answer || "—"}</span>
                    </p>
                )}
            </div>
        </div>
    )
}