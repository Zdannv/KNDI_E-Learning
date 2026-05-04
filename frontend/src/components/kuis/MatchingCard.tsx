"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { MatchingPair } from "@/data/dummyKuis";

export interface MatchingStateEntry {
  matchedPairIds: string[];
  leftSelected: string | null;
  rightSelected: string | null;
  flashRed: boolean;
}

interface MatchingCardProps {
  questionId: string;
  leftPairs: MatchingPair[];
  rightPairs: MatchingPair[];
  state: MatchingStateEntry;
  isDisabled: boolean;
  onSelect: (side: "left" | "right", pairId: string) => void;
}

function getCardClass(isMatched: boolean, isSelected: boolean, isMismatched: boolean, isDisabled: boolean) {
  if (isMatched) return "bg-green-50/50 border-green-300 text-green-700 opacity-60 cursor-default scale-[0.98]";
  if (isMismatched) return "bg-red-50 border-red-400 text-red-700 animate-pulse";
  if (isSelected) return "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20";
  if (isDisabled) return "bg-slate-50 border-slate-200 text-slate-400 cursor-default opacity-70";
  return "bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md text-slate-700 cursor-pointer";
}

function PairCard({ pair, side, isMatched, isSelected, isMismatched, isDisabled, onSelect }: {
  pair: MatchingPair;
  side: "left" | "right";
  isMatched: boolean;
  isSelected: boolean;
  isMismatched: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  const content = side === "left" ? pair.leftContent : pair.rightContent;
  const cardClass = getCardClass(isMatched, isSelected, isMismatched, isDisabled);

  return (
    <button
      onClick={() => !isMatched && !isDisabled && onSelect()}
      disabled={isMatched || isDisabled}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[100px] ${cardClass}`}
    >
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt={side}
          className="w-full max-w-[120px] max-h-24 object-cover rounded shadow-sm bg-white"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/100?text=!")}
        />
      )}
      {content.audioUrl && (
        <audio controls src={content.audioUrl} className="w-full max-w-[150px] scale-[0.85] sm:scale-90 origin-center" />
      )}
      {content.text && <span className="font-semibold text-center text-sm">{content.text}</span>}
    </button>
  );
}

export default function MatchingCard({ questionId, leftPairs, rightPairs, state, isDisabled, onSelect }: MatchingCardProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <p className="text-sm border flex items-center bg-blue-50 border-blue-200 text-blue-700 p-3 rounded-lg font-medium mb-6">
        <ArrowRight className="w-4 h-4 mr-2" />
        Klik satu kartu di sebelah kiri dan pasangannya di sebelah kanan hingga seluruhnya tepat.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center bg-slate-50 shadow-inner border border-slate-100 py-1.5 rounded">
            Pertanyaan
          </div>
          {leftPairs.map((pair) => (
            <PairCard
              key={`left-${pair.id}`}
              pair={pair}
              side="left"
              isMatched={state.matchedPairIds.includes(pair.id)}
              isSelected={state.leftSelected === pair.id}
              isMismatched={state.leftSelected === pair.id && state.flashRed}
              isDisabled={isDisabled}
              onSelect={() => onSelect("left", pair.id)}
            />
          ))}
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center bg-slate-50 shadow-inner border border-slate-100 py-1.5 rounded">
            Jawaban
          </div>
          {rightPairs.map((pair) => (
            <PairCard
              key={`right-${pair.id}`}
              pair={pair}
              side="right"
              isMatched={state.matchedPairIds.includes(pair.id)}
              isSelected={state.rightSelected === pair.id}
              isMismatched={state.rightSelected === pair.id && state.flashRed}
              isDisabled={isDisabled}
              onSelect={() => onSelect("right", pair.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
