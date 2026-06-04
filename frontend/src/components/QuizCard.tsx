"use client"

import { Quiz } from "@/app/lib/use-api";
import { BookIcon, FileQuestion, Loader2, PlayCircle } from "lucide-react";

interface QuizCardProps {
    quiz: Quiz
    onStart: (quizId: number) => void
    isStarted: boolean
}

export default function QuizCard({ quiz, onStart, isStarted }: QuizCardProps) {
    const questionCount = quiz.question?.length ?? 0
    
    return (
        <div className="bg-white rounded-xl border-slate-200 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all flex flex-col">
            <div className="p-6 flex-1">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit mb-4">
                    <BookIcon className="w-6 h-6" />
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
                <button
                    onClick={() => onStart(quiz.id)}
                    disabled={isStarted}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all"
                >
                    {isStarted ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Starting...</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle className="w-4 h-4" />
                            <span>Start quiz</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}