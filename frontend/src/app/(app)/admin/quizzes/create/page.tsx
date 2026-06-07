"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { useQuizForm } from "@/hooks/useQuizForm";
import QuizMetaCard   from "@/components/QuizMetaCard";
import QuestionCard   from "@/components/QuestionCard";

function CreateQuizForm() {
  const searchParams = useSearchParams();
  const editId       = searchParams.get("edit");

  const {
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
  } = useQuizForm(editId);

  if (isLoadingQuiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-16">
      {/* Page header */}
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
        {/* Quiz title / description / publish */}
        <QuizMetaCard
          formState={formState}
          isSubmitting={isSubmitting}
          onChange={(updates) => setFormState((p) => ({ ...p, ...updates }))}
        />

        {/* Question cards */}
        {formState.questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            isSubmitting={isSubmitting}
            isExisting={q.id in existingQuestionIds}
            onRemove={() => removeQuestion(q.id)}
            onUpdateQuestion={(updates) => updateQuestion(q.id, updates)}
            onSwitchType={(newType) => switchType(q.id, newType)}
            onUpdateOption={(idx, field, value) => updateOption(q.id, idx, field, value)}
            onAddPair={() => addPair(q.id)}
            onRemovePair={(pairId) => removePair(q.id, pairId)}
            onUpdatePair={(pairId, side, field, value) => updatePair(q.id, pairId, side, field, value)}
            onFileUpload={handleFileUpload}
          />
        ))}

        {/* Validation error */}
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

export default function BuatKuisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <CreateQuizForm />
    </Suspense>
  );
}