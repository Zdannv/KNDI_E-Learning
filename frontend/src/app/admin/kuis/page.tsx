"use client";

import Link from "next/link";
import { Plus, ClipboardList, BookOpen, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";
import { QuizData, fallbackMockQuizzes } from "@/data/dummyKuis";

export default function AdminKuisPage() {
  const [storedQuizzes, setStoredQuizzes, isClient] = useLocalStorage<QuizData[]>("kndi_quizzes_v2", fallbackMockQuizzes);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isClient) return <div className="p-6 h-screen w-full" />;

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kuis "${title}"?`)) {
      setStoredQuizzes(prev => prev.filter(q => q.id !== id));
      setToastMessage("Kuis berhasil dihapus!");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header and Action Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Kuis</h1>
          <p className="text-slate-600">
            Kelola bank soal, atur kuis untuk siswa, dan tinjau kuis yang tersedia.
          </p>
        </div>
        
        <Link 
          href="/admin/kuis/buat"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Kuis Baru</span>
        </Link>
      </div>

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
                 
                 {/* Action Buttons */}
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
