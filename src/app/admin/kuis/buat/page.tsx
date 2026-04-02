"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import { QuestionType, QuestionBase, MultipleChoiceQuestion, ShortAnswerQuestion, Question, QuizData, fallbackMockQuizzes } from "@/data/dummyKuis";

interface QuizFormState {
  title: string;
  questions: Question[];
}

function BuatKuisForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formState, setFormState] = useState<QuizFormState>({
    title: "",
    questions: []
  });

  const [storedQuizzes, setStoredQuizzes, isClient] = useLocalStorage<QuizData[]>("kndi_quizzes_v2", fallbackMockQuizzes);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hydrate form if edit parameter exists
  useEffect(() => {
    if (isClient && editId && storedQuizzes.length > 0) {
      const existingQuiz = storedQuizzes.find((q) => q.id === editId);
      if (existingQuiz) {
        setFormState({
          title: existingQuiz.title,
          questions: existingQuiz.questions,
        });
      }
    }
  }, [editId, isClient, storedQuizzes]);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleAddQuestion = () => {
    const newQuestion: MultipleChoiceQuestion = {
      id: generateId(),
      type: "multiple_choice",
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
    };
    
    setFormState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setErrorMsg(null);
  };

  const handleRemoveQuestion = (id: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleQuestionChange = (id: string, updates: Partial<Question>) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id) {
          return { ...q, ...updates } as Question;
        }
        return q;
      })
    }));
  };

  const handleTypeSwitch = (id: string, newType: QuestionType) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id && q.type !== newType) {
          if (newType === "multiple_choice") {
            return {
              id: q.id,
              type: "multiple_choice",
              questionText: q.questionText,
              options: ["", "", "", ""],
              correctOptionIndex: 0
            };
          } else {
            return {
              id: q.id,
              type: "short_answer",
              questionText: q.questionText,
              correctAnswerText: ""
            };
          }
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === "multiple_choice") {
          const newOptions = [...q.options] as [string, string, string, string];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const validateForm = (): boolean => {
    if (formState.title.trim() === "") {
      setErrorMsg("Judul kuis tidak boleh kosong.");
      return false;
    }
    if (formState.questions.length === 0) {
      setErrorMsg("Kuis harus memiliki minimal 1 soal.");
      return false;
    }

    for (let i = 0; i < formState.questions.length; i++) {
      const q = formState.questions[i];
      if (q.questionText.trim() === "") {
        setErrorMsg(`Teks pertanyaan pada soal #${i + 1} tidak boleh kosong.`);
        return false;
      }
      
      if (q.type === "multiple_choice") {
        if (q.options.some(opt => opt.trim() === "")) {
          setErrorMsg(`Pilihan ganda pada soal #${i + 1} tidak boleh ada opsi yang kosong.`);
          return false;
        }
      } else if (q.type === "short_answer") {
        if (q.correctAnswerText.trim() === "") {
          setErrorMsg(`Kunci jawaban isian singkat pada soal #${i + 1} tidak boleh kosong.`);
          return false;
        }
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      if (editId) {
        setStoredQuizzes(prev => prev.map(q => {
          if (q.id === editId) {
            return {
              ...q,
              title: formState.title,
              questions: formState.questions
            };
          }
          return q;
        }));
      } else {
        const newQuiz: QuizData = {
          id: "quiz-" + Date.now().toString(),
          title: formState.title,
          description: "Kuis bahasa Jepang dasar.", 
          questions: formState.questions
        };
        setStoredQuizzes(prev => [newQuiz, ...prev]);
        setFormState({ title: "", questions: [] });
      }

      setIsSubmitting(false);
      setToastSuccess(true);
      setTimeout(() => setToastSuccess(false), 4000);
      
    }, 1500);
  };

  if (!isClient) {
    return <div className="p-6 max-w-4xl mx-auto min-h-screen" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
            Judul Kuis
          </label>
          <input
            type="text"
            id="title"
            value={formState.title}
            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Contoh: Kuis Pemahaman Hiragana Dasar"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {formState.questions.length > 0 && (
          <div className="space-y-6">
            {formState.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:border-blue-200">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-slate-800 bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
                    Soal #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Teks Pertanyaan</label>
                    <textarea
                      rows={3}
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(q.id, { questionText: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                      placeholder="Masukkan pertanyaan di sini..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tipe Soal</label>
                    <div className="relative">
                      <select
                        value={q.type}
                        onChange={(e) => handleTypeSwitch(q.id, e.target.value as QuestionType)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="multiple_choice">Pilihan Ganda</option>
                        <option value="short_answer">Isian Singkat</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Rendering Options */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  {q.type === "multiple_choice" ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Pilihan Ganda (Tandai yang benar)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all 
                              ${q.correctOptionIndex === optIndex ? 'border-blue-500 bg-white ring-1 ring-blue-500 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <input
                              type="radio"
                              name={`correct-opt-${q.id}`}
                              checked={q.correctOptionIndex === optIndex}
                              onChange={() => handleQuestionChange(q.id, { correctOptionIndex: optIndex })}
                              disabled={isSubmitting}
                              className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1 font-semibold text-slate-600 shrink-0 select-none pb-0.5 w-6 uppercase">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                              disabled={isSubmitting}
                              placeholder={`Opsi ${String.fromCharCode(65 + optIndex)}...`}
                              className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Kunci Jawaban</label>
                      <input
                        type="text"
                        value={q.correctAnswerText}
                        onChange={(e) => handleQuestionChange(q.id, { correctAnswerText: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                        placeholder="Ketik jawaban yang tepat di sini..."
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Global Error */}
        {errorMsg && (
          <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl transition-all shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex flex-row justify-center items-center px-5 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 font-semibold rounded-lg transition-all border border-blue-100 hover:border-blue-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>Tambah Soal</span>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto flex flex-row justify-center items-center px-8 py-3 text-white font-semibold rounded-lg transition-all shadow-sm
              ${isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                <span>{editId ? "Perbarui Kuis" : "Simpan Kuis"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Toast */}
      {toastSuccess && (
        <div className="fixed bottom-8 right-8 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
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

export default function BuatKuisPage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-4xl mx-auto h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <BuatKuisForm />
    </Suspense>
  );
}
