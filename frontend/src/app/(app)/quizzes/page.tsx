"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, X, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { assignmentApi, AssignmentResult, quizApi, Quiz, Question, SubmitAnswer, HistoryListItem } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";

import QuizListView from "@/components/QuizListView";
import QuestionCard, { StudentAnswer } from "@/components/QuestionCardStudent";
import ResultView from "@/components/ResultView";

type AnswerMap = Record<number, StudentAnswer>;

function isAnswered(answer: StudentAnswer | undefined, question: Question): boolean {
  if (!answer) return false;
  switch (question.question_type) {
    case 1: return answer.selectedOptionId !== undefined;
    case 2: return (answer.answerText ?? "").trim() !== "";
    case 3: {
      const totalPairs = (question.matching_card ?? []).length;
      return totalPairs > 0 && Object.keys(answer.matchedPairs ?? {}).length === totalPairs;
    }
    case 4: return (answer.answerText ?? "").trim() !== "";
    default: return false;
  }
}

function QuizzesPageContent() {
  const searchParams = useSearchParams();
  const startQuizId  = searchParams.get("start");
  const fetchQuizzes = useCallback(() => quizApi.list(), []);
  const fetchHistory = useCallback(() => assignmentApi.getHistory(), []);
  const { data: quizList,    isLoading: quizzesLoading, error: quizzesError, refetch: refetchQuizzes } = useAsync<Quiz[]>(fetchQuizzes);
  const { data: historyList, isLoading: historyLoading,                       refetch: refetchHistory } = useAsync<HistoryListItem[]>(fetchHistory);
  const [passedQuizId,   setPassedQuizId]   = useState<Set<number>>(new Set());
  const [remedialQuizId, setRemedialQuizId] = useState<Set<number>>(new Set());
  const [pendingQuizId,  setPendingQuizId]  = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!historyList) return;
    setPassedQuizId(new Set(historyList.filter((h) => h.score_percent >= 60 && !h.has_ungraded_essay).map((h) => h.quiz_id)));
    setRemedialQuizId(new Set(historyList.filter((h) => h.score_percent < 60 && !h.has_ungraded_essay).map((h) => h.quiz_id)));
    setPendingQuizId(new Set(historyList.filter((h) => h.has_ungraded_essay).map((h) => h.quiz_id)));
  }, [historyList]);

  const [activeQuiz,   setActiveQuiz]   = useState<Quiz | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers,      setAnswers]      = useState<AnswerMap>({});
  const [checkedIds,   setCheckedIds]   = useState<Set<number>>(new Set());
  const [result,       setResult]       = useState<AssignmentResult | null>(null);

  const [isStarting,   setIsStarting]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startError,   setStartError]   = useState<string | null>(null);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  const [timeLeft,     setTimeLeft]     = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!startQuizId || !quizList || quizList.length === 0 || activeQuiz) return;
    const numericId = parseInt(startQuizId, 10);
    if (isNaN(numericId)) return;
    handleStart(numericId);
  }, [startQuizId, quizList]);

  const handleStart = async (quizId: number) => {
    setStartError(null);
    setIsStarting(true);
    try {
      const [assignment, fullQuiz] = await Promise.all([
        assignmentApi.start(quizId),
        quizApi.getById(quizId),
      ]);
      setAssignmentId(assignment.id);
      setActiveQuiz(fullQuiz);
      setCurrentIndex(0);
      setAnswers({});
      setCheckedIds(new Set());
      setResult(null);
      setSubmitError(null);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start quiz, please try again");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswer = (answer: StudentAnswer) => {
    if (checkedIds.has(answer.questionId)) return;
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    setCheckedIds((prev) => new Set(prev).add(currentQuestion.id));
  };

  const handleCancelQuiz = () => {
    if (confirm("Apakah Anda yakin ingin membatalkan kuis ini? Semua jawaban yang belum dikirim akan hilang.")) {
      handleReset();
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz || assignmentId === null) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const questions = activeQuiz.question ?? [];
      const payload: SubmitAnswer[] = [];

      for (const q of questions) {
        const a = answers[q.id];
        if (q.question_type === 1) {
          if (a?.selectedOptionId !== undefined)
            payload.push({ question_id: q.id, question_option_id: a.selectedOptionId });
        } else if (q.question_type === 2) {
          payload.push({ question_id: q.id, answer_text: a?.answerText?.trim() ?? "" });
        } else if (q.question_type === 3) {
          const entries = Object.entries(a?.matchedPairs ?? {});
          if (entries.length > 0) {
            for (const [l, r] of entries)
              payload.push({ question_id: q.id, question_card_id: Number(l), selected_card: Number(r) });
          } else {
            payload.push({ question_id: q.id });
          }
        } else if (q.question_type === 4) {
          payload.push({ question_id: q.id, answer_text: a?.answerText?.trim() ?? "" });
        }
      }

      const scored = await assignmentApi.submit(assignmentId, payload);

      if (scored.score_percent >= 60) {
        setPassedQuizId((prev) => new Set(prev).add(activeQuiz.id));
        setRemedialQuizId((prev) => { const s = new Set(prev); s.delete(activeQuiz.id); return s; });
      } else {
        setRemedialQuizId((prev) => new Set(prev).add(activeQuiz.id));
        setPassedQuizId((prev) => { const s = new Set(prev); s.delete(activeQuiz.id); return s; });
      }

      setResult(scored);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim jawaban. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveQuiz(null);
    setAssignmentId(null);
    setCurrentIndex(0);
    setAnswers({});
    setCheckedIds(new Set());
    setResult(null);
    setSubmitError(null);
    setStartError(null);
    setTimeLeft(null);
    refetchHistory();
    refetchQuizzes();
  };

  useEffect(() => {
    if (activeQuiz && activeQuiz.duration && activeQuiz.duration > 0) {
      setTimeLeft(activeQuiz.duration * 60);
    } else {
      setTimeLeft(null);
    }
  }, [activeQuiz]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (quizzesLoading || historyLoading) {
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

  if (result) return <ResultView result={result} onReset={handleReset} />;

  // ── Quiz list ────────────────────────────────────────────────────────────────

  if (!activeQuiz) {
    return (
      <QuizListView
        quizzes={quizList ?? []}
        onStart={handleStart}
        isStarting={isStarting}
        startError={startError}
        isCompetedQuizId={passedQuizId}
        remedialQuizId={remedialQuizId}
        pendingQuizId={pendingQuizId}
      />
    );
  }

  const questions       = activeQuiz.question ?? [];
  const currentQuestion = questions[currentIndex];
  const isLast          = currentIndex === questions.length - 1;
  const currentAnswer   = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isChecked       = currentQuestion ? checkedIds.has(currentQuestion.id) : false;
  const canProceed      = currentQuestion ? isAnswered(currentAnswer, currentQuestion) : false;
  const answeredCount   = questions.filter((q) => isAnswered(answers[q.id], q)).length;
  const progressPct     = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto h-full flex flex-col justify-start min-h-[80vh]">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{activeQuiz.title}</h1>
            {activeQuiz.description && <p className="text-slate-500 text-sm mt-1">{activeQuiz.description}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all duration-300 ${
                timeLeft < 60
                  ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse shadow-sm shadow-rose-100"
                  : timeLeft < 180
                  ? "bg-amber-50 border-amber-200 text-amber-600"
                  : "bg-indigo-50 border-indigo-100 text-indigo-600"
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button onClick={handleCancelQuiz} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all border border-rose-100">
              <X className="w-3.5 h-3.5" /> Batalkan Kuis
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span>Soal {currentIndex + 1} dari {questions.length}</span>
          <span>{answeredCount} / {questions.length} dijawab · {progressPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {currentQuestion && (
        <div className={isChecked ? "opacity-90 pointer-events-none select-none" : ""}>
          <QuestionCard question={currentQuestion} index={currentIndex} total={questions.length} answer={currentAnswer} onAnswer={handleAnswer} />
        </div>
      )}

      {isChecked && (
        <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">Jawaban dikunci. {isLast ? 'Tekan "Selesai" untuk mengumpulkan.' : "Lanjut ke soal berikutnya."}</p>
        </div>
      )}

      {submitError && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        {currentIndex > 0 ? (
          <button onClick={() => setCurrentIndex((i) => i - 1)} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" /> Sebelumnya
          </button>
        ) : <div />}

        {isLast ? (
          !isChecked ? (
            <button onClick={handleCheckAnswer} disabled={!canProceed} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-md transition-all ${!canProceed ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg active:scale-95"}`}>
              <CheckCircle2 className="w-5 h-5" /> Cek Jawaban
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-green-200 hover:shadow-lg transition-all active:scale-[0.98]">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Mengirim...</span></> : <><CheckCircle2 className="w-5 h-5" /><span>Selesai &amp; Lihat Hasil</span></>}
            </button>
          )
        ) : (
          !isChecked ? (
            <button onClick={handleCheckAnswer} disabled={!canProceed} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-sm ${!canProceed ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none" : "bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 active:scale-95"}`}>
              <CheckCircle2 className="w-5 h-5" /> Cek Jawaban
            </button>
          ) : (
            <button onClick={() => setCurrentIndex((i) => i + 1)} className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-white border border-slate-200 shadow-sm text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95 transition-all">
              Selanjutnya <ArrowRight className="w-5 h-5" />
            </button>
          )
        )}
      </div>

      {!canProceed && !isChecked && (
        <p className="text-center text-xs text-slate-400 mt-3">Jawab soal ini terlebih dahulu untuk melanjutkan.</p>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <QuizzesPageContent />
    </Suspense>
  );
}