"use client";

import { Eye, EyeOff, Clock } from "lucide-react";
import { QuizFormState } from "@/types/quiz-type";

interface QuizMetaCardProps {
  formState:    QuizFormState;
  isSubmitting: boolean;
  onChange:     (updates: Partial<QuizFormState>) => void;
}

export default function QuizMetaCard({ formState, isSubmitting, onChange }: QuizMetaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="quiz-title" className="block text-sm font-semibold text-slate-700">
          Judul Kuis <span className="text-red-500">*</span>
        </label>
        <input
          id="quiz-title"
          type="text"
          value={formState.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Contoh: Kuis Pemahaman Hiragana Dasar"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="quiz-desc" className="block text-sm font-semibold text-slate-700">
          Deskripsi <span className="text-slate-400 font-normal">(opsional)</span>
        </label>
        <textarea
          id="quiz-desc"
          rows={2}
          value={formState.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Deskripsi singkat tentang kuis ini..."
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none disabled:opacity-60"
        />
      </div>

      {/* Timer / Duration */}
      <div className="space-y-2">
        <label htmlFor="quiz-duration" className="block text-sm font-semibold text-slate-700">
          Batasan Waktu <span className="text-slate-400 font-normal">(dalam menit, 0 = Tanpa Batasan, maks 24 jam)</span>
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="quiz-duration"
            type="number"
            min={0}
            max={1440}
            value={formState.duration}
            onChange={(e) => {
              const valStr = e.target.value;
              if (valStr === "") {
                onChange({ duration: "" });
              } else {
                const val = parseInt(valStr, 10);
                onChange({ duration: isNaN(val) ? 0 : val });
              }
            }}
            placeholder="Contoh: 15"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60 font-medium text-slate-700"
          />
        </div>
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
          onClick={() => onChange({ isPublished: !formState.isPublished })}
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
  );
}