"use client";

import React from "react";
import { CheckCircle2, XCircle, LayoutList, ClipboardList, AlertCircle, Clock, Scale } from "lucide-react";
import { QuizData } from "@/data/dummyKuis";

interface QuizResultViewProps {
  quiz: QuizData;
  score: number;
  answers: Record<string, string>;
  onReset: () => void;
}

export default function QuizResultView({ quiz, score, answers, onReset }: QuizResultViewProps) {
  // Check if quiz contains any essay questions
  const hasEssayQuestions = quiz.questions.some(q => q.type === "essay");
  
  // Calculate total weight and essay weight
  const totalWeight = quiz.questions.reduce((sum, q) => sum + q.weight, 0);
  const essayWeight = quiz.questions
    .filter(q => q.type === "essay")
    .reduce((sum, q) => sum + q.weight, 0);
  const essayWeightPercentage = totalWeight > 0 ? Math.round((essayWeight / totalWeight) * 100) : 0;
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center mb-8">
        <div className="bg-indigo-600 p-12 text-white">
          <h1 className="text-3xl font-bold mb-4">Hasil Kuis</h1>
          <p className="text-indigo-100 mb-6">Anda telah menyelesaikan: {quiz.title}</p>
          
          {hasEssayQuestions && (
            <div className="mb-6 bg-amber-500/20 border border-amber-300/30 rounded-lg p-4">
              <div className="flex items-center justify-center text-amber-100">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-semibold">Status: Menunggu Penilaian Manual</span>
              </div>
            </div>
          )}
          
          <div className="inline-flex flex-col items-center justify-center bg-white text-indigo-700 rounded-full h-40 w-40 border-8 border-indigo-400/30">
            <span className="text-5xl font-black">{score}</span>
            <span className="text-sm font-semibold text-slate-400 mt-1">dari 100</span>
          </div>
          
          {hasEssayQuestions && (
            <p className="text-indigo-100 text-sm mt-4 font-medium">
              {score > 0 ? "Skor Sementara (Soal Otomatis)" : "Menunggu Penilaian"}
            </p>
          )}
        </div>

        {hasEssayQuestions && (
          <div className="bg-amber-50 border-b border-amber-200 p-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Catatan Penting:</p>
                <p>Skor di atas hanya mencakup soal yang dinilai otomatis. Nilai akhir akan diperbarui setelah Sensei menilai jawaban esai Anda.</p>
              </div>
            </div>
          </div>
        )}

        {/* Weight Breakdown Section */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <Scale className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-bold text-slate-800">Sistem Bobot Penilaian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Bobot Kuis</p>
              <p className="text-2xl font-bold text-slate-800">{totalWeight}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skor Sementara (Soal Otomatis)</p>
              <p className="text-2xl font-bold text-indigo-600">{score} / 100</p>
            </div>
            {hasEssayQuestions && (
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Bobot Menunggu Penilaian Sensei</p>
                <p className="text-2xl font-bold text-amber-600">{essayWeightPercentage}%</p>
                <p className="text-xs text-slate-500 mt-1">dari Total Nilai</p>
              </div>
            )}
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
              let isEssay = false;
              
              // Calculate this question's contribution to total score
              const questionMaxScore = Math.round((q.weight / totalWeight) * 100);

              if (q.type === "essay") {
                isEssay = true;
                displayedUserAnswer = userAnswer || "(Tidak dijawab)";
                displayedCorrectAnswer = "Menunggu penilaian manual";
              } else if (q.type === "multiple_choice") {
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
                <div key={q.id} className={`p-5 rounded-xl border ${
                  isEssay 
                    ? "bg-amber-50 border-amber-200" 
                    : isCorrect 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500 font-semibold">{index + 1}.</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          q.weight === 1 ? 'bg-blue-100 text-blue-700' :
                          q.weight === 2 ? 'bg-purple-100 text-purple-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          Bobot: {q.weight} ({questionMaxScore} poin)
                        </span>
                      </div>
                      <div className="font-semibold text-slate-700">
                        {q.questionText}
                      </div>
                    </div>
                    {isEssay ? (
                      <Clock className="w-6 h-6 text-amber-500 shrink-0" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    )}
                  </div>

                  {isEssay ? (
                    <div className="space-y-3 mt-4">
                      <div className="p-3 bg-white rounded-lg border border-amber-100">
                        <span className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Jawaban Anda</span>
                        <div className="font-medium text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {displayedUserAnswer}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-amber-700 font-medium">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>Menunggu Grading dari Sensei (Kontribusi: {questionMaxScore} poin)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jawaban Anda</span>
                        <span className={`font-medium ${isCorrect ? "text-green-700" : "text-red-600 line-through decoration-red-400"}`}>
                          {displayedUserAnswer}
                        </span>
                        {isCorrect && (
                          <div className="mt-2 text-xs text-green-600 font-semibold">
                            +{questionMaxScore} poin
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jawaban Benar</span>
                        <span className="font-medium text-green-700">{displayedCorrectAnswer}</span>
                      </div>
                    </div>
                  )}
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
