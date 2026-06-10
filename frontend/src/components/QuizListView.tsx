"use client";

import Link from "next/link";
import { AlertCircle, BookOpen, Trophy } from "lucide-react";
import { Quiz } from "@/app/lib/use-api";
import QuizCard from "./QuizCard";

interface QuizListViewProps {
    quizzes: Quiz[];
    onStart: (quizId: number) => void;
    isStarting: boolean;
    startError: string | null;
    isCompetedQuizId: Set<number>;
}

export default function QuizListView(props: QuizListViewProps) {
    const totalQuestions = props.quizzes.reduce(
        (sum, q) => sum + (q.question?.length ?? 0),
        0
    );

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Kuis</h1>
                    <p className="text-slate-600">Pilih kuis yang tersedia untuk menguji kemampuan bahasa Jepang Anda.</p>
                </div>
                
                <Link
                    href="/history"
                    className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-semibold text-indigo-600 hover:bg-slate-50 transition-all flex items-center"
                >
                    <Trophy className="w-5 h-5 mr-2" />
                    Lihat Riwayat Nilai
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
                {props.startError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{props.startError}</p>
                    </div>
                )}

                {props.quizzes.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
                        <div className="bg-slate-50 p-5 rounded-full mb-4 border border-slate-100">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Kuis</h3>
                        
                        <p className="text-slate-500 max-w-sm text-sm">
                            Sensei belum memposting kuis apapun. Silakan cek kembali nanti.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {props.quizzes.map((quiz, index) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onStart={props.onStart}
                                isStarted={props.isStarting}
                                isCompleted={props.isCompetedQuizId.has(quiz.id)}
                                accentIndex={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}