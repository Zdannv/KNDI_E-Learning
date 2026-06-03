"use client"

import { ClientApiError, Quiz, quizApi } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";
import { AlertCircle, BookOpen, CheckCircle2, ClipboardList, Edit2, Eye, EyeOff, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-52">
      <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-full mb-1" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  )
}

export default function AdminQuizzesPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fetchQuizzes = useCallback(() => quizApi.list(), [])
  const { data: quizzes, isLoading, error, refetch } = useAsync<Quiz[]>(fetchQuizzes)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000);
  }

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      await quizApi.update(quiz.id, {
        title: quiz.title,
        description: quiz.description ?? undefined,
        is_published: !quiz.is_published
      })
      showToast(
        quiz.is_published
          ? `Quiz ${quiz.title} change to publish`
          : `Quiz ${quiz.title} change to un-publish`
      )
      refetch()
    } catch (err) {
      showToast(
        err instanceof ClientApiError ? err.message : `Failed to change quiz status`
      )
    }
  }

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm(`Are you sure want to delete quiz ${quiz.title}`)) {
      try {
        await quizApi.delete(quiz.id)
        showToast("Quiz is deleted")
        refetch()
      } catch (err) {
        showToast(
          err instanceof ClientApiError ? err.message : "Failed to delete quiz"
        )
      }
    }
  }

  return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Quizzes Management</h1>
          <p className="text-slate-600">
            Kelola bank soal, atur kuis untuk siswa, dan tinjau kuis yang tersedia.
          </p>
        </div>
        <Link
          href="/admin/quizzes/create"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </Link>
      </div>
 
      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
 
      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}
 
      {/* Empty */}
      {!isLoading && !error && (!quizzes || quizzes.length === 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-full mb-5">
            <ClipboardList className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Empty</h3>
          <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
            No quizzes have been created yet. Start by creating your first quiz.
          </p>
          <Link
            href="/admin/quizzes/create"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            <span>Create Quizzes</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
 
      {/* Quiz grid */}
      {!isLoading && !error && quizzes && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col relative h-full"
            >
              {/* Top row: icon + actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <ClipboardList className="w-6 h-6" />
                </div>
 
                <div className="flex items-center space-x-2">
                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(quiz)}
                    title={quiz.is_published ? "Unpublish kuis" : "Publish kuis"}
                    className={`p-2 rounded-lg transition-colors border text-xs font-bold flex items-center gap-1 ${
                      quiz.is_published
                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {quiz.is_published ? (
                      <><Eye className="w-4 h-4" /><span className="hidden sm:inline">Publish</span></>
                    ) : (
                      <><EyeOff className="w-4 h-4" /><span className="hidden sm:inline">Draft</span></>
                    )}
                  </button>
 
                  {/* Edit — passes real numeric DB id */}
                  <Link
                    href={`/admin/kuis/buat?edit=${quiz.id}`}
                    className="p-2 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
                    title="Edit Kuis"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
 
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(quiz)}
                    className="p-2 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-100"
                    title="Hapus Kuis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
 
              {/* Title & description */}
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              <p className="text-slate-500 text-sm mb-5 line-clamp-2 grow">
                {quiz.description ?? "Tidak ada deskripsi."}
              </p>
 
              {/* Footer: question count */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-md">
                  <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{quiz.question?.length ?? 0} Soal</span>
                </div>
                <span className="text-xs text-slate-400">
                  ID #{quiz.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-60">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}