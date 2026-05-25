"use client";

import Link from "next/link";
import { Plus, ClipboardList, BookOpen, Trash2, Edit2, CheckCircle2, Award, User, Calendar, X, AlertCircle, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";
import { QuizData, fallbackMockQuizzes } from "@/data/dummyKuis";
import { PendingEssaySubmission, mockPendingSubmissions } from "@/data/dummyPenilaian";

export default function AdminKuisPage() {
  const [storedQuizzes, setStoredQuizzes, isClient] = useLocalStorage<QuizData[]>("kndi_quizzes_v2", fallbackMockQuizzes);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"kuis" | "penilaian">("kuis");
  
  // Grading state
  const [submissions, setSubmissions] = useState<PendingEssaySubmission[]>(mockPendingSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingEssaySubmission | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isClient) return <div className="p-6 h-screen w-full" />;

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kuis "${title}"?`)) {
      setStoredQuizzes(prev => prev.filter(q => q.id !== id));
      setToastMessage("Kuis berhasil dihapus!");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleOpenGrading = (submission: PendingEssaySubmission) => {
    setSelectedSubmission(submission);
    setGrade("");
    setFeedback("");
    setErrorMsg(null);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
    setErrorMsg(null);
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gradeNum = parseInt(grade);
    
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      setErrorMsg("Nilai harus antara 0 sampai 100.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission?.id));
      setIsSubmitting(false);
      setToastMessage("Nilai berhasil disimpan!");
      handleCloseModal();
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getWeightLabel = (weight: 1 | 2 | 3) => {
    switch (weight) {
      case 1: return "Rendah";
      case 2: return "Sedang";
      case 3: return "Tinggi";
    }
  };

  const getWeightColor = (weight: 1 | 2 | 3) => {
    switch (weight) {
      case 1: return "bg-blue-100 text-blue-700";
      case 2: return "bg-purple-100 text-purple-700";
      case 3: return "bg-pink-100 text-pink-700";
    }
  };

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
            href="/admin/kuis/buat"
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
            activeTab === "kuis"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
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
            activeTab === "penilaian"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Penilaian Manual</span>
            {submissions.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {submissions.length}
              </span>
            )}
          </div>
          {activeTab === "penilaian" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Tab Content: Daftar Kuis */}
      {activeTab === "kuis" && (
        <>
          {storedQuizzes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-full mb-5">
                <ClipboardList className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Kuis</h3>
              <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
                Sistem belum menemukan kuis apa pun. Anda dapat mulai menambahkan struktur soal, pilihan ganda, atau isian singkat.
              </p>
              
              <Link 
                href="/admin/kuis/buat"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>Klik di sini untuk membuat kuis pertama Anda</span>
                <svg className="w-4 h-4 ml-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storedQuizzes.map((quiz, index) => (
                <div key={quiz.id || index} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col relative h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/kuis/buat?edit=${quiz.id}`}
                        className="p-2 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
                        title="Edit Kuis"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        className="p-2 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-100"
                        title="Hapus Kuis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{quiz.title}</h3>
                  <p className="text-slate-500 text-sm mb-5 line-clamp-2 flex-grow">{quiz.description}</p>
                  
                  <div className="flex items-center text-xs font-semibold text-slate-500 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-md">
                      <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{quiz.questions?.length || 0} Soal Tersedia</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab Content: Penilaian Manual */}
      {activeTab === "penilaian" && (
        <>
          {submissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Semua Sudah Dinilai!</h3>
              <p className="text-slate-600">Tidak ada jawaban esai yang menunggu penilaian saat ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Karyawan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kuis</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Bobot</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tanggal Submit</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-slate-800">{submission.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">{submission.quizTitle}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getWeightColor(submission.questionWeight)}`}>
                            {submission.questionWeight} - {getWeightLabel(submission.questionWeight)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(submission.submittedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenGrading(submission)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
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

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Penilaian Jawaban Esai</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedSubmission.userName} • {selectedSubmission.quizTitle}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Pertanyaan Esai</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-800 leading-relaxed">{selectedSubmission.questionText}</p>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getWeightColor(selectedSubmission.questionWeight)}`}>
                    Bobot: {selectedSubmission.questionWeight} - {getWeightLabel(selectedSubmission.questionWeight)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Jawaban Karyawan</label>
                <div className="bg-white border-2 border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedSubmission.userAnswer}</p>
                </div>
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-bold text-slate-700 mb-2">
                  Nilai (0 - 100)
                </label>
                <input
                  type="number"
                  id="grade"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-lg font-semibold"
                  placeholder="Contoh: 85"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Nilai ini merepresentasikan persentase ketepatan (0-100%). Nilai akan dikalikan dengan bobot soal dalam perhitungan akhir.
                </p>
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-bold text-slate-700 mb-2">
                  Feedback / Catatan untuk Karyawan (Opsional)
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none"
                  placeholder="Berikan catatan atau saran untuk karyawan..."
                />
              </div>

              {errorMsg && (
                <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Simpan Nilai
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[60] animate-in slide-in-from-bottom-5">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
