"use client";

import React, { FormEvent, Suspense, useEffect, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Music,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ClientApiError,
  CreateQuestionPayload,
  Question as BackendQuestion,
  quizApi,
} from "@/app/lib/use-api";

// ─── Local type definitions (no dummyKuis dependency) ─────────────────────────

type QuestionType = "multiple_choice" | "short_answer" | "matching";

interface MediaFields {
  imageUrl?: string;
  audioUrl?: string;
}

interface MultipleChoiceOption extends MediaFields {
  text: string;
}

interface QuestionBase extends MediaFields {
  id: string;
  type: QuestionType;
  questionText: string;
}

interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption];
  correctOptionIndex: number;
}

interface ShortAnswerQuestion extends QuestionBase {
  type: "short_answer";
  correctAnswerText: string;
}

interface MatchingContent extends MediaFields {
  text: string;
}

interface MatchingPair {
  id: string;
  leftContent: MatchingContent;
  rightContent: MatchingContent;
}

interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: MatchingPair[];
}

type Question = MultipleChoiceQuestion | ShortAnswerQuestion | MatchingQuestion;

// ─── Form state ───────────────────────────────────────────────────────────────

interface QuizFormState {
  title: string;
  description: string;
  isPublished: boolean;
  questions: Question[];
}

const EMPTY_FORM: QuizFormState = {
  title: "",
  description: "",
  isPublished: false,
  questions: [],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 9);

/** Only include media string if it's a non-empty value */
function mediaOrUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

// ─── Type converters ──────────────────────────────────────────────────────────

/**
 * Frontend Question[] → CreateQuestionPayload[] for the API.
 * Uses separate image_url and audio_url fields.
 */
function toBackendQuestions(questions: Question[]): CreateQuestionPayload[] {
  return questions.map((q, index): CreateQuestionPayload => {
    const base = {
      question_text: q.questionText,
      image_url:     mediaOrUndefined(q.imageUrl),
      audio_url:     mediaOrUndefined(q.audioUrl),
      point:         1,
      order_number:  index + 1,
    };

    switch (q.type) {
      case "multiple_choice":
        return {
          ...base,
          question_type: 1,
          options: q.options.map((o, i) => ({
            option_text: o.text,
            image_url:   mediaOrUndefined(o.imageUrl),
            audio_url:   mediaOrUndefined(o.audioUrl),
            is_correct:  i === q.correctOptionIndex,
          })),
        };

      case "short_answer":
        return {
          ...base,
          question_type:  2,
          correct_answer: q.correctAnswerText,
        };

      case "matching":
        return {
          ...base,
          question_type:  3,
          matching_cards: q.pairs.map((p) => ({
            left_text:        p.leftContent.text,
            left_image_url:   mediaOrUndefined(p.leftContent.imageUrl),
            left_audio_url:   mediaOrUndefined(p.leftContent.audioUrl),
            right_text:       p.rightContent.text,
            right_image_url:  mediaOrUndefined(p.rightContent.imageUrl),
            right_audio_url:  mediaOrUndefined(p.rightContent.audioUrl),
          })),
        };
    }
  });
}

/**
 * Backend Question[] → frontend Question[] for the edit form.
 * Reads image_url and audio_url separately.
 */
function toFrontendQuestions(backendQuestions: BackendQuestion[]): Question[] {
  return backendQuestions.map((bq): Question => {
    const id = String(bq.id);

    if (bq.question_type === 1) {
      const options = (bq.question_options ?? []).map((o) => ({
        text:     o.option_text,
        imageUrl: o.image_url ?? undefined,
        audioUrl: o.audio_url ?? undefined,
      }));
      while (options.length < 4) options.push({ text: "", imageUrl: undefined, audioUrl: undefined });

      const correctIdx = (bq.question_options ?? []).findIndex((o) => o.is_correct);

      return {
        id,
        type:               "multiple_choice",
        questionText:       bq.question_text,
        imageUrl:           bq.image_url ?? undefined,
        audioUrl:           bq.audio_url ?? undefined,
        options:            options as [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption],
        correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
      };
    }

    if (bq.question_type === 2) {
      return {
        id,
        type:              "short_answer",
        questionText:      bq.question_text,
        imageUrl:          bq.image_url ?? undefined,
        audioUrl:          bq.audio_url ?? undefined,
        correctAnswerText: bq.correct_answer ?? "",
      };
    }

    // Matching card
    const pairs: MatchingPair[] = (bq.matching_card ?? []).map((c) => ({
      id:           String(c.id),
      leftContent:  {
        text:     c.left_text,
        imageUrl: c.left_image_url  ?? undefined,
        audioUrl: c.left_audio_url  ?? undefined,
      },
      rightContent: {
        text:     c.right_text,
        imageUrl: c.right_image_url ?? undefined,
        audioUrl: c.right_audio_url ?? undefined,
      },
    }));

    return {
      id,
      type:         "matching",
      questionText: bq.question_text,
      imageUrl:     bq.image_url ?? undefined,
      audioUrl:     bq.audio_url ?? undefined,
      pairs: pairs.length > 0 ? pairs : [
        { id: "tmp1", leftContent: { text: "" }, rightContent: { text: "" } },
        { id: "tmp2", leftContent: { text: "" }, rightContent: { text: "" } },
      ],
    };
  });
}

// ─── Inner form ───────────────────────────────────────────────────────────────

function BuatKuisForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get("edit");

  const [formState,           setFormState]           = useState<QuizFormState>(EMPTY_FORM);
  const [existingQuestionIds, setExistingQuestionIds] = useState<Record<string, number>>({});
  const [isLoadingQuiz,       setIsLoadingQuiz]       = useState(false);
  const [isSubmitting,        setIsSubmitting]         = useState(false);
  const [toastSuccess,        setToastSuccess]         = useState(false);
  const [errorMsg,            setErrorMsg]             = useState<string | null>(null);

  // ── Load quiz when editing ────────────────────────────────────────────────────
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
          title:       backendQuiz.title,
          description: backendQuiz.description ?? "",
          isPublished: backendQuiz.is_published,
          questions:   frontendQuestions,
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

  // ── Question state helpers ────────────────────────────────────────────────────

  const addQuestion = () => {
    const newQ: MultipleChoiceQuestion = {
      id:                 generateId(),
      type:               "multiple_choice",
      questionText:       "",
      options:            [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex: 0,
    };
    setFormState((p) => ({ ...p, questions: [...p.questions, newQ] }));
    setErrorMsg(null);
  };

  const removeQuestion = (id: string) => {
    setFormState((p) => ({ ...p, questions: p.questions.filter((q) => q.id !== id) }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) =>
        q.id === id ? ({ ...q, ...updates } as Question) : q
      ),
    }));
  };

  const switchType = (id: string, newType: QuestionType) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q): Question => {
        if (q.id !== id || q.type === newType) return q;
        const base = { id: q.id, questionText: q.questionText, imageUrl: q.imageUrl, audioUrl: q.audioUrl };

        if (newType === "multiple_choice") {
          return { ...base, type: "multiple_choice", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], correctOptionIndex: 0 };
        }
        if (newType === "matching") {
          return { ...base, type: "matching", pairs: [
            { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
            { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
          ]};
        }
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

  const addPair = (questionId: string) => {
    setFormState((p) => ({
      ...p,
      questions: p.questions.map((q) => {
        if (q.id !== questionId || q.type !== "matching" || q.pairs.length >= 5) return q;
        return { ...q, pairs: [...q.pairs, { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } }] };
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

  // ── File upload (base64 for image/audio in questions) ─────────────────────────
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

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!formState.title.trim()) {
      setErrorMsg("Judul kuis tidak boleh kosong."); return false;
    }
    if (formState.questions.length === 0) {
      setErrorMsg("Kuis harus memiliki minimal 1 soal."); return false;
    }
    for (let i = 0; i < formState.questions.length; i++) {
      const q = formState.questions[i];
      if (!q.questionText.trim()) {
        setErrorMsg(`Teks pertanyaan soal #${i + 1} tidak boleh kosong.`); return false;
      }
      if (q.type === "multiple_choice") {
        if (q.options.some((o) => !o.text.trim())) {
          setErrorMsg(`Semua opsi soal #${i + 1} harus diisi.`); return false;
        }
      } else if (q.type === "short_answer") {
        if (!q.correctAnswerText.trim()) {
          setErrorMsg(`Kunci jawaban soal #${i + 1} tidak boleh kosong.`); return false;
        }
      } else if (q.type === "matching") {
        if (q.pairs.length < 1) {
          setErrorMsg(`Soal menjodohkan #${i + 1} harus punya minimal 1 pasangan.`); return false;
        }
        for (const pair of q.pairs) {
          if (!pair.leftContent.text.trim() || !pair.rightContent.text.trim()) {
            setErrorMsg(`Semua pasangan soal menjodohkan #${i + 1} harus terisi.`); return false;
          }
        }
      }
    }
    setErrorMsg(null);
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editId) {
        const numericId = parseInt(editId, 10);

        // 1. Update quiz metadata
        await quizApi.update(numericId, {
          title:        formState.title,
          description:  formState.description || undefined,
          is_published: formState.isPublished,
        });

        // 2. Delete removed questions
        const currentIds = new Set(formState.questions.map((q) => q.id));
        const deletedIds  = Object.keys(existingQuestionIds).filter((fId) => !currentIds.has(fId));
        await Promise.all(deletedIds.map((fId) => quizApi.deleteQuestion(existingQuestionIds[fId])));

        // 3. Add new questions (those not in existingQuestionIds)
        const newQuestions = formState.questions.filter((q) => !(q.id in existingQuestionIds));
        if (newQuestions.length > 0) {
          await quizApi.addQuestions(numericId, toBackendQuestions(newQuestions));
        }
      } else {
        // 1. Create quiz shell
        const created = await quizApi.create({
          title:       formState.title,
          description: formState.description || undefined,
        });

        // 2. Add all questions
        if (formState.questions.length > 0) {
          await quizApi.addQuestions(created.id, toBackendQuestions(formState.questions));
        }

        // 3. Publish if toggled on
        if (formState.isPublished) {
          await quizApi.update(created.id, {
            title:        formState.title,
            description:  formState.description || undefined,
            is_published: true,
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

  // ── Render ────────────────────────────────────────────────────────────────────

  if (isLoadingQuiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {editId ? "Editor Kuis" : "Buat Kuis Baru"}
        </h1>
        <p className="text-slate-600">
          {editId
            ? "Perbarui struktur soal dan kunci jawaban dari kuis ini."
            : "Buatlah kuis bahasa Jepang interaktif untuk menguji pemahaman pengguna."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Quiz metadata card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
              Judul Kuis <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formState.title}
              onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Kuis Pemahaman Hiragana Dasar"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="desc" className="block text-sm font-semibold text-slate-700">
              Deskripsi <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              id="desc"
              rows={2}
              value={formState.description}
              onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi singkat tentang kuis ini..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none disabled:opacity-60"
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Status Publikasi</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Kuis yang dipublikasikan dapat dikerjakan oleh siswa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormState((p) => ({ ...p, isPublished: !p.isPublished }))}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 ${
                formState.isPublished
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {formState.isPublished
                ? <><Eye className="w-4 h-4" /> Published</>
                : <><EyeOff className="w-4 h-4" /> Draft</>}
            </button>
          </div>
        </div>

        {/* ── Questions ── */}
        {formState.questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-200 transition-colors"
          >
            {/* Question header row */}
            <div className="flex justify-between items-start mb-6">
              <span className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                Soal #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

              {/* Question text + media toggles */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Teks Pertanyaan
                  </label>
                  <div className="flex space-x-2">
                    {/* Image toggle for question */}
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, { imageUrl: q.imageUrl !== undefined ? undefined : "" })}
                      className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                        q.imageUrl !== undefined ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                      {q.imageUrl !== undefined ? "Hapus Gambar" : "Gambar"}
                    </button>
                    {/* Audio toggle for question */}
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, { audioUrl: q.audioUrl !== undefined ? undefined : "" })}
                      className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                        q.audioUrl !== undefined ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Music className="w-3.5 h-3.5 mr-1.5" />
                      {q.audioUrl !== undefined ? "Hapus Audio" : "Audio"}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={q.questionText}
                  onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="Masukkan pertanyaan di sini..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none disabled:opacity-60"
                />

                {/* Question image upload */}
                {q.imageUrl !== undefined && (
                  <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gambar Pertanyaan (Opsional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (b64) => updateQuestion(q.id, { imageUrl: b64 }))}
                        className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-slate-200" />
                    )}
                  </div>
                )}

                {/* Question audio upload */}
                {q.audioUrl !== undefined && (
                  <div className="flex flex-col space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Pertanyaan (Opsional)</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, (b64) => updateQuestion(q.id, { audioUrl: b64 }))}
                      className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {q.audioUrl && <audio controls src={q.audioUrl} className="h-10 w-full" />}
                  </div>
                )}
              </div>

              {/* Question type selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Tipe Soal</label>
                <div className="relative">
                  <select
                    value={q.type}
                    onChange={(e) => switchType(q.id, e.target.value as QuestionType)}
                    disabled={isSubmitting || q.id in existingQuestionIds}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="matching">Menjodohkan</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {q.id in existingQuestionIds && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    Tipe tidak dapat diubah setelah disimpan.
                  </p>
                )}
              </div>
            </div>

            {/* ── Answer section ── */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">

              {/* Multiple choice */}
              {q.type === "multiple_choice" && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Pilihan Ganda — tandai yang benar
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex flex-col space-y-2">
                        <div
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            q.correctOptionIndex === optIdx
                              ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOptionIndex === optIdx}
                            onChange={() => updateQuestion(q.id, { correctOptionIndex: optIdx })}
                            disabled={isSubmitting}
                            className="w-5 h-5 text-blue-600 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-600 shrink-0 w-6 uppercase">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(q.id, optIdx, "text", e.target.value)}
                            disabled={isSubmitting}
                            placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}...`}
                            className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                          />
                          {/* Image toggle for option */}
                          <button
                            type="button"
                            onClick={() => updateOption(q.id, optIdx, "imageUrl", opt.imageUrl !== undefined ? undefined : "")}
                            className={`p-1.5 rounded-md transition-colors shrink-0 ${
                              opt.imageUrl !== undefined ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            }`}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          {/* Audio toggle for option */}
                          <button
                            type="button"
                            onClick={() => updateOption(q.id, optIdx, "audioUrl", opt.audioUrl !== undefined ? undefined : "")}
                            className={`p-1.5 rounded-md transition-colors shrink-0 ${
                              opt.audioUrl !== undefined ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            }`}
                          >
                            <Music className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Option image upload */}
                        {opt.imageUrl !== undefined && (
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (b64) => updateOption(q.id, optIdx, "imageUrl", b64))}
                              className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                            />
                            {opt.imageUrl && (
                              <img src={opt.imageUrl} alt="Thumb" className="w-8 h-8 object-cover rounded border border-slate-200 shrink-0" />
                            )}
                          </div>
                        )}

                        {/* Option audio upload */}
                        {opt.audioUrl !== undefined && (
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleFileUpload(e, (b64) => updateOption(q.id, optIdx, "audioUrl", b64))}
                              className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                            />
                            {opt.audioUrl && <audio controls src={opt.audioUrl} className="h-8 w-full" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short answer */}
              {q.type === "short_answer" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Kunci Jawaban</label>
                  <input
                    type="text"
                    value={q.correctAnswerText}
                    onChange={(e) => updateQuestion(q.id, { correctAnswerText: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Ketik jawaban yang tepat di sini..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-sm disabled:opacity-60"
                  />
                </div>
              )}

              {/* Matching */}
              {q.type === "matching" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700">
                      Pasangan Jawaban (Maks 5)
                    </label>
                    <button
                      type="button"
                      onClick={() => addPair(q.id)}
                      disabled={isSubmitting || q.pairs.length >= 5}
                      className="flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 border border-blue-100"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pasangan
                    </button>
                  </div>

                  {q.pairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="relative bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm"
                    >
                      {/* Left side */}
                      <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kiri</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => updatePair(q.id, pair.id, "leftContent", "imageUrl", pair.leftContent.imageUrl !== undefined ? undefined : "")}
                              className={`p-1.5 rounded transition-colors ${pair.leftContent.imageUrl !== undefined ? "text-indigo-600 bg-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"}`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePair(q.id, pair.id, "leftContent", "audioUrl", pair.leftContent.audioUrl !== undefined ? undefined : "")}
                              className={`p-1.5 rounded transition-colors ${pair.leftContent.audioUrl !== undefined ? "text-indigo-600 bg-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"}`}
                            >
                              <Music className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={pair.leftContent.text}
                          onChange={(e) => updatePair(q.id, pair.id, "leftContent", "text", e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Teks kiri..."
                          className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 rounded-md px-3 py-2 text-sm"
                        />
                        {pair.leftContent.imageUrl !== undefined && (
                          <div className="flex gap-2">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => updatePair(q.id, pair.id, "leftContent", "imageUrl", b64))}
                              className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                            {pair.leftContent.imageUrl && <img src={pair.leftContent.imageUrl} alt="L" className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200" />}
                          </div>
                        )}
                        {pair.leftContent.audioUrl !== undefined && (
                          <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, (b64) => updatePair(q.id, pair.id, "leftContent", "audioUrl", b64))}
                            className="w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                        )}
                        {pair.leftContent.audioUrl && pair.leftContent.audioUrl.length > 0 && (
                          <audio controls src={pair.leftContent.audioUrl} className="h-8 w-full" />
                        )}
                      </div>

                      {/* Arrow connector */}
                      <div className="shrink-0 flex items-center justify-center p-2 rounded-full bg-indigo-50 text-indigo-500 shadow-sm border border-indigo-100">
                        <ArrowRight className="w-5 h-5 md:rotate-0 rotate-90" />
                      </div>

                      {/* Right side */}
                      <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kanan</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => updatePair(q.id, pair.id, "rightContent", "imageUrl", pair.rightContent.imageUrl !== undefined ? undefined : "")}
                              className={`p-1.5 rounded transition-colors ${pair.rightContent.imageUrl !== undefined ? "text-indigo-600 bg-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"}`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePair(q.id, pair.id, "rightContent", "audioUrl", pair.rightContent.audioUrl !== undefined ? undefined : "")}
                              className={`p-1.5 rounded transition-colors ${pair.rightContent.audioUrl !== undefined ? "text-indigo-600 bg-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"}`}
                            >
                              <Music className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={pair.rightContent.text}
                          onChange={(e) => updatePair(q.id, pair.id, "rightContent", "text", e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Teks kanan..."
                          className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 rounded-md px-3 py-2 text-sm"
                        />
                        {pair.rightContent.imageUrl !== undefined && (
                          <div className="flex gap-2">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (b64) => updatePair(q.id, pair.id, "rightContent", "imageUrl", b64))}
                              className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                            {pair.rightContent.imageUrl && <img src={pair.rightContent.imageUrl} alt="R" className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200" />}
                          </div>
                        )}
                        {pair.rightContent.audioUrl !== undefined && (
                          <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, (b64) => updatePair(q.id, pair.id, "rightContent", "audioUrl", b64))}
                            className="w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                        )}
                        {pair.rightContent.audioUrl && pair.rightContent.audioUrl.length > 0 && (
                          <audio controls src={pair.rightContent.audioUrl} className="h-8 w-full" />
                        )}
                      </div>

                      {/* Delete pair */}
                      <button
                        type="button"
                        onClick={() => removePair(q.id, pair.id)}
                        disabled={isSubmitting || q.pairs.length <= 1}
                        className="absolute -top-3 -right-3 p-2 bg-white border border-red-200 text-red-500 rounded-full hover:bg-red-50 shadow-sm transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Global error */}
        {errorMsg && (
          <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={addQuestion}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 font-semibold rounded-lg transition-all border border-blue-100 disabled:opacity-60"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Soal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg transition-all shadow-sm ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Menyimpan...</span></>
            ) : (
              <><Save className="w-5 h-5 mr-2" /><span>{editId ? "Perbarui Kuis" : "Simpan Kuis"}</span></>
            )}
          </button>
        </div>
      </form>

      {/* Success toast */}
      {toastSuccess && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">
              {editId ? "Kuis berhasil diperbarui!" : "Kuis berhasil disimpan!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function BuatKuisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <BuatKuisForm />
    </Suspense>
  );
}