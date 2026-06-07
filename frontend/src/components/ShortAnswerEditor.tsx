"use client";

import { ShortAnswerQuestion } from "@/types/quiz-type";

interface ShortAnswerEditorProps {
  question:         ShortAnswerQuestion;
  isSubmitting:     boolean;
  onUpdateQuestion: (updates: Partial<ShortAnswerQuestion>) => void;
}

export default function ShortAnswerEditor({
  question,
  isSubmitting,
  onUpdateQuestion,
}: ShortAnswerEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">Kunci Jawaban</label>
      <input
        type="text"
        value={question.correctAnswerText}
        onChange={(e) => onUpdateQuestion({ correctAnswerText: e.target.value })}
        disabled={isSubmitting}
        placeholder="Ketik jawaban yang tepat di sini..."
        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-sm disabled:opacity-60"
      />
    </div>
  );
}