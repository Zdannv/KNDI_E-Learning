"use client";

import React, { useMemo } from 'react';
import { 
  BookOpen, 
  FileText, 
  Trophy, 
  Users, 
  Target, 
  Activity, 
  Medal,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";

interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  dateStr: string;
  timeStr: string;
}

export default function AdminDashboardPage() {
  const [storedMateri, , isClientMateri] = useLocalStorage<any[]>("kndi_materi", []);
  const [storedQuizzes, , isClientQuizzes] = useLocalStorage<any[]>("kndi_quizzes_v2", []);
  const [storedHistory, , isClientHistory] = useLocalStorage<QuizHistoryRecord[]>("kndi_history", []);

  const isClient = isClientMateri && isClientQuizzes && isClientHistory;

  // Derived Statistics
  const stats = useMemo(() => {
    if (!isClient) return { totalMateri: 0, totalKuis: 0, totalPengerjaan: 0, avgScore: "0" };

    const totalPengerjaan = storedHistory.length;
    const avgScore = totalPengerjaan > 0 
      ? (storedHistory.reduce((acc, h) => acc + h.score, 0) / totalPengerjaan).toFixed(1)
      : "0.0";

    return {
      totalMateri: storedMateri.length,
      totalKuis: storedQuizzes.length,
      totalPengerjaan,
      avgScore
    };
  }, [isClient, storedMateri, storedQuizzes, storedHistory]);

  // Derived Leaderboard (Top 5 scores)
  const topPerformers = useMemo(() => {
    if (!isClient) return [];
    // Sort descending by score
    return [...storedHistory].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [isClient, storedHistory]);

  // Derived Recent Activity (Since storedHistory unshifts new items to index 0)
  const recentActivities = useMemo(() => {
    if (!isClient) return [];
    return storedHistory.slice(0, 5);
  }, [isClient, storedHistory]);

  // Extract a pseudo-name hash using the ID just to make dummy data look slightly different
  const generateDummyName = (id: string) => {
    const chars = id.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return `Siswa #${chars.substring(0, 4) || Math.floor(Math.random() * 9000 + 1000)}`;
  };

  if (!isClient) {
    return <div className="p-6 min-h-screen bg-slate-50/50" />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Analitik</h1>
        <p className="text-slate-600">
          Pantau ringkasan performa siswa, jumlah materi yang dikuasai, dan tingkat partisipasi kuis secara langsung. 
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Aktif</span>
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">Total Materi Tersedia</h3>
            <div className="text-3xl font-black text-slate-800">{stats.totalMateri}</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">Total Kuis Tersedia</h3>
            <div className="text-3xl font-black text-slate-800">{stats.totalKuis}</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              {stats.totalPengerjaan > 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center">&uarr; Naik</span>}
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">Partisipasi Kuis (Riwayat)</h3>
            <div className="text-3xl font-black text-slate-800">{stats.totalPengerjaan}</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">Rata-Rata Nilai Siswa</h3>
            <div className="flex items-baseline space-x-1">
              <div className="text-3xl font-black text-slate-800">{stats.avgScore}</div>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
               <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                 <Trophy className="w-5 h-5" />
               </div>
               <h2 className="text-xl font-bold text-slate-800">Bintang Kelas (Top 5 Nilai)</h2>
            </div>
          </div>
          
          <div className="flex-1 p-0 overflow-x-auto">
            {topPerformers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <TrendingUpIcon className="w-12 h-12 text-slate-300 mb-4" />
                <p>Belum ada satupun siswa yang mengerjakan kuis.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold w-24 text-center">Peringkat</th>
                    <th className="px-6 py-4 font-semibold">Nama Siswa (Dummy)</th>
                    <th className="px-6 py-4 font-semibold">Kuis yang Dikerjakan</th>
                    <th className="px-6 py-4 font-semibold text-right">Skor Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topPerformers.map((record, index) => (
                    <tr key={`rank-${record.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {index === 0 && <Medal className="w-6 h-6 text-yellow-500 fill-yellow-100" />}
                          {index === 1 && <Medal className="w-6 h-6 text-slate-400 fill-slate-100" />}
                          {index === 2 && <Medal className="w-6 h-6 text-amber-700 fill-amber-100" />}
                          {index > 2 && <span className="font-bold text-slate-400 text-lg">#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            {generateDummyName(record.id).charAt(6)}
                          </div>
                          <span className="font-semibold text-slate-700">
                            {generateDummyName(record.id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md line-clamp-1 max-w-[200px]" title={record.quizTitle}>
                          {record.quizTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center justify-center font-bold text-lg px-3 py-1 rounded-lg ${
                          record.score >= 80 ? 'bg-green-50 text-green-600' :
                          record.score >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {record.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Content: Recent Activity Timeline */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {recentActivities.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center py-8">
                 <Clock className="w-10 h-10 text-slate-300 mb-3" />
                 <p className="text-sm">Belum ada aktivitas pengerjaan kuis terbaru di sistem.</p>
               </div>
            ) : (
               <div className="space-y-6">
                 {recentActivities.map((activity, i) => (
                   <div key={activity.id} className="relative flex space-x-4">
                     {/* Timeline Line */}
                     {i !== recentActivities.length - 1 && (
                       <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-100" />
                     )}
                     
                     <div className="relative shrink-0">
                       <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white ring-1 ring-slate-100 z-10">
                         <CheckCircleIcon className={`w-4 h-4 ${activity.score >= 60 ? 'text-green-500' : 'text-amber-500'}`} />
                       </div>
                     </div>
                     
                     <div className="flex-1 pb-1">
                       <div className="flex justify-between items-start">
                         <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{generateDummyName(activity.id)}</h4>
                         <span className="text-xs font-semibold text-slate-400 whitespace-nowrap ml-2">
                           {activity.timeStr}
                         </span>
                       </div>
                       <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                         Baru saja menyelesaikan kuis <span className="font-semibold text-slate-700">"{activity.quizTitle}"</span> dengan nilai akhir <span className={`font-bold ${activity.score >= 80 ? 'text-green-600' : activity.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{activity.score}</span>.
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
               <Link href="/admin/kuis" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                 <span>Kelola Kuis</span>
                 <ArrowUpRight className="w-4 h-4 ml-1" />
               </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
