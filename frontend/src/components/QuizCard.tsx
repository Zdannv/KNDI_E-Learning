"use client"

import { Quiz } from "@/app/lib/use-api";
import { BookIcon, CheckCircle2, FileQuestion, Loader2, PlayCircle } from "lucide-react";

interface QuizCardProps {
    quiz: Quiz
    onStart: (quizId: number) => void
    isStarted: boolean
    isCompleted: boolean
}

export default function QuizCard({ quiz, onStart, isStarted, isCompleted }: QuizCardProps) {
    const questionCount = quiz.question?.length ?? 0
    
    return (
        <div className="bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all flex flex-col">
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl w-fit bg-indigo-50 text-indigo-600">
                        <BookIcon />
                    </div>
                    {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 bg-green-200 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
                    {quiz.title}
                </h3>

                {quiz.description && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                        {quiz.description}
                    </p>
                )}

                {questionCount > 0 && (
                    <div className="">
                        <FileQuestion className="w-4 h-4" />
                        <span>{questionCount} questions</span>
                    </div>
                )}
            </div>

            <div className="px-6 pb-6">
                {isCompleted ? (
                    <div className="w-full flex items-center justify-center gap-2 bg-green-200 text-green-700 border border-green-200 font-bold py-3 px-4 rounded-xl text-sm cursor-not-allowed select-none">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                    </div>
                ) : (
                    <button
                        onClick={() => onStart(quiz.id)}
                        disabled={isStarted || isCompleted}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all"
                    >
                        {isStarted ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Starting... 
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4" />
                                Start Quiz
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}