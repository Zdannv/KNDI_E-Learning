"use client"

import React from "react"
import { Trash2, Image as ImageIcon, Music } from "lucide-react"

import { FormQuestion, QuestionType, MultipleChoiceOption, MatchingContent } from "@/types/quiz-type"
import MultipleChoiceEditor from "./MultipleChoiceEditor"
import ShortAnswerEditor    from "./ShortAnswerEditor"
import MatchingEditor       from "./MatchingCardEditor"

interface QuestionCardProps {
  question:         FormQuestion
  index:            number
  isSubmitting:     boolean
  isExisting:       boolean
  onRemove:         () => void
  onUpdateQuestion: (updates: Partial<FormQuestion>) => void
  onSwitchType:     (newType: QuestionType) => void
  onUpdateOption:   (index: number, field: keyof MultipleChoiceOption, value: string | undefined) => void
  onAddPair:        () => void
  onRemovePair:     (pairId: string) => void
  onUpdatePair:     (pairId: string, side: "leftContent" | "rightContent", field: keyof MatchingContent, value: string | undefined) => void
  onFileUpload:     (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void
}

export default function QuestionCard(props : QuestionCardProps) {
  const q = props.question

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-200 transition-colors">
      {/* Header row */}
      <div className="flex justify-between items-start mb-6">
        <span className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
          Soal {props.index + 1}
        </span>
        <button
          type="button"
          onClick={props.onRemove}
          disabled={props.isSubmitting}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Question text + media */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-slate-700">Teks Pertanyaan</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => props.onUpdateQuestion({ imageUrl: q.imageUrl !== undefined ? undefined : "" })}
                className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                  q.imageUrl !== undefined
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                {q.imageUrl !== undefined ? "Hapus Gambar" : "Gambar"}
              </button>
              <button
                type="button"
                onClick={() => props.onUpdateQuestion({ audioUrl: q.audioUrl !== undefined ? undefined : "" })}
                className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                  q.audioUrl !== undefined
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Music className="w-3.5 h-3.5 mr-1.5" />
                {q.audioUrl !== undefined ? "Hapus Audio" : "Audio"}
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={q.questionText}
            onChange={(e) => props.onUpdateQuestion({ questionText: e.target.value })}
            disabled={props.isSubmitting}
            placeholder="Masukkan pertanyaan di sini..."
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none disabled:opacity-60"
          />

          {/* Question image */}
          {q.imageUrl !== undefined && (
            <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gambar Pertanyaan (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => props.onFileUpload(e, (b64) => props.onUpdateQuestion({ imageUrl: b64 }))}
                  className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {q.imageUrl && (
                <img src={q.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-slate-200" />
              )}
            </div>
          )}

          {q.audioUrl !== undefined && (
            <div className="flex flex-col space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Audio Pertanyaan (Opsional)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => props.onFileUpload(e, (b64) => props.onUpdateQuestion({ audioUrl: b64 }))}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {q.audioUrl && <audio controls src={q.audioUrl} className="h-10 w-full" />}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Tipe Soal</label>
          <div className="relative">
            <select
              value={q.type}
              onChange={(e) => props.onSwitchType(e.target.value as QuestionType)}
              disabled={props.isSubmitting || props.isExisting}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
              <option value="matching">Matching Card</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          {props.isExisting && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              Tipe tidak dapat diubah setelah disimpan.
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
        {q.type === "multiple_choice" && (
          <MultipleChoiceEditor
            question={q}
            isSubmitting={props.isSubmitting}
            onUpdateQuestion={(updates) => props.onUpdateQuestion(updates)}
            onUpdateOption={props.onUpdateOption}
            onFileUpload={props.onFileUpload}
          />
        )}

        {q.type === "short_answer" && (
          <ShortAnswerEditor
            question={q}
            isSubmitting={props.isSubmitting}
            onUpdateQuestion={(updates) => props.onUpdateQuestion(updates)}
          />
        )}

        {q.type === "matching" && (
          <MatchingEditor
            question={q}
            isSubmitting={props.isSubmitting}
            onAddPair={props.onAddPair}
            onRemovePair={props.onRemovePair}
            onUpdatePair={(pairId, side, field, value) => props.onUpdatePair(pairId, side, field, value)}
            onFileUpload={props.onFileUpload}
          />
        )}
      </div>
    </div>
  )
}