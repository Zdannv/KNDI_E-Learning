"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientApiError, quizApi } from "@/app/lib/use-api";

import { FormQuestion, QuizFormState, QuestionType, MultipleChoiceQuestion, MultipleChoiceOption, MatchingContent, EMPTY_FORM, generateId } from "@/types/quiz-type";
import { toBackendQuestions, toUpdatePayload, toFrontendQuestions } from "@/services/quizConverter";
import { validateQuizForm } from "@/services/quizValidators";

export interface UseQuizFormReturn {
  formState: QuizFormState;
  existingQuestionIds: Record<string, number>;
  isLoadingQuiz: boolean;
  isSubmitting: boolean;
  toastSuccess: boolean;
  errorMsg: string | null;
  setFormState: React.Dispatch<React.SetStateAction<QuizFormState>>;

  addQuestion: () => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<FormQuestion>) => void;
  switchType: (id: string, newType: QuestionType) => void;

  updateOption: (
    questionId: string,
    index: number,
    field: keyof MultipleChoiceOption,
    value: string | undefined
  ) => void;

  addPair: (questionId: string) => void;
  removePair: (questionId: string, pairId: string) => void;
  updatePair: (
    questionId: string,
    pairId: string,
    side: "leftContent" | "rightContent",
    field: keyof MatchingContent,
    value: string | undefined
  ) => void;

  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => void;

  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useQuizForm(editId: string | null): UseQuizFormReturn {
  const router = useRouter();

  const [formState, setFormState] = useState<QuizFormState>(EMPTY_FORM);
  const [existingQuestionIds, setExistingQuestionIds] = useState<Record<string, number>>({});
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const numericId = parseInt(editId, 10);
    if (isNaN(numericId)) return;

    setIsLoadingQuiz(true);
    quizApi
      .getById(numericId)
      .then((backendQuiz) => {
        const frontendQuestions = toFrontendQuestions(backendQuiz.question ?? []);

        const idMap: Record<string, number> = {};
        (backendQuiz.question ?? []).forEach((bq) => {
          idMap[String(bq.id)] = bq.id;
        });

        setFormState({
          title: backendQuiz.title,
          description: backendQuiz.description ?? "",
          isPublished: backendQuiz.is_published,
          duration: backendQuiz.duration ?? 0,
          questions: frontendQuestions,
        });
        setExistingQuestionIds(idMap);
      })
      .catch((err) => {
        setErrorMsg(
          err instanceof ClientApiError ? err.message : "Gagal memuat kuis."
        );
      })
      .finally(() => setIsLoadingQuiz(false));
  }, [editId]);

  const addQuestion = () => {
    const newQ: MultipleChoiceQuestion = {
      type:               "multiple_choice",
      id: generateId(),
      questionText: "",
      weight: 1,
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex: 0,
    };
    setFormState((p) => ({ ...p, questions: [...p.questions, newQ] }));
    setErrorMsg(null);
  };

  const removeQuestion = (id: string) => {
    setFormState((p) => ({ ...p, questions: p.questions.filter((q) => q.id !== id) }));
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) =>
        q.id === id ? ({ ...q, ...updates } as FormQuestion) : q
      ),
    }));
  };

  const switchType = (id: string, newType: QuestionType) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q): FormQuestion => {
        if (q.id !== id || q.type === newType) return q;
        const base = { id: q.id, questionText: q.questionText, weight: q.weight, imageUrl: q.imageUrl, audioUrl: q.audioUrl };

        if (newType === "multiple_choice") {
          return {
            ...base,
            type: "multiple_choice",
            options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
            correctOptionIndex: 0,
          };
        }
        if (newType === "matching") {
          return {
            ...base,
            type: "matching",
            pairs: [
              { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
              { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
            ],
          };
        }
        // ── NEW ──────────────────────────────────────────────────────────────
        if (newType === "essay") {
          return { ...base, type: "essay" };
        }
        // ────────────────────────────────────────────────────────────────────
        return { ...base, type: "short_answer", correctAnswerText: "" };
      }),
    }));
  };

  const updateOption = (
    questionId: string,
    index: number,
    field: keyof MultipleChoiceOption,
    value: string | undefined
  ) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) => {
        if (q.id !== questionId || q.type !== "multiple_choice") return q;
        const opts = [...q.options] as [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption];
        if (value === undefined) {
          const { [field]: _, ...rest } = opts[index];
          opts[index] = rest as MultipleChoiceOption;
        } else {
          opts[index] = { ...opts[index], [field]: value };
        }
        return { ...q, options: opts };
      }),
    }));
  };

  const addPair = (questionId: string) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) => {
        if (q.id !== questionId || q.type !== "matching" || q.pairs.length >= 5) return q;
        return {
          ...q,
          pairs: [...q.pairs, { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } }],
        };
      }),
    }));
  };

  const removePair = (questionId: string, pairId: string) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) => {
        if (q.id !== questionId || q.type !== "matching") return q;
        return { ...q, pairs: q.pairs.filter((pair) => pair.id !== pairId) };
      }),
    }));
  };

  const updatePair = (
    questionId: string,
    pairId: string,
    side: "leftContent" | "rightContent",
    field: keyof MatchingContent,
    value: string | undefined
  ) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) => {
        if (q.id !== questionId || q.type !== "matching") return q;
        const pairs = q.pairs.map((pair) => {
          if (pair.id !== pairId) return pair;
          const updated = { ...pair[side] };
          if (value === undefined) delete (updated as Record<string, unknown>)[field];
          else (updated as Record<string, unknown>)[field] = value;
          return { ...pair, [side]: updated };
        });
        return { ...q, pairs };
      }),
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran file media maksimal adalah 2MB.");
      e.target.value = "";
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateQuizForm(formState);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editId) {
        const numericId = parseInt(editId, 10);

        await quizApi.update(numericId, {
          title:        formState.title,
          description:  formState.description || undefined,
          is_published: formState.isPublished,
          duration:     formState.duration === "" ? 0 : formState.duration,
        });

        const currentIds = new Set(formState.questions.map((q) => q.id));
        const deletedIds  = Object.keys(existingQuestionIds).filter((fId) => !currentIds.has(fId));
        await Promise.all(deletedIds.map((fId) => quizApi.deleteQuestion(existingQuestionIds[fId])));

        const existingQuestions = formState.questions.filter((q) => q.id in existingQuestionIds);
        await Promise.all(
          existingQuestions.map((q, i) =>
            quizApi.updateQuestion(existingQuestionIds[q.id], toUpdatePayload(q, i))
          )
        );

        const newQuestions = formState.questions.filter((q) => !(q.id in existingQuestionIds));
        if (newQuestions.length > 0) {
          await quizApi.addQuestions(numericId, toBackendQuestions(newQuestions));
        }
      } else {
        const created = await quizApi.create({
          title:       formState.title,
          description: formState.description || undefined,
          duration:    formState.duration === "" ? 0 : formState.duration,
        });

        if (formState.questions.length > 0) {
          await quizApi.addQuestions(created.id, toBackendQuestions(formState.questions));
        }

        if (formState.isPublished) {
          await quizApi.update(created.id, {
            title:        formState.title,
            description:  formState.description || undefined,
            is_published: true,
            duration:     formState.duration === "" ? 0 : formState.duration,
          });
        }
      }

      setToastSuccess(true);
      setTimeout(() => {
        setToastSuccess(false);
        router.push("/admin/quizzes");
      }, 1500);
    } catch (err) {
      setErrorMsg(
        err instanceof ClientApiError ? err.message : "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    existingQuestionIds,
    isLoadingQuiz,
    isSubmitting,
    toastSuccess,
    errorMsg,
    setFormState,
    addQuestion,
    removeQuestion,
    updateQuestion,
    switchType,
    updateOption,
    addPair,
    removePair,
    updatePair,
    handleFileUpload,
    handleSubmit,
  };
}