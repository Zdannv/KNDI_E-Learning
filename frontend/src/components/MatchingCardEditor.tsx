"use client";

import { Plus, Trash2, ArrowRight, Image as ImageIcon, Music } from "lucide-react";
import { MatchingQuestion, MatchingContent } from "@/types/quiz-type";

interface MatchingEditorProps {
  question:     MatchingQuestion;
  isSubmitting: boolean;
  onAddPair:    () => void;
  onRemovePair: (pairId: string) => void;
  onUpdatePair: (
    pairId: string,
    side: "leftContent" | "rightContent",
    field: keyof MatchingContent,
    value: string | undefined
  ) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

export default function MatchingEditor({
  question,
  isSubmitting,
  onAddPair,
  onRemovePair,
  onUpdatePair,
  onFileUpload,
}: MatchingEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Pasangan Jawaban (Maks 5)
        </label>
        <button
          type="button"
          onClick={onAddPair}
          disabled={isSubmitting || question.pairs.length >= 5}
          className="flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 border border-blue-100"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pasangan
        </button>
      </div>

      {question.pairs.map((pair) => (
        <div
          key={pair.id}
          className="relative bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm"
        >
          <MatchingSide
            label="Kiri"
            content={pair.leftContent}
            isSubmitting={isSubmitting}
            onUpdateField={(field, value) => onUpdatePair(pair.id, "leftContent", field, value)}
            onFileUpload={onFileUpload}
          />

          <div className="shrink-0 flex items-center justify-center p-2 rounded-full bg-indigo-50 text-indigo-500 shadow-sm border border-indigo-100">
            <ArrowRight className="w-5 h-5 md:rotate-0 rotate-90" />
          </div>

          <MatchingSide
            label="Kanan"
            content={pair.rightContent}
            isSubmitting={isSubmitting}
            onUpdateField={(field, value) => onUpdatePair(pair.id, "rightContent", field, value)}
            onFileUpload={onFileUpload}
          />

          <button
            type="button"
            onClick={() => onRemovePair(pair.id)}
            disabled={isSubmitting || question.pairs.length <= 1}
            className="absolute -top-3 -right-3 p-2 bg-white border border-red-200 text-red-500 rounded-full hover:bg-red-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface MatchingSideProps {
  label:         string;
  content:       MatchingContent;
  isSubmitting:  boolean;
  onUpdateField: (field: keyof MatchingContent, value: string | undefined) => void;
  onFileUpload:  (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

function MatchingSide({ label, content, isSubmitting, onUpdateField, onFileUpload }: MatchingSideProps) {
  return (
    <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => onUpdateField("imageUrl", content.imageUrl !== undefined ? undefined : "")}
            className={`p-1.5 rounded transition-colors ${
              content.imageUrl !== undefined
                ? "text-indigo-600 bg-indigo-100"
                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateField("audioUrl", content.audioUrl !== undefined ? undefined : "")}
            className={`p-1.5 rounded transition-colors ${
              content.audioUrl !== undefined
                ? "text-indigo-600 bg-indigo-100"
                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={content.text}
        onChange={(e) => onUpdateField("text", e.target.value)}
        disabled={isSubmitting}
        placeholder={`Teks ${label.toLowerCase()}...`}
        className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 rounded-md px-3 py-2 text-sm"
      />

      {content.imageUrl !== undefined && (
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload(e, (b64) => onUpdateField("imageUrl", b64))}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
          />
          {content.imageUrl && (
            <img src={content.imageUrl} alt={label} className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200" />
          )}
        </div>
      )}

      {content.audioUrl !== undefined && (
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => onFileUpload(e, (b64) => onUpdateField("audioUrl", b64))}
          className="w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
        />
      )}
      {content.audioUrl && content.audioUrl.length > 0 && (
        <audio controls src={content.audioUrl} className="h-8 w-full" />
      )}
    </div>
  );
}