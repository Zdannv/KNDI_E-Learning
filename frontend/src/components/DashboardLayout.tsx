import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useQuizSession } from "@/context/QuizSessionContext";
import { usePathname } from "next/navigation";
import { Clock, BarChart2, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCountdownTime } from "@/utils/duration";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { activeQuiz, timeLeft, answers, cancelQuiz } = useQuizSession();

  const formatTime = (seconds: number) => formatCountdownTime(seconds);

  const isQuizActive = activeQuiz !== null;
  const isNotQuizPage = pathname !== "/quizzes";

  // Helper to determine answered count
  const getAnsweredCount = () => {
    if (!activeQuiz) return 0;
    const questions = activeQuiz.question ?? [];
    return questions.filter((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.question_type === 1) return a.selectedOptionId !== undefined;
      if (q.question_type === 2) return (a.answerText ?? "").trim() !== "";
      if (q.question_type === 3) {
        const totalPairs = (q.matching_card ?? []).length;
        return totalPairs > 0 && Object.keys(a.matchedPairs ?? {}).length === totalPairs;
      }
      if (q.question_type === 4) return (a.answerText ?? "").trim() !== "";
      return false;
    }).length;
  };

  const questionsCount = activeQuiz?.question?.length ?? 0;
  const answeredCount = getAnsweredCount();
  const progressPct = questionsCount > 0 ? Math.round((answeredCount / questionsCount) * 100) : 0;

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden font-sans text-slate-800 relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-grow flex flex-col h-full min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Quiz Banner */}
      {isQuizActive && isNotQuizPage && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[340px] bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">Kuis Berjalan</span>
            </div>
            <button 
              onClick={() => cancelQuiz(false)} 
              title="Batalkan Kuis"
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1">{activeQuiz.title}</h4>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> {answeredCount} / {questionsCount} Soal</span>
              {timeLeft !== null && (
                <span className={`flex items-center gap-1 font-mono font-bold ${
                  timeLeft < 60 ? "text-rose-600 animate-pulse bg-rose-50 px-1.5 py-0.5 rounded" : "text-indigo-600"
                }`}>
                  <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              onClick={() => cancelQuiz(false)}
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-colors"
            >
              Batalkan
            </button>
            <Link
              href="/quizzes"
              className="flex-[2] flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95 text-center"
            >
              Lanjutkan Kuis <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
