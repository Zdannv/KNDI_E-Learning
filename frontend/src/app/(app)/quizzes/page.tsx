"use client";

import{ useCallback, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { assignmentApi, AssignmentResult, quizApi, Quiz, Question, SubmitAnswer, HistoryListItem } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";

import QuizListView from "@/components/QuizListView";
import QuestionCard, { StudentAnswer } from "@/components/QuestionCardStudent";
import ResultView from "@/components/ResultView";

type AnswerMap = Record<number, StudentAnswer>;

function isAnswered(answer: StudentAnswer | undefined, question: Question): boolean {
  if (!answer) return false;
  switch (question.question_type) {
    case 1:
      return answer.selectedOptionId !== undefined;
    case 2:
      return (answer.answerText ?? "").trim() !== "";
    case 3: {
      const totalPairs = (question.matching_card ?? []).length;
      return (
        totalPairs > 0 &&
        Object.keys(answer.matchedPairs ?? {}).length === totalPairs
      );
    }
    case 4:
      return (answer.answerText ?? "").trim() !== "";
    default:
      return false;
  }
}

export default function QuizzesPage() {
  const fetchQuizzes = useCallback(() => quizApi.list(), []);
  const fetchHistory = useCallback(() => assignmentApi.getHistory(), []);

  const { data: quizList, isLoading: quizzesLoading, error: quizzesError } = useAsync<Quiz[]>(fetchQuizzes);
  const { data: historyList, isLoading: historyLoading } = useAsync<HistoryListItem[]>(fetchHistory);

  const completedQuizId = useMemo<Set<number>>(() => {
    if (!historyList) return new Set();
    return new Set(historyList.map((h) => h.quiz_id));
  }, [historyList]);

  const {
    data: historyList,
    isLoading: historyLoading
  } = useAsync<HistoryListItem[]>(fetchHistory)

  const completedQuizId = useMemo<Set<number>>(() => {
    if (!historyList) {
      return new Set()
    }

    return new Set(historyList.map((h) => h.quiz_id))
  }, [historyList])

  const [activeQuiz,   setActiveQuiz]   = useState<Quiz | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers,      setAnswers]      = useState<AnswerMap>({});
  const [result,       setResult]       = useState<AssignmentResult | null>(null);

  const [isStarting,   setIsStarting]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startError,   setStartError]   = useState<string | null>(null);
  const [submitError,  setSubmitError]  = useState<string | null>(null);

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
      setResult(null);
      setSubmitError(null);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start quiz, Please try again");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswer = (answer: StudentAnswer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  };

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
          if (studentAnswer?.selectedOptionId !== undefined) {
            payload.push({
              question_id:        q.id,
              question_option_id: studentAnswer.selectedOptionId,
            });
          }
        } else if (q.question_type === 2) {
          payload.push({
            question_id: q.id,
            answer_text: studentAnswer?.answerText?.trim() ?? "",
          });
        } else if (q.question_type === 3) {
          const matchedPairs = studentAnswer?.matchedPairs ?? {};
          const entries      = Object.entries(matchedPairs);
          if (entries.length > 0) {
            for (const [leftCardId, rightCardId] of entries) {
              payload.push({
                question_id:      q.id,
                question_card_id: Number(leftCardId),
                selected_card:    Number(rightCardId),
              });
            }
          } else {
            payload.push({ question_id: q.id });
          }
        } else if (q.question_type === 4) {
          payload.push({
            question_id: q.id,
            answer_text: studentAnswer?.answerText?.trim() ?? "",
          });
        }
      }

      const scored = await assignmentApi.submit(assignmentId, payload);
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
    setResult(null);
    setSubmitError(null);
    setStartError(null);
  };

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

  if (result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  if (!activeQuiz) {
    return (
      <QuizListView
        quizzes={quizList ?? []}
        onStart={handleStart}
        isStarting={isStarting}
        startError={startError}
        isCompetedQuizId={completedQuizId}
      />
    );
  }

  const questions = activeQuiz.question ?? [];
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canProceed = currentQuestion ? isAnswered(currentAnswer, currentQuestion) : false;

  const answeredCount = questions.filter((q) => isAnswered(answers[q.id], q)).length;
  const progressPct   = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span>{activeQuiz.title}</span>
          <span>{answeredCount} / {questions.length} dijawab</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          answer={currentAnswer}
          onAnswer={handleAnswer}
        />
      )}

      {submitError && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {currentIndex > 0 ? (
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        ) : (
          <div />
        )}

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Mengirim...</span></>
            ) : (
              <span>Kumpulkan Jawaban</span>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            <span>Lanjut</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {!canProceed && !isLast && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Jawab soal ini terlebih dahulu untuk lanjut.
        </p>
      )}
    </div>
  );
}