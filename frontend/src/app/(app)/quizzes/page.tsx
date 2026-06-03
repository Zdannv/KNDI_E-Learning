"use client";

/**
 * src/app/(app)/kuis/page.tsx
 *
 * Student quiz page — fully self-contained, no dummyKuis dependency.
 *
 * ── Flow ─────────────────────────────────────────────────────────────────────
 *
 *  LIST      → GET /api/quizzes            (only published quizzes)
 *  START     → POST /api/assignment        { quiz_id } → assignment_id
 *  LOAD Q's  → GET /api/quizzes/:id        (with full question + option IDs)
 *  EXECUTE   → one question per screen, collect answers in state
 *  SUBMIT    → POST /api/assignment/:id/submit { answer: SubmitAnswer[] }
 *  RESULT    → render scored result from submit response
 *
 * ── Answer payload per question type ─────────────────────────────────────────
 *
 *  multiple_choice → { question_id, question_option_id }
 *                    We need the backend option.id, so we load the full quiz
 *                    via getById() after starting the assignment.
 *
 *  short_answer    → { question_id, answer_text }
 *
 *  matching        → one SubmitAnswer per matched pair:
 *                    { question_id, question_card_id: leftCard.id,
 *                      selected_card: rightCard.id }
 *                    A correct match means leftCard.id === rightCard.id
 *                    (each pair has one card object with same left/right id).
 */

import React, { useCallback, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import {
  assignmentApi,
  AssignmentResult,
  quizApi,
  Quiz,
  Question,
  SubmitAnswer,
} from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";

// ─── Local types ──────────────────────────────────────────────────────────────

/** Tracks student answers per question id */
type AnswerMap = Record<number, StudentAnswer>;

interface StudentAnswer {
  questionId:     number;
  questionType:   1 | 2 | 3;
  // multiple_choice
  selectedOptionId?: number;
  selectedOptionIndex?: number;
  // short_answer
  answerText?: string;
  // matching: map of leftCardId → rightCardId selected
  matchedPairs?: Record<number, number>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function isAnswered(answer: StudentAnswer | undefined, question: Question): boolean {
  if (!answer) return false;
  switch (question.question_type) {
    case 1: return answer.selectedOptionId !== undefined;
    case 2: return (answer.answerText ?? "").trim() !== "";
    case 3: {
      const totalPairs = (question.matching_card ?? []).length;
      return totalPairs > 0 && Object.keys(answer.matchedPairs ?? {}).length === totalPairs;
    }
  }
}

function scoreColor(pct: number): string {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(pct: number): string {
  if (pct >= 80) return "bg-green-50 border-green-200";
  if (pct >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

/** List of available published quizzes */
function QuizListView({
  quizzes,
  onStart,
  isStarting,
  startError,
}: {
  quizzes: Quiz[];
  onStart: (quizId: number) => void;
  isStarting: boolean;
  startError: string | null;
}) {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Daftar Kuis</h1>
        <p className="text-slate-600">
          Pilih kuis yang ingin Anda kerjakan. Pastikan kondisi Anda siap sebelum memulai.
        </p>
      </div>

      {startError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{startError}</p>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Kuis</h3>
          <p className="text-slate-500 max-w-sm">
            Sensei belum mempublikasikan kuis apa pun. Cek kembali nanti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                    {quiz.description ?? "Tidak ada deskripsi."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-500 font-medium">
                  <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{quiz.question?.length ?? 0} soal</span>
                </div>
                <button
                  onClick={() => onStart(quiz.id)}
                  disabled={isStarting}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isStarting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Memulai...</>
                  ) : (
                    <>Mulai Kuis <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Matching question UI — drag-free click-to-match */
function MatchingQuestionUI({
  question,
  answer,
  onMatch,
}: {
  question: Question;
  answer: StudentAnswer | undefined;
  onMatch: (leftCardId: number, rightCardId: number) => void;
}) {
  const [selectedLeft,  setSelectedLeft]  = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [flashWrong,    setFlashWrong]    = useState(false);

  const cards       = question.matching_card ?? [];
  const matchedPairs = answer?.matchedPairs ?? {};

  // Shuffle right cards for display (deterministic per question)
  const rightCards = [...cards].sort((a, b) => a.id - b.id);
  const leftCards  = [...cards].sort((a, b) => a.id - b.id);

  const handleLeftClick = (cardId: number) => {
    if (matchedPairs[cardId] !== undefined) return; // already matched
    setSelectedLeft(cardId === selectedLeft ? null : cardId);
  };

  const handleRightClick = (cardId: number) => {
    // Check if this right card is already matched
    const alreadyMatched = Object.values(matchedPairs).includes(cardId);
    if (alreadyMatched) return;

    if (!selectedLeft) {
      setSelectedRight(cardId === selectedRight ? null : cardId);
      return;
    }

    // We have both selected — check if it's a correct pair
    if (selectedLeft === cardId) {
      // Correct! Left card id === right card id means they are the same pair
      onMatch(selectedLeft, cardId);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong match — flash red briefly
      setFlashWrong(true);
      setTimeout(() => {
        setFlashWrong(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-500 mb-2">
        Klik kartu kiri lalu klik kartu kanan yang tepat untuk menjodohkan.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Pertanyaan</p>
          {leftCards.map((card) => {
            const isMatched  = matchedPairs[card.id] !== undefined;
            const isSelected = selectedLeft === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleLeftClick(card.id)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                  isMatched
                    ? "border-green-400 bg-green-50 text-green-700 cursor-default"
                    : isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                    : flashWrong && isSelected
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {card.left_image_url && (
                  <img src={card.left_image_url} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />
                )}
                {card.left_text}
                {isMatched && <span className="ml-2 text-green-500">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Jawaban</p>
          {rightCards.map((card) => {
            const isMatched  = Object.values(matchedPairs).includes(card.id);
            const isSelected = selectedRight === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleRightClick(card.id)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                  isMatched
                    ? "border-green-400 bg-green-50 text-green-700 cursor-default"
                    : isSelected || (flashWrong && selectedRight === card.id)
                    ? flashWrong
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {card.right_image_url && (
                  <img src={card.right_image_url} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />
                )}
                {card.right_text}
                {isMatched && <span className="ml-2 text-green-500">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center text-slate-400">
        {Object.keys(matchedPairs).length} / {cards.length} pasangan terjawab
      </p>
    </div>
  );
}

/** Single question card */
function QuestionCard({
  question,
  index,
  total,
  answer,
  onAnswer,
}: {
  question: Question;
  index: number;
  total: number;
  answer: StudentAnswer | undefined;
  onAnswer: (answer: StudentAnswer) => void;
}) {
  const handleOptionSelect = (optionId: number, optionIndex: number) => {
    onAnswer({
      questionId:          question.id,
      questionType:        1,
      selectedOptionId:    optionId,
      selectedOptionIndex: optionIndex,
    });
  };

  const handleTextChange = (text: string) => {
    onAnswer({
      questionId:   question.id,
      questionType: 2,
      answerText:   text,
    });
  };

  const handleMatch = (leftCardId: number, rightCardId: number) => {
    const current = answer?.matchedPairs ?? {};
    onAnswer({
      questionId:   question.id,
      questionType: 3,
      matchedPairs: { ...current, [leftCardId]: rightCardId },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      {/* Question header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Soal {index + 1} dari {total}
        </span>
        <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
          {question.question_text}
        </p>

        {/* Question media */}
        {question.image_url && (
          <img
            src={question.image_url}
            alt="Gambar soal"
            className="mt-4 rounded-xl max-h-48 object-contain border border-slate-200"
          />
        )}
        {question.audio_url && (
          <audio controls src={question.audio_url} className="mt-4 w-full h-10" />
        )}
      </div>

      {/* Answer area */}
      <div className="space-y-3">

        {/* Multiple choice */}
        {question.question_type === 1 && (
          <div className="grid grid-cols-1 gap-3">
            {(question.question_options ?? []).map((opt, idx) => {
              const isSelected = answer?.selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionSelect(opt.id, idx)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    {opt.image_url && (
                      <img src={opt.image_url} alt="" className="w-full max-h-24 object-contain rounded-lg mb-2" />
                    )}
                    {opt.audio_url && (
                      <audio controls src={opt.audio_url} className="w-full h-8 mb-1" />
                    )}
                    <span className="text-slate-800 font-medium">{opt.option_text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer */}
        {question.question_type === 2 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Jawaban Anda:</label>
            <input
              type="text"
              value={answer?.answerText ?? ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Ketik jawaban di sini..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
            />
          </div>
        )}

        {/* Matching */}
        {question.question_type === 3 && (
          <MatchingQuestionUI
            question={question}
            answer={answer}
            onMatch={handleMatch}
          />
        )}
      </div>
    </div>
  );
}

/** Result screen after submission */
function ResultView({
  result,
  onReset,
}: {
  result: AssignmentResult;
  onReset: () => void;
}) {
  const pct = result.score_percent;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Score card */}
      <div className={`rounded-2xl border p-8 text-center mb-8 ${scoreBg(pct)}`}>
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${scoreColor(pct)}`} />
        <h1 className="text-3xl font-black text-slate-800 mb-2">{result.quiz_title}</h1>
        <p className="text-slate-500 mb-6 text-sm">Kuis selesai dikerjakan</p>

        <div className={`text-7xl font-black mb-2 ${scoreColor(pct)}`}>
          {pct.toFixed(0)}%
        </div>
        <p className="text-slate-600 font-medium">
          Skor: {result.score_earned.toFixed(1)} / {result.total_point.toFixed(1)}
        </p>

        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
          pct >= 60 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {pct >= 60 ? (
            <><CheckCircle2 className="w-4 h-4" /> Lulus</>
          ) : (
            <><XCircle className="w-4 h-4" /> Belum Lulus</>
          )}
        </div>
      </div>

      {/* Answer breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Pembahasan Jawaban</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {result.answers.map((ans, i) => (
            <div key={i} className="p-5">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${ans.is_correct ? "text-green-500" : "text-red-500"}`}>
                  {ans.is_correct ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 mb-1">
                    {i + 1}. {ans.question_text}
                  </p>
                  <p className={`text-sm ${ans.is_correct ? "text-green-600" : "text-red-600"}`}>
                    Jawaban Anda: <span className="font-medium">{ans.your_answer || "—"}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Poin: {ans.score_earned.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        Kembali ke Daftar Kuis
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KuisPage() {
  // ── Fetch published quiz list ──────────────────────────────────────────────
  const fetchQuizzes = useCallback(() => quizApi.list(), []);
  const {
    data: quizList,
    isLoading: quizzesLoading,
    error: quizzesError,
  } = useAsync<Quiz[]>(fetchQuizzes);

  // ── Session state ──────────────────────────────────────────────────────────
  const [activeQuiz,    setActiveQuiz]    = useState<Quiz | null>(null);
  const [assignmentId,  setAssignmentId]  = useState<number | null>(null);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [answers,       setAnswers]       = useState<AnswerMap>({});
  const [result,        setResult]        = useState<AssignmentResult | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isStarting,   setIsStarting]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startError,   setStartError]   = useState<string | null>(null);
  const [submitError,  setSubmitError]  = useState<string | null>(null);

  // ── Start quiz ─────────────────────────────────────────────────────────────
  const handleStart = async (quizId: number) => {
    setStartError(null);
    setIsStarting(true);

    try {
      // 1. Create assignment
      const assignment = await assignmentApi.start(quizId);

      // 2. Load full quiz with question_option IDs (needed for MC submission)
      const fullQuiz = await quizApi.getById(quizId);

      setAssignmentId(assignment.id);
      setActiveQuiz(fullQuiz);
      setCurrentIndex(0);
      setAnswers({});
      setResult(null);
      setSubmitError(null);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "Gagal memulai kuis. Coba lagi."
      );
    } finally {
      setIsStarting(false);
    }
  };

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = (answer: StudentAnswer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!activeQuiz || assignmentId === null) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const questions = activeQuiz.question ?? [];
      const payload: SubmitAnswer[] = [];

      for (const q of questions) {
        const studentAnswer = answers[q.id];

        if (q.question_type === 1) {
          // Multiple choice — send the backend option id
          if (studentAnswer?.selectedOptionId !== undefined) {
            payload.push({
              question_id:        q.id,
              question_option_id: studentAnswer.selectedOptionId,
            });
          }
        } else if (q.question_type === 2) {
          // Short answer
          payload.push({
            question_id: q.id,
            answer_text: studentAnswer?.answerText?.trim() || "",
          });
        } else if (q.question_type === 3) {
          // Matching — one entry per matched pair
          const matchedPairs = studentAnswer?.matchedPairs ?? {};
          for (const [leftCardId, rightCardId] of Object.entries(matchedPairs)) {
            payload.push({
              question_id:      q.id,
              question_card_id: Number(leftCardId),
              selected_card:    rightCardId,
            });
          }
          // If question wasn't answered, still send with empty to mark as attempted
          if (Object.keys(matchedPairs).length === 0) {
            payload.push({ question_id: q.id });
          }
        }
      }

      const scored = await assignmentApi.submit(assignmentId, payload);
      setResult(scored);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal mengirim jawaban. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setActiveQuiz(null);
    setAssignmentId(null);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError(null);
  };

  // ── Loading / error state for quiz list ────────────────────────────────────
  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-medium">Memuat daftar kuis...</p>
      </div>
    );
  }

  if (quizzesError) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{quizzesError}</p>
        </div>
      </div>
    );
  }

  // ── Result view ────────────────────────────────────────────────────────────
  if (result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  // ── List view ──────────────────────────────────────────────────────────────
  if (!activeQuiz) {
    return (
      <QuizListView
        quizzes={quizList ?? []}
        onStart={handleStart}
        isStarting={isStarting}
        startError={startError}
      />
    );
  }

  // ── Quiz execution view ────────────────────────────────────────────────────
  const questions    = activeQuiz.question ?? [];
  const currentQ     = questions[currentIndex];
  const isLast       = currentIndex === questions.length - 1;
  const currentAns   = currentQ ? answers[currentQ.id] : undefined;
  const questionAnswered = currentQ ? isAnswered(currentAns, currentQ) : false;

  // Progress: how many questions have been answered
  const answeredCount = questions.filter((q) => isAnswered(answers[q.id], q)).length;
  const progressPct   = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-slate-800 line-clamp-1">
            {activeQuiz.title}
          </h1>
          <span className="text-sm font-semibold text-slate-500 shrink-0 ml-4">
            {answeredCount}/{questions.length} terjawab
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* Question */}
      {currentQ && (
        <QuestionCard
          question={currentQ}
          index={currentIndex}
          total={questions.length}
          answer={currentAns}
          onAnswer={handleAnswer}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {/* Previous */}
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
            currentIndex === 0
              ? "opacity-40 cursor-not-allowed text-slate-400 bg-slate-100"
              : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95"
          }`}
        >
          <ArrowLeft className="w-5 h-5" /> Sebelumnya
        </button>

        {/* Next / Submit */}
        {!isLast ? (
          <button
            onClick={() => setCurrentIndex((p) => p + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Selanjutnya <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> Selesai &amp; Kirim</>
            )}
          </button>
        )}
      </div>

      {/* Question dot navigation */}
      {questions.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {questions.map((q, i) => {
            const isAnsweredQ  = isAnswered(answers[q.id], q);
            const isCurrent    = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                title={`Soal ${i + 1}`}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300 scale-110"
                    : isAnsweredQ
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}