"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Question, MatchingPair } from "@/data/dummyKuis";
import MatchingCard, { MatchingStateEntry } from "./MatchingCard";

interface QuestionCardProps {
  question: Question;
  answer: string;
  isChecked: boolean;
  shuffledLeft?: MatchingPair[];
  shuffledRight?: MatchingPair[];
  matchingState?: MatchingStateEntry;
  onAnswerChange: (val: string) => void;
  onMatchSelect: (side: "left" | "right", pairId: string) => void;
}

export default function QuestionCard({
  question,
  answer,
  isChecked,
  shuffledLeft,
  shuffledRight,
  matchingState,
  onAnswerChange,
  onMatchSelect,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[300px] flex flex-col transition-all">
      {/* Question media */}
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="w-full max-h-64 object-contain rounded-xl border border-slate-200 mb-6 bg-slate-50"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Error")}
        />
      )}
      {question.audioUrl && <audio controls src={question.audioUrl} className="w-full mb-6" />}

      <h2 className="text-xl font-medium text-slate-800 leading-relaxed mb-8">
        <span className="font-bold text-indigo-600 mr-2">Q.</span>
        {question.questionText}
      </h2>

      <div className="flex-1">
        {/* ========== MULTIPLE CHOICE ========== */}
        {question.type === "multiple_choice" && (
          <div className={question.options.some((o) => o.imageUrl) ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
            {question.options.map((option, optIdx) => {
              const isSelected = answer === String(optIdx);
              const isCorrectOption = optIdx === question.correctOptionIndex;

              let optionStyle = "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700";
              let indicatorStyle = "border-slate-300";

              if (isChecked) {
                if (isSelected && isCorrectOption) {
                  optionStyle = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500 shadow-sm";
                  indicatorStyle = "border-green-600 bg-green-600";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500 shadow-sm";
                  indicatorStyle = "border-red-600 bg-red-600";
                } else if (!isSelected && isCorrectOption) {
                  optionStyle = "border-green-500 bg-green-50 text-green-900 border-dashed";
                  indicatorStyle = "border-green-500";
                } else {
                  optionStyle = "border-slate-100 bg-white opacity-60 grayscale";
                }
              } else if (isSelected) {
                optionStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600";
                indicatorStyle = "border-indigo-600";
              }

              return (
                <label
                  key={optIdx}
                  className={`flex ${option.imageUrl ? "items-start flex-col sm:flex-row" : "items-center"} p-4 rounded-xl border-2 transition-all ${!isChecked ? "cursor-pointer" : "cursor-default"} ${optionStyle}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={String(optIdx)}
                    checked={isSelected}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    disabled={isChecked}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${option.imageUrl ? "mt-1 mb-3 sm:mb-0" : ""} ${indicatorStyle}`}>
                    {isSelected && !isChecked && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                    {isChecked && isSelected && isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {isChecked && isSelected && !isCorrectOption && <XCircle className="w-3.5 h-3.5 text-white" />}
                    {isChecked && !isSelected && isCorrectOption && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                  </div>
                  <div className={`flex flex-1 w-full ${option.imageUrl ? "flex-col gap-3" : "flex-col sm:flex-row sm:items-center gap-3"}`}>
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt="Option"
                        className="w-full h-36 object-cover rounded-md border border-slate-200 bg-slate-50"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/200x200?text=Error")}
                      />
                    )}
                    {option.audioUrl && <audio controls src={option.audioUrl} className="w-full" />}
                    <span className={`font-medium ${isChecked && isSelected && !isCorrectOption ? "line-through decoration-red-400" : ""}`}>
                      {option.text}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* ========== SHORT ANSWER ========== */}
        {question.type === "short_answer" && (
          <div className="space-y-3 animate-in fade-in">
            <label htmlFor={`short-answer-${question.id}`} className="block text-sm font-semibold text-slate-600 mb-2">
              Ketik Jawaban Anda:
            </label>
            <input
              id={`short-answer-${question.id}`}
              type="text"
              autoComplete="off"
              placeholder="Contoh: Makan"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={isChecked}
              className={`w-full px-5 py-4 rounded-xl border-2 transition-all font-medium placeholder:text-slate-400 ${
                isChecked
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10"
              }`}
            />

            {isChecked && (
              <div
                className={`mt-5 p-4 rounded-xl text-sm font-semibold border flex flex-col ${
                  answer.trim().toLowerCase() === question.correctAnswerText.trim().toLowerCase()
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {answer.trim().toLowerCase() === question.correctAnswerText.trim().toLowerCase() ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Jawaban Anda Tepat!
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-1">
                      <XCircle className="w-5 h-5 mr-2" /> Jawaban Anda Kurang Tepat.
                    </div>
                    <span className="text-slate-600 font-medium ml-7 mt-1">
                      Jawaban benar:{" "}
                      <span className="font-bold text-green-700">{question.correctAnswerText}</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== MATCHING ========== */}
        {question.type === "matching" && shuffledLeft && shuffledRight && matchingState && (
          <MatchingCard
            questionId={question.id}
            leftPairs={shuffledLeft}
            rightPairs={shuffledRight}
            state={matchingState}
            isDisabled={isChecked}
            onSelect={onMatchSelect}
          />
        )}
      </div>
    </div>
  );
}
