"use client"

import { ClientApiError, EssayPendingItem, Quiz, assignmentApi, quizApi } from "@/app/lib/use-api";
import { useAsync } from "@/hooks/useAsync";
import {
  AlertCircle, ArrowUpDown, Award, BookOpen, Calendar, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, ClipboardList, Edit2, Eye, EyeOff, Loader2, Plus,
  RefreshCw, Search, Trash2, User, X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-52">
      <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-full mb-1" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center px-6 py-5 gap-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-40" />
            <div className="h-3 bg-slate-200 rounded w-56" />
          </div>
          <div className="h-7 bg-slate-200 rounded w-20" />
          <div className="h-8 bg-slate-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeightLabel(maxPoint: number): string {
  if (maxPoint >= 3) return "Tinggi";
  if (maxPoint >= 2) return "Sedang";
  return "Rendah";
}

function getWeightColor(maxPoint: number): string {
  if (maxPoint >= 3) return "bg-pink-100 text-pink-700";
  if (maxPoint >= 2) return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

export default function AdminQuizzesPage() {
  const [activeTab, setActiveTab] = useState<"kuis" | "penilaian">("kuis");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQuizzes = useCallback(() => quizApi.listAll(), []);
  const {
    data: quizzes,
    isLoading: quizzesLoading,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useAsync<Quiz[]>(fetchQuizzes);

  const filteredQuizzes = (quizzes ?? []).filter((quiz) => {
    const q = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(q) ||
      (quiz.description ?? "").toLowerCase().includes(q)
    );
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortBy === "latest" ? -diff : diff;
  });

  const totalPages = Math.max(1, Math.ceil(sortedQuizzes.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuizzes = sortedQuizzes.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
  const handleSort = (v: "latest" | "oldest") => { setSortBy(v); setCurrentPage(1); };

  const fetchEssays = useCallback(() => assignmentApi.getPendingEssays(), []);
  const {
    data: pendingEssays,
    isLoading: essaysLoading,
    error: essaysError,
    refetch: refetchEssays,
  } = useAsync<EssayPendingItem[]>(fetchEssays);

  const [selectedEssay, setSelectedEssay] = useState<EssayPendingItem | null>(null);
  const [grade,         setGrade]         = useState("");
  const [feedback,      setFeedback]      = useState("");
  const [isGrading,     setIsGrading]     = useState(false);
  const [gradeError,    setGradeError]    = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      await quizApi.update(quiz.id, {
        title:        quiz.title,
        description:  quiz.description ?? undefined,
        is_published: !quiz.is_published,
        duration:     quiz.duration,
      });
      showToast(
        quiz.is_published
          ? `Quiz "${quiz.title}" dijadikan Draft`
          : `Quiz "${quiz.title}" dipublikasikan`
      );
      refetchQuizzes();
    } catch (err) {
      showToast(err instanceof ClientApiError ? err.message : "Gagal mengubah status kuis");
    }
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kuis "${quiz.title}"?`)) return;
    try {
      await quizApi.delete(quiz.id);
      showToast("Kuis berhasil dihapus!");
      refetchQuizzes();
    } catch (err) {
      showToast(err instanceof ClientApiError ? err.message : "Gagal menghapus kuis");
    }
  };

  const handleOpenGrading = (essay: EssayPendingItem) => {
    setSelectedEssay(essay);
    setGrade("");
    setFeedback("");
    setGradeError(null);
  };

  const handleCloseModal = () => {
    if (isGrading) return;
    setSelectedEssay(null);
    setGrade("");
    setFeedback("");
    setGradeError(null);
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEssay) return;

    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      setGradeError("Nilai harus antara 0 sampai 100.");
      return;
    }

    setIsGrading(true);
    setGradeError(null);

    try {
      await assignmentApi.gradeEssay(
        selectedEssay.assignment_id,
        selectedEssay.assignment_history_id,
        gradeNum
      );
      showToast("Nilai berhasil disimpan!");
      handleCloseModal();
      refetchEssays();
    } catch (err) {
      setGradeError(
        err instanceof ClientApiError ? err.message : "Gagal menyimpan nilai. Coba lagi."
      );
    } finally {
      setIsGrading(false);
    }
  };

  const pendingCount = pendingEssays?.length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Kuis</h1>
          <p className="text-slate-600">
            Kelola bank soal, atur kuis untuk siswa, dan nilai jawaban esai.
          </p>
        </div>
        {activeTab === "kuis" && (
          <Link
            href="/admin/quizzes/create"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Kuis Baru</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("kuis")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "kuis" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Daftar Kuis</span>
          </div>
          {activeTab === "kuis" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("penilaian")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "penilaian" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Penilaian Manual</span>
            {!essaysLoading && pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          {activeTab === "penilaian" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* ── Tab: Daftar Kuis ── */}
      {activeTab === "kuis" && (
        <>
          {quizzesError && (
            <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{quizzesError}</p>
              </div>
              <button
                onClick={refetchQuizzes}
                className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}

          {quizzesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {!quizzesLoading && !quizzesError && quizzes && (
            <>
              {quizzes.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                  {/* Search */}
                  <div className="grow flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white focus-within:border-indigo-400 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari kuis berdasarkan judul atau deskripsi..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                      <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value as "latest" | "oldest")}
                        className="bg-transparent border-none outline-none text-sm text-slate-700 font-medium cursor-pointer"
                      >
                        <option value="latest">Tanggal Dibuat: Terbaru</option>
                        <option value="oldest">Tanggal Dibuat: Terlama</option>
                      </select>
                    </div>

                    {/* Count */}
                    <div className="text-sm text-slate-500 font-medium self-center px-1">
                      Total: <span className="font-bold text-slate-800">{sortedQuizzes.length}</span> kuis
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {sortedQuizzes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-full mb-5">
                    <ClipboardList className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchQuery ? "Kuis Tidak Ditemukan" : "Belum Ada Kuis"}
                  </h3>
                  <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
                    {searchQuery
                      ? "Tidak ditemukan kuis yang sesuai dengan kata kunci Anda. Silakan coba kata kunci lain."
                      : "Belum ada kuis yang dibuat. Mulai dengan membuat kuis pertama Anda."}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/admin/quizzes/create"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <span>Klik di sini untuk membuat kuis pertama Anda</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col relative h-full"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                            <ClipboardList className="w-6 h-6" />
                          </div>
                          <div className="flex items-center space-x-2">
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
                            <Link
                              href={`/admin/quizzes/create?edit=${quiz.id}`}
                              className="p-2 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
                              title="Edit Kuis"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(quiz)}
                              className="p-2 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-100"
                              title="Hapus Kuis"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{quiz.title}</h3>
                        <p className="text-slate-500 text-sm mb-5 line-clamp-2 grow">
                          {quiz.description ?? "Tidak ada deskripsi."}
                        </p>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-md">
                              <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                              <span>{quiz.question?.length ?? 0} Soal</span>
                            </div>
                            {quiz.duration && quiz.duration > 0 ? (
                              <div className="flex items-center bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md">
                                <Clock className="w-4 h-4 mr-1.5 text-indigo-500" />
                                <span>{quiz.duration}m</span>
                              </div>
                            ) : (
                              <div className="flex items-center bg-slate-50 text-slate-400 px-3 py-1.5 rounded-md" title="Tanpa batasan waktu">
                                <Clock className="w-4 h-4 mr-1.5 text-slate-300" />
                                <span>—</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">ID #{quiz.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={safePage === 1}
                        className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Sebelumnya
                      </button>

                      {/* Page numbers — desktop */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                              safePage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Mobile label */}
                      <span className="sm:hidden text-sm font-semibold text-slate-500">
                        Halaman {safePage} dari {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={safePage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── Tab: Penilaian Manual ── */}
      {activeTab === "penilaian" && (
        <>
          {essaysError && (
            <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{essaysError}</p>
              </div>
              <button
                onClick={refetchEssays}
                className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}

          {essaysLoading && <TableSkeleton />}

          {!essaysLoading && !essaysError && pendingCount === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Semua Sudah Dinilai!</h3>
              <p className="text-slate-600">Tidak ada jawaban esai yang menunggu penilaian saat ini.</p>
            </div>
          )}

          {!essaysLoading && !essaysError && pendingCount > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Siswa</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kuis</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Bobot</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Pertanyaan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(pendingEssays ?? []).map((essay) => (
                      <tr key={essay.assignment_history_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3 shrink-0">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-slate-800">{essay.student_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 line-clamp-1">{essay.quiz_title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getWeightColor(essay.max_point)}`}>
                            {essay.max_point} — {getWeightLabel(essay.max_point)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{essay.question_text}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenGrading(essay)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors active:scale-95 text-sm"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Beri Nilai
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Grading Modal ── */}
      {selectedEssay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Penilaian Jawaban Esai</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedEssay.student_name} • {selectedEssay.quiz_title}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isGrading}
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-6 space-y-6">

              {/* Question */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Pertanyaan Esai
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedEssay.question_text}</p>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getWeightColor(selectedEssay.max_point)}`}>
                    Bobot: {selectedEssay.max_point} — {getWeightLabel(selectedEssay.max_point)}
                  </span>
                </div>
              </div>

              {/* Student answer */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Jawaban Siswa
                </label>
                <div className="bg-white border-2 border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEssay.student_answer || <span className="text-slate-400 italic">Tidak ada jawaban.</span>}
                  </p>
                </div>
              </div>

              {/* Grade input */}
              <div>
                <label htmlFor="grade" className="block text-sm font-bold text-slate-700 mb-2">
                  Nilai (0 - 100)
                </label>
                <input
                  type="number"
                  id="grade"
                  min={0}
                  max={100}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={isGrading}
                  required
                  placeholder="Contoh: 85"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-lg font-semibold disabled:opacity-60"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Nilai ini merepresentasikan persentase ketepatan (0–100%). Nilai akan dikalikan dengan bobot soal dalam perhitungan akhir.
                </p>
              </div>

              {/* Error */}
              {gradeError && (
                <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{gradeError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isGrading}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGrading}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isGrading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Menyimpan...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5 mr-2" />Simpan Nilai</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-60 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}