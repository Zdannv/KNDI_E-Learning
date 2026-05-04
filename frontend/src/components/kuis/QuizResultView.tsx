"use client";

import React from "react";
import { CheckCircle2, XCircle, LayoutList, ClipboardList } from "lucide-react";
import { QuizData } from "@/data/dummyKuis";

interface QuizResultViewProps {
  quiz: QuizData;
  score: number;
  answers: Record<string, string>;
  onReset: () => void;
}

export default function QuizResultView({ quiz, score, answers, onReset }: QuizResultViewProps) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center mb-8">
        <div className="bg-indigo-600 p-12 text-white">
          <h1 className="text-3xl font-bold mb-4">Hasil Kuis</h1>
          <p className="text-indigo-100 mb-6">Anda telah menyelesaikan: {quiz.title}</p>
          <div className="inline-flex flex-col items-center justify-center bg-white text-indigo-700 rounded-full h-40 w-40 border-8 border-indigo-400/30">
            <span className="text-5xl font-black">{score}</span>
            <span className="text-sm font-semibold text-slate-400 mt-1">dari 100</span>
          </div>
        </div>

        <div className="p-8 bg-slate-50 text-left border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
            Evaluasi Jawaban
          </h2>

          <div className="space-y-6">
            {quiz.questions.map((q, index) => {
              const userAnswer = answers[q.id] || "";
              let isCorrect = false;
              let displayedCorrectAnswer = "";
              let displayedUserAnswer = userAnswer;

              if (q.type === "multiple_choice") {
                const selIdx = parseInt(userAnswer, 10);
                isCorrect = selIdx === q.correctOptionIndex;
                displayedCorrectAnswer = q.options[q.correctOptionIndex].text;
                displayedUserAnswer = !isNaN(selIdx) ? q.options[selIdx].text : "(Kosong)";
              } else if (q.type === "short_answer") {
                isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswerText.trim().toLowerCase();
                displayedCorrectAnswer = q.correctAnswerText;
                displayedUserAnswer = userAnswer || "(Kosong)";
              } else if (q.type === "matching") {
                isCorrect = userAnswer === "MATCHED_ALL";
                displayedCorrectAnswer = "Semua pasangan tercocokkan dengan sempurna (100%)";
                displayedUserAnswer = isCorrect ? "Semua pasangan cocok ✓" : "Tidak Diselesaikan";
              }

              return (
                <div key={q.id} className={`p-5 rounded-xl border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-semibold text-slate-700 mr-4">
                      <span className="text-slate-500 mr-2">{index + 1}.</span>
                      {q.questionText}
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jawaban Anda</span>
                      <span className={`font-medium ${isCorrect ? "text-green-700" : "text-red-600 line-through decoration-red-400"}`}>
                        {displayedUserAnswer}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jawaban Benar</span>
                      <span className="font-medium text-green-700">{displayedCorrectAnswer}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-white flex justify-center">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
          >
            <LayoutList className="w-4 h-4" />
            <span>Kembali ke Daftar Kuis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
