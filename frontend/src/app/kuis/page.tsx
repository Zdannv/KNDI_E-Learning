"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, LayoutList, ClipboardList, PlayCircle, Trophy } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- TypeScript Definitions ---
type QuestionType = "multiple_choice" | "short_answer";

interface QuestionBase {
  id: string;
  type: QuestionType;
  questionText: string;
}

interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: [string, string, string, string];
  correctOptionIndex: number;
}

interface ShortAnswerQuestion extends QuestionBase {
  type: "short_answer";
  correctAnswerText: string;
}

type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateStr: string;
  timeStr: string;
}

// --- Mock Data Fallback ---
const fallbackMockQuiz: QuizData = {
  id: "quiz-1",
  title: "Kuis Dasar 1: Kosakata Sehari-hari",
  description: "Uji pemahaman Anda tentang kosakata bahasa Jepang dasar sebelum melanjutkan ke bab berikutnya.",
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      questionText: "Apa arti dari kata 'Arigatou' (ありがとう) dalam bahasa Indonesia?",
      options: ["Maaf", "Terima Kasih", "Selamat Pagi", "Permisi"],
      correctOptionIndex: 1, // Terima Kasih
    },
    {
      id: "q2",
      type: "short_answer",
      questionText: "Sebutkan terjemahan bahasa Indonesia untuk kata kerja 'Taberu' (食べる).",
      correctAnswerText: "Makan", 
    },
    {
      id: "q3",
      type: "multiple_choice",
      questionText: "Ungkapan manakah yang paling tepat untuk mengucapkan 'Selamat Pagi' dalam bahasa Jepang secara formal?",
      options: ["Konbanwa", "Konnichiwa", "Ohayou Gozaimasu", "Oyasuminasai"],
      correctOptionIndex: 2, // Ohayou Gozaimasu
    }
  ]
};

export default function UserKuisPage() {
  const [storedQuizzes, , isClient] = useLocalStorage<QuizData[]>("kndi_quizzes", [fallbackMockQuiz]);
  const [storedHistory, setStoredHistory] = useLocalStorage<QuizHistoryRecord[]>("kndi_history", []);

  // --- States ---
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // --- Hydration Guard ---
  if (!isClient) return <div className="p-6 h-screen w-full" />; 

  // --- Main List View Render ---
  if (!selectedQuiz) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
         <div className="mb-8 flex items-center justify-between">
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
            {storedQuizzes.map((quiz) => (
               <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-all hover:shadow-md hover:border-indigo-100">
                  <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                     <ClipboardList className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{quiz.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{quiz.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                     <span className="text-sm font-semibold text-slate-400">{quiz.questions.length} Soal</span>
                     <button
                        onClick={() => setSelectedQuiz(quiz)}
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

  // ====== EXECUTION LOGIC ======
  const totalQuestions = selectedQuiz.questions.length;
  const currentQuestion = selectedQuiz.questions[currentIndex];

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const isQuestionAnswered = () => {
    const ans = answers[currentQuestion.id];
    return ans !== undefined && ans.trim() !== "";
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1 && isQuestionAnswered()) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!isQuestionAnswered()) return;

    let correctCount = 0;
    selectedQuiz.questions.forEach((q) => {
      const userAnswer = answers[q.id] || "";
      if (q.type === "multiple_choice") {
        const selectedIndex = parseInt(userAnswer, 10);
        if (!isNaN(selectedIndex) && selectedIndex === q.correctOptionIndex) {
          correctCount++;
        }
      } else if (q.type === "short_answer") {
        if (userAnswer.trim().toLowerCase() === q.correctAnswerText.trim().toLowerCase()) {
          correctCount++;
        }
      }
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Save History to LocalStorage
    const now = new Date();
    const historyItem: QuizHistoryRecord = {
      id: "h" + Date.now().toString(),
      quizId: selectedQuiz.id,
      quizTitle: selectedQuiz.title,
      score: calculatedScore,
      dateStr: now.toISOString().split('T')[0],
      timeStr: now.toTimeString().split(' ')[0]
    };
    
    setStoredHistory(prev => [historyItem, ...prev]);
  };

  const resetState = () => {
    setSelectedQuiz(null);
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);
  };


  // ====== RESULT VIEW ======
  if (isSubmitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center mb-8">
          <div className="bg-indigo-600 p-12 text-white">
            <h1 className="text-3xl font-bold mb-4">Hasil Kuis</h1>
            <p className="text-indigo-100 mb-6">Anda telah menyelesaikan: {selectedQuiz.title}</p>
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
              {selectedQuiz.questions.map((q, index) => {
                const userAnswer = answers[q.id] || "";
                let isCorrect = false;
                let displayedCorrectAnswer = "";
                let displayedUserAnswer = userAnswer;

                if (q.type === "multiple_choice") {
                  const selIdx = parseInt(userAnswer, 10);
                  isCorrect = selIdx === q.correctOptionIndex;
                  displayedCorrectAnswer = q.options[q.correctOptionIndex];
                  displayedUserAnswer = !isNaN(selIdx) ? q.options[selIdx] : "(Kosong)";
                } else {
                  isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswerText.trim().toLowerCase();
                  displayedCorrectAnswer = q.correctAnswerText;
                  displayedUserAnswer = userAnswer || "(Kosong)";
                }

                return (
                  <div key={q.id} className={`p-5 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
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
                        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-600 line-through decoration-red-400'}`}>
                          {displayedUserAnswer}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Jawaban Benar</span>
                        <span className="font-medium text-green-700">
                          {displayedCorrectAnswer}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-white flex justify-center">
            <button 
              onClick={resetState}
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

  // ====== EXECUTION VIEW ======
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="p-6 max-w-3xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{selectedQuiz.title}</h1>
        <p className="text-slate-500 text-sm">{selectedQuiz.description}</p>
        
        <div className="mt-8 flex items-center justify-between text-sm font-semibold text-slate-500 mb-2">
          <span>Soal {currentIndex + 1} dari {totalQuestions}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[300px] flex flex-col transition-all">
        <h2 className="text-xl font-medium text-slate-800 leading-relaxed mb-8">
          <span className="font-bold text-indigo-600 mr-2">Q.</span>
          {currentQuestion.questionText}
        </h2>

        <div className="flex-1">
          {currentQuestion.type === "multiple_choice" ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === String(optIdx);
                return (
                  <label 
                    key={optIdx}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={String(optIdx)}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${
                      isSelected ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in">
              <label htmlFor={`short-answer-${currentQuestion.id}`} className="block text-sm font-semibold text-slate-600 mb-2">
                Ketik Jawaban Anda:
              </label>
              <input 
                id={`short-answer-${currentQuestion.id}`}
                type="text"
                autoComplete="off"
                placeholder="Contoh: Makan"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
            currentIndex === 0 
              ? 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-50' 
              : 'text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 active:scale-95'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Sebelumnya</span>
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!isQuestionAnswered()}
            className={`flex items-center px-8 py-3 rounded-xl font-bold shadow-md transition-all ${
              !isQuestionAnswered()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg active:scale-95'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>Submit Kuis</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isQuestionAnswered()}
            className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
              !isQuestionAnswered()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                : 'bg-white border border-slate-200 shadow-sm text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95'
            }`}
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
