"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, PlayCircle, Trophy } from "lucide-react";
import { QuizData, MatchingPair } from "@/data/dummyKuis";

interface MatchingStateEntry {
  matchedPairIds: string[];
  leftSelected: string | null;
  rightSelected: string | null;
  flashRed: boolean;
}

interface QuizListViewProps {
  quizzes: QuizData[];
  onStart: (
    quiz: QuizData,
    shuffled: Record<string, { left: MatchingPair[]; right: MatchingPair[] }>,
    initMatching: Record<string, MatchingStateEntry>
  ) => void;
}

export default function QuizListView({ quizzes, onStart }: QuizListViewProps) {
  const handleStart = (quiz: QuizData) => {
    const newShuffled: Record<string, { left: MatchingPair[]; right: MatchingPair[] }> = {};
    const initMatching: Record<string, MatchingStateEntry> = {};

    quiz.questions.forEach((q) => {
      if (q.type === "matching") {
        newShuffled[q.id] = {
          left: [...q.pairs].sort(() => Math.random() - 0.5),
          right: [...q.pairs].sort(() => Math.random() - 0.5),
        };
        initMatching[q.id] = {
          matchedPairIds: [],
          leftSelected: null,
          rightSelected: null,
          flashRed: false,
        };
      }
    });

    onStart(quiz, newShuffled, initMatching);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Kuis</h1>
          <p className="text-slate-600">Pilih kuis yang tersedia untuk menguji kemampuan bahasa Jepang Anda.</p>
        </div>
        <Link
          href="/riwayat"
          className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl font-semibold text-indigo-600 hover:bg-slate-50 transition-all flex items-center"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Lihat Riwayat Nilai
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-all hover:shadow-md hover:border-indigo-100"
          >
            <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{quiz.title}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{quiz.description}</p>
            <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
              <span className="text-sm font-semibold text-slate-400">{quiz.questions.length} Soal</span>
              <button
                onClick={() => handleStart(quiz)}
                className="flex items-center text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Mulai Kerjakan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
