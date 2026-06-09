"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QuizData, QuizHistoryRecord, fallbackMockQuizzes, MatchingPair } from "@/data/dummyKuis";
import { useRole } from "@/context/RoleContext";
import { useSearchParams } from "next/navigation";

import QuizListView from "@/components/kuis/QuizListView";
import QuizResultView from "@/components/kuis/QuizResultView";
import QuestionCard from "@/components/kuis/QuestionCard";
import { MatchingStateEntry } from "@/components/kuis/MatchingCard";

// Normalisasi data quiz dari localStorage yang mungkin masih menyimpan options
// dalam format lama (array of string) bukan format baru (array of object { text: string })
function normalizeQuizzes(quizzes: QuizData[]): QuizData[] {
  return quizzes.map((quiz) => ({
    ...quiz,
    questions: quiz.questions.map((q) => {
      if (q.type === "multiple_choice") {
        return {
          ...q,
          options: (q.options as unknown[]).map((opt) =>
            typeof opt === "string" ? { text: opt } : opt
          ) as [any, any, any, any],
        };
      }
      return q;
    }),
  }));
}

function KuisPageContent() {
  const { currentRole } = useRole();
  const searchParams = useSearchParams();
  const startQuizId = searchParams.get("start");

  const [rawStoredQuizzes, , isClient] = useLocalStorage<QuizData[]>("kndi_quizzes_v2", fallbackMockQuizzes);
  const storedQuizzes = normalizeQuizzes(rawStoredQuizzes);
  const [storedHistory, setStoredHistory] = useLocalStorage<QuizHistoryRecord[]>("kndi_history", []);

  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [checkedQuestions, setCheckedQuestions] = useState<string[]>([]);
  const [shuffledPairs, setShuffledPairs] = useState<Record<string, { left: MatchingPair[]; right: MatchingPair[] }>>({});
  const [matchingState, setMatchingState] = useState<Record<string, MatchingStateEntry>>({});

  // Automatically start quiz from URL query param
  useEffect(() => {
    if (isClient && startQuizId && storedQuizzes.length > 0 && !selectedQuiz) {
      const quiz = storedQuizzes.find((q) => q.id === startQuizId);
      if (quiz) {
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

        setSelectedQuiz(quiz);
        setAnswers({});
        setCurrentIndex(0);
        setIsSubmitted(false);
        setScore(0);
        setCheckedQuestions([]);
        setShuffledPairs(newShuffled);
        setMatchingState(initMatching);
      }
    }
  }, [isClient, startQuizId, storedQuizzes, selectedQuiz]);

  if (!isClient) return <div className="p-6 h-screen w-full" />;

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const resetQuiz = () => {
    setSelectedQuiz(null);
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);
    setCheckedQuestions([]);
    setShuffledPairs({});
    setMatchingState({});
  };

  const handleStart = (
    quiz: QuizData,
    shuffled: Record<string, { left: MatchingPair[]; right: MatchingPair[] }>,
    initMatching: Record<string, MatchingStateEntry>
  ) => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);
    setCheckedQuestions([]);
    setShuffledPairs(shuffled);
    setMatchingState(initMatching);
    setSelectedQuiz(quiz);
  };

  // ─── List View ─────────────────────────────────────────────────────────────
  if (!selectedQuiz) {
    return <QuizListView quizzes={storedQuizzes} onStart={handleStart} />;
  }

  // ─── Derived State ─────────────────────────────────────────────────────────
  const totalQuestions = selectedQuiz.questions.length;
  const currentQuestion = selectedQuiz.questions[currentIndex];
  const isChecked = checkedQuestions.includes(currentQuestion.id);
  const isAnswered = !!answers[currentQuestion.id]?.trim();

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAnswerChange = (questionId: string, val: string) => {
    if (checkedQuestions.includes(questionId)) return;
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleMatchSelect = (questionId: string, side: "left" | "right", pairId: string) => {
    setMatchingState((prev) => {
      const qState = prev[questionId];
      if (!qState || qState.matchedPairIds.includes(pairId) || checkedQuestions.includes(questionId)) return prev;

      const newLeft = side === "left" ? (qState.leftSelected === pairId ? null : pairId) : qState.leftSelected;
      const newRight = side === "right" ? (qState.rightSelected === pairId ? null : pairId) : qState.rightSelected;

      if (newLeft && newRight) {
        if (newLeft === newRight) {
          const newMatched = [...qState.matchedPairIds, newLeft];
          const totalPairs = (selectedQuiz.questions.find((q) => q.id === questionId && q.type === "matching") as any)?.pairs?.length ?? 0;
          if (newMatched.length === totalPairs) {
            setTimeout(() => handleAnswerChange(questionId, "MATCHED_ALL"), 300);
          }
          return { ...prev, [questionId]: { matchedPairIds: newMatched, leftSelected: null, rightSelected: null, flashRed: false } };
        } else {
          setTimeout(() => {
            setMatchingState((curr) => curr[questionId]
              ? { ...curr, [questionId]: { ...curr[questionId], leftSelected: null, rightSelected: null, flashRed: false } }
              : curr
            );
          }, 600);
          return { ...prev, [questionId]: { ...qState, leftSelected: newLeft, rightSelected: newRight, flashRed: true } };
        }
      }
      return { ...prev, [questionId]: { ...qState, leftSelected: newLeft, rightSelected: newRight, flashRed: false } };
    });
  };

  const handleCheckAnswer = () => {
    if (!isAnswered) return;
    setCheckedQuestions((prev) => [...prev, currentQuestion.id]);
  };

  const handleSubmit = () => {
    if (!isAnswered) return;
    
    // Calculate total weight
    const totalWeight = selectedQuiz.questions.reduce((sum, q) => sum + q.weight, 0);
    
    let weightedScore = 0;
    
    selectedQuiz.questions.forEach((q) => {
      const ua = answers[q.id] || "";
      
      // Skip essay questions in auto-grading (they contribute 0 for now)
      if (q.type === "essay") {
        return;
      }
      
      // Calculate max score contribution for this question
      const maxScoreContribution = (q.weight / totalWeight) * 100;
      
      // Determine correctness (0.0 to 1.0)
      let correctness = 0;
      
      if (q.type === "multiple_choice") {
        correctness = parseInt(ua, 10) === q.correctOptionIndex ? 1 : 0;
      } else if (q.type === "short_answer") {
        correctness = ua.trim().toLowerCase() === q.correctAnswerText.trim().toLowerCase() ? 1 : 0;
      } else if (q.type === "matching") {
        correctness = ua === "MATCHED_ALL" ? 1 : 0;
      }
      
      // Add weighted score
      weightedScore += correctness * maxScoreContribution;
    });
    
    const calculatedScore = Math.round(weightedScore);
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    const now = new Date();
    const studentName = currentRole === "sensei" ? "Sensei Taro" : "Siswa Budi";
    setStoredHistory((prev) => [
      {
        id: "h" + Date.now(),
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        score: calculatedScore,
        dateStr: now.toISOString().split("T")[0],
        timeStr: now.toTimeString().split(" ")[0],
        studentName: studentName,
      },
      ...prev,
    ]);
  };

  // ─── Result View ───────────────────────────────────────────────────────────
  if (isSubmitted) {
    return <QuizResultView quiz={selectedQuiz} score={score} answers={answers} onReset={resetQuiz} />;
  }

  // ─── Execution View ────────────────────────────────────────────────────────
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const qMatchingState = matchingState[currentQuestion.id];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold text-slate-800">{selectedQuiz.title}</h1>
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin membatalkan kuis ini? Semua jawaban yang belum dikirim akan hilang.")) {
                resetQuiz();
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all border border-rose-100 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Batalkan Kuis</span>
          </button>
        </div>
        <p className="text-slate-500 text-sm">{selectedQuiz.description}</p>
        <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-500 mb-2">
          <span>Soal {currentIndex + 1} dari {totalQuestions}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        answer={answers[currentQuestion.id] ?? ""}
        isChecked={isChecked}
        shuffledLeft={shuffledPairs[currentQuestion.id]?.left}
        shuffledRight={shuffledPairs[currentQuestion.id]?.right}
        matchingState={qMatchingState}
        onAnswerChange={(val) => handleAnswerChange(currentQuestion.id, val)}
        onMatchSelect={(side, pairId) => handleMatchSelect(currentQuestion.id, side, pairId)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
          disabled={currentIndex === 0}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${currentIndex === 0 ? "text-slate-400 bg-slate-100 cursor-not-allowed opacity-50" : "text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 active:scale-95"}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Sebelumnya</span>
        </button>

        {currentIndex === totalQuestions - 1 ? (
          !isChecked ? (
            <button onClick={handleCheckAnswer} disabled={!isAnswered} className={`flex items-center px-8 py-3 rounded-xl font-bold shadow-md transition-all ${!isAnswered ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg active:scale-95"}`}>
              <CheckCircle2 className="w-5 h-5 mr-2" /><span>Cek Jawaban</span>
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center px-8 py-3 rounded-xl font-bold bg-green-600 text-white shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg active:scale-95 transition-all">
              <CheckCircle2 className="w-5 h-5 mr-2" /><span>Selesai &amp; Lihat Hasil</span>
            </button>
          )
        ) : (
          !isChecked ? (
            <button onClick={handleCheckAnswer} disabled={!isAnswered} className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all shadow-sm ${!isAnswered ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none" : "bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 active:scale-95"}`}>
              <span>Cek Jawaban</span>
            </button>
          ) : (
            <button onClick={() => setCurrentIndex((p) => p + 1)} className="flex items-center px-8 py-3 rounded-xl font-semibold bg-white border border-slate-200 shadow-sm text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95 transition-all">
              <span>Selanjutnya</span><ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function UserKuisPage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-5xl mx-auto h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <KuisPageContent />
    </Suspense>
  );
}
