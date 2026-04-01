"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Trophy, CalendarClock, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateStr: string;
  timeStr: string;
}

export default function RiwayatPage() {
  const [storedHistory, , isClient] = useLocalStorage<QuizHistoryRecord[]>("kndi_history", []);

  if (!isClient) return <div className="p-6 h-screen w-full" />; // Hydration guard

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Riwayat Nilai</h1>
          <p className="text-slate-600">
            Pantau rekapitulasi nilai dan kemajuan kuis bahasa Jepang Anda di sini.
          </p>
        </div>
        
        <Link 
          href="/kuis"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          <BookOpen className="w-5 h-5" />
          <span>Kerjakan Kuis Lagi</span>
        </Link>
      </div>

      {storedHistory.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-full mb-6 text-indigo-400">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
          <p className="text-slate-500 max-w-md pb-6 leading-relaxed">
            Anda belum pernah menyelesaikan kuis apa pun. Segera kerjakan kuis untuk melihat nilai Anda di sini!
          </p>
          <Link 
            href="/kuis"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-bold"
          >
            <span>Pergi ke Daftar Kuis</span>
            <ArrowRightIcon className="w-4 h-4 ml-1 mt-0.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Judul Kuis</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengerjaan</th>
                  <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storedHistory.map((history) => (
                  <tr key={history.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-4 shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1">
                          {history.quizTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center text-slate-500 text-sm">
                        <CalendarClock className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{history.dateStr}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span>{history.timeStr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center justify-center font-bold text-lg ${
                        history.score >= 80 ? 'text-green-600' :
                        history.score >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {history.score}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        history.score >= 80 ? 'bg-green-100 text-green-700' :
                        history.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {history.score >= 80 ? 'Lulus Baik' :
                          history.score >= 60 ? 'Lulus' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
