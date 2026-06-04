"use client"

import { AssignmentHistoryAnswer } from "@/app/lib/use-api"
import { CheckCircle2, XCircle } from "lucide-react"

interface AnswerReviewItemsProps {
    answer: AssignmentHistoryAnswer
    index: number
}

export default function AnswerReviewItem(props: AnswerReviewItemsProps) {
    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border 
                ${props.answer.is_correct
                    ? "bg-green-50 border-green-100"
                    : "bg-red-50 border-red-100"
                }`
            }
        >
            <span
                className={`shrink-0 mt-0.5 
                    ${props.answer.is_correct 
                        ? "text-green-500" 
                        : "text-red-500"
                    }`
                }
            >
                {props.answer.is_correct ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <XCircle className="w-5 h-5" />
                )}
            </span>
        
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm mb-1">
                    {props.index + 1}. {props.answer.question_text}
                </p>
        
                <p className={`text-sm 
                    ${props.answer.is_correct 
                        ? "text-green-700" 
                        : "text-red-700"
                    }`}
                >
                    Your answer:{" "}
                    <span className="font-medium">{props.answer.your_answer || "—"}</span>
                </p>
          
                <p className="text-xs text-slate-400 mt-0.5">
                    Point: {props.answer.score_earned.toFixed(1)}
                </p>
            </div>
        </div>
    )
}