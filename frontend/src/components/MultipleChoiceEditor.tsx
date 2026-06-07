"use client";

import { Image as ImageIcon, Music } from "lucide-react";
import { MultipleChoiceQuestion, MultipleChoiceOption } from "@/types/quiz-type";

interface MultipleChoiceEditorProps {
  question:         MultipleChoiceQuestion;
  isSubmitting:     boolean;
  onUpdateQuestion: (updates: Partial<MultipleChoiceQuestion>) => void;
  onUpdateOption:   (index: number, field: keyof MultipleChoiceOption, value: string | undefined) => void;
  onFileUpload:     (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

export default function MultipleChoiceEditor({
  question,
  isSubmitting,
  onUpdateQuestion,
  onUpdateOption,
  onFileUpload,
}: MultipleChoiceEditorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">
        Pilihan Ganda — tandai yang benar
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((opt, optIdx) => (
          <div key={optIdx} className="flex flex-col space-y-2">
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                question.correctOptionIndex === optIdx
                  ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctOptionIndex === optIdx}
                onChange={() => onUpdateQuestion({ correctOptionIndex: optIdx })}
                disabled={isSubmitting}
                className="w-5 h-5 text-blue-600 cursor-pointer"
              />
              <span className="font-semibold text-slate-600 shrink-0 w-6 uppercase">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => onUpdateOption(optIdx, "text", e.target.value)}
                disabled={isSubmitting}
                placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}...`}
                className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => onUpdateOption(optIdx, "imageUrl", opt.imageUrl !== undefined ? undefined : "")}
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                  opt.imageUrl !== undefined
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateOption(optIdx, "audioUrl", opt.audioUrl !== undefined ? undefined : "")}
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                  opt.audioUrl !== undefined
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                <Music className="w-4 h-4" />
              </button>
            </div>

            {opt.imageUrl !== undefined && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e, (b64) => onUpdateOption(optIdx, "imageUrl", b64))}
                  className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                />
                {opt.imageUrl && (
                  <img src={opt.imageUrl} alt="Thumb" className="w-8 h-8 object-cover rounded border border-slate-200 shrink-0" />
                )}
              </div>
            )}

            {opt.audioUrl !== undefined && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => onFileUpload(e, (b64) => onUpdateOption(optIdx, "audioUrl", b64))}
                  className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                />
                {opt.audioUrl && <audio controls src={opt.audioUrl} className="h-8 w-full" />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}