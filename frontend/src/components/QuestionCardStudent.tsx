"use client"

import React from "react"
import { Question } from "@/app/lib/use-api"
import MultipleChoiceOption from "./MultipleChoiceOption"
import MatchingCardQuestion from "./MatchingCardQuestion"
import { FileText } from "lucide-react"

export interface StudentAnswer {
  questionId: number
  selectedOptionId?: number
  answerText?: string
  matchedPairs?: Record<number, number>
}

interface QuestionCardStudentProps {
  question: Question
  index: number
  total: number
  answer: StudentAnswer | undefined
  onAnswer: (answer: StudentAnswer) => void
}

export default function QuestionCardStudent({
  question,
  index,
  total,
  answer,
  onAnswer,
}: QuestionCardStudentProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Soal {index + 1} dari {total}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          question.question_type === 1 ? "bg-blue-50 text-blue-600 border-blue-200"
          : question.question_type === 2 ? "bg-violet-50 text-violet-600 border-violet-200"
          : question.question_type === 3 ? "bg-indigo-50 text-indigo-600 border-indigo-200"
          : "bg-amber-50 text-amber-600 border-amber-200"
        }`}>
          {question.question_type === 1 ? "Pilihan Ganda"
            : question.question_type === 2 ? "Isian Singkat"
            : question.question_type === 3 ? "Menjodohkan"
            : "Esai"}
        </span>
      </div>

      {/* Question media */}
      {question.image_url && (
        <img
          src={question.image_url}
          alt="Gambar soal"
          className="w-full max-h-64 object-contain rounded-xl border border-slate-200"
        />
      )}
      {question.audio_url && (
        <audio controls src={question.audio_url} className="w-full h-10" />
      )}

      {/* Question text */}
      <p className="text-lg font-semibold text-slate-800 leading-relaxed">
        {question.question_text}
      </p>

      {/* Answer area per type */}

      {/* ── Multiple choice ── */}
      {question.question_type === 1 && (
        <div className="space-y-3">
          {(question.question_options ?? []).map((opt, i) => (
            <MultipleChoiceOption
              key={opt.id}
              option={opt}
              index={i}
              isSelected={answer?.selectedOptionId === opt.id}
              onSelect={() =>
                onAnswer({ questionId: question.id, selectedOptionId: opt.id })
              }
            />
          ))}
        </div>
      )}

      {/* ── Short answer ── */}
      {question.question_type === 2 && (
        <input
          type="text"
          value={answer?.answerText ?? ""}
          onChange={(e) =>
            onAnswer({ questionId: question.id, answerText: e.target.value })
          }
          placeholder="Ketik jawaban Anda di sini..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
        />
      )}

      {/* ── Matching card ── */}
      {question.question_type === 3 && (
        <MatchingCardQuestion
          cards={question.matching_card ?? []}
          matchedPairs={answer?.matchedPairs ?? {}}
          onMatch={(leftId, rightId) =>
            onAnswer({
              questionId:   question.id,
              matchedPairs: { ...(answer?.matchedPairs ?? {}), [leftId]: rightId },
            })
          }
        />
      )}

      {/* ── Essay ── */}
      {question.question_type === 4 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Jawaban akan dinilai secara manual oleh Sensei.</span>
          </div>
          <textarea
            rows={6}
            value={answer?.answerText ?? ""}
            onChange={(e) =>
              onAnswer({ questionId: question.id, answerText: e.target.value })
            }
            placeholder="Tulis jawaban esai Anda di sini..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
          />
        </div>
      )}
    </div>
  )
}