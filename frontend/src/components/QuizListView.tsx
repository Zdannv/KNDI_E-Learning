"use client"

import { Quiz } from "@/app/lib/use-api";
import { AlertCircle, BookOpen, ClipboardList } from "lucide-react";
import QuizCard from "./QuizCard";

interface QuizListViewProps {
    quizzes: Quiz[]
    onStart: (quizId: number) => void
    isStarting: boolean
    startError: string | null
}

export default function QuizListView({ quizzes, onStart, isStarting, startError }: QuizListViewProps) {
    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Quizzes List</h1>
                <p className="text-slate-600">
                    Select the quiz you want to take. Make sure you're ready before you begin.
                </p>
            </div>

            {startError && (
                <div className="flex items-center gap-3 bd-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{startError}</p>
                </div>
            )}

            {quizzes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <div className="bg-slate-50 p-5 rounded-full mb-4 border border-slate-100">
                        <ClipboardList className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz Empty</h3>
                    <p className="text-slate-500 max-w-sm text-sm">
                        Sensei hasn't posted any quizzes yet. Check back later.
                    </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onStart={onStart}
                      isStarted={isStarting}
                    />
                  ))}
                </div>
              )}
        </div>
    )
}