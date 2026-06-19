"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { quizApi, assignmentApi, Quiz, AssignmentResult, SubmitAnswer } from "@/app/lib/use-api";
import { StudentAnswer } from "@/components/QuestionCardStudent";

type AnswerMap = Record<number, StudentAnswer>;

interface QuizSessionContextType {
  activeQuiz: Quiz | null;
  assignmentId: number | null;
  currentIndex: number;
  answers: AnswerMap;
  checkedIds: number[];
  result: AssignmentResult | null;
  timeLeft: number | null;
  endTime: number | null;
  isStarting: boolean;
  isSubmitting: boolean;
  startError: string | null;
  submitError: string | null;

  startQuiz: (quizId: number) => Promise<void>;
  answerQuestion: (answer: StudentAnswer) => void;
  checkAnswer: (questionId: number) => void;
  cancelQuiz: (quiet?: boolean) => void;
  submitQuiz: (isAutoSubmit?: boolean) => Promise<void>;
  resetSession: () => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setResult: React.Dispatch<React.SetStateAction<AssignmentResult | null>>;
}

const QuizSessionContext = createContext<QuizSessionContextType | undefined>(undefined);

export function useQuizSession() {
  const context = useContext(QuizSessionContext);
  if (!context) {
    throw new Error("useQuizSession must be used within a QuizSessionProvider");
  }
  return context;
}

export function QuizSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [result, setResult] = useState<AssignmentResult | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Restore session from sessionStorage on client-side mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("kndi_quiz_session");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.activeQuiz) {
          setActiveQuiz(data.activeQuiz);
          setAssignmentId(data.assignmentId ?? null);
          setCurrentIndex(data.currentIndex ?? 0);
          setAnswers(data.answers ?? {});
          setCheckedIds(data.checkedIds ?? []);
          setResult(data.result ?? null);
          setEndTime(data.endTime ?? null);
        }
      }
    } catch (e) {
      console.error("Error reading quiz session from storage", e);
    }
  }, []);

  // Save session to sessionStorage on state changes
  useEffect(() => {
    if (activeQuiz) {
      const data = {
        activeQuiz,
        assignmentId,
        currentIndex,
        answers,
        checkedIds,
        result,
        endTime,
      };
      sessionStorage.setItem("kndi_quiz_session", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("kndi_quiz_session");
    }
  }, [activeQuiz, assignmentId, currentIndex, answers, checkedIds, result, endTime]);

  // Keep refs of latest state to avoid stale closure during auto-submit in background timer
  const activeQuizRef = useRef(activeQuiz);
  const assignmentIdRef = useRef(assignmentId);
  const answersRef = useRef(answers);
  const isSubmittingRef = useRef(isSubmitting);

  useEffect(() => { activeQuizRef.current = activeQuiz; }, [activeQuiz]);
  useEffect(() => { assignmentIdRef.current = assignmentId; }, [assignmentId]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { isSubmittingRef.current = isSubmitting; }, [isSubmitting]);

  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    const curQuiz = activeQuizRef.current;
    const curAssignmentId = assignmentIdRef.current;
    const curAnswers = answersRef.current;

    if (!curQuiz || curAssignmentId === null || isSubmittingRef.current) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const questions = curQuiz.question ?? [];
      const payload: SubmitAnswer[] = [];

      for (const q of questions) {
        const a = curAnswers[q.id];
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

      const scored = await assignmentApi.submit(curAssignmentId, payload);
      setResult(scored);

      // Clear active quiz session
      setActiveQuiz(null);
      setAssignmentId(null);
      setCurrentIndex(0);
      setAnswers({});
      setCheckedIds([]);
      setEndTime(null);
      setTimeLeft(null);

      if (isAutoSubmit) {
        alert(`Waktu Anda untuk kuis "${curQuiz.title}" telah habis! Jawaban Anda telah dikirim secara otomatis.`);
        router.push("/quizzes");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim jawaban. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  const startQuiz = useCallback(async (quizId: number) => {
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
      setCheckedIds([]);
      setResult(null);
      setSubmitError(null);

      if (fullQuiz.duration && fullQuiz.duration > 0) {
        const computedEndTime = Date.now() + fullQuiz.duration * 60 * 1000;
        setEndTime(computedEndTime);
        setTimeLeft(fullQuiz.duration * 60);
      } else {
        setEndTime(null);
        setTimeLeft(null);
      }

      router.push("/quizzes");
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Gagal memulai kuis, silakan coba lagi");
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, [router]);

  const answerQuestion = useCallback((answer: StudentAnswer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }));
  }, []);

  const checkAnswer = useCallback((questionId: number) => {
    setCheckedIds((prev) => {
      if (prev.includes(questionId)) return prev;
      return [...prev, questionId];
    });
  }, []);

  const cancelQuiz = useCallback((quiet = false) => {
    const curQuiz = activeQuizRef.current;
    if (quiet || confirm("Apakah Anda yakin ingin membatalkan kuis ini? Semua jawaban yang belum dikirim akan hilang.")) {
      setActiveQuiz(null);
      setAssignmentId(null);
      setCurrentIndex(0);
      setAnswers({});
      setCheckedIds([]);
      setResult(null);
      setSubmitError(null);
      setStartError(null);
      setTimeLeft(null);
      setEndTime(null);
      router.push("/quizzes");
    }
  }, [router]);

  const resetSession = useCallback(() => {
    setActiveQuiz(null);
    setAssignmentId(null);
    setCurrentIndex(0);
    setAnswers({});
    setCheckedIds([]);
    setResult(null);
    setSubmitError(null);
    setStartError(null);
    setTimeLeft(null);
    setEndTime(null);
  }, []);

  // Background timer ticking
  useEffect(() => {
    if (endTime === null) {
      setTimeLeft(null);
      return;
    }

    const checkTime = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        submitQuiz(true); // isAutoSubmit = true
      }
    };

    checkTime(); // run once immediately
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [endTime, submitQuiz]);

  return (
    <QuizSessionContext.Provider
      value={{
        activeQuiz,
        assignmentId,
        currentIndex,
        answers,
        checkedIds,
        result,
        timeLeft,
        endTime,
        isStarting,
        isSubmitting,
        startError,
        submitError,
        startQuiz,
        answerQuestion,
        checkAnswer,
        cancelQuiz,
        submitQuiz,
        resetSession,
        setCurrentIndex,
        setResult,
      }}
    >
      {children}
    </QuizSessionContext.Provider>
  );
}
