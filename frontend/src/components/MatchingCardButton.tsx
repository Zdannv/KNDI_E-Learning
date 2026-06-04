"use client"

import { CheckCircle2 } from "lucide-react"

interface MatchingCardButtonProps {
    imageUrl: string | null
    audioUrl: string | null
    text: string
    isMatched: boolean
    isSelected: boolean
    isFlashing: boolean
    onClick: () => void
}

export default function MatchingCardButton(props: MatchingCardButtonProps) {
    let stateClass: string
    if (props.isMatched) {
        stateClass = "border-green-400 bg-green-50 text-green-700 cursor-default opacity-80";
    } else if (props.isFlashing) {
        stateClass = "border-red-400 bg-red-50 text-red-700 animate-pulse";
    } else if (props.isSelected) {
        stateClass = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200";
    } else {
        stateClass = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
    }

    return (
        <button
            type="button"
            onClick={props.onClick}
            disabled={props.isMatched}
            className={
                `w-full min-h-18 p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-center ${stateClass}`
            }
        >
            {props.imageUrl && (
                <img src={props.imageUrl} className="w-full h-20 object-cover rounded-lg" />
            )}
            {props.audioUrl && (
                <audio 
                    controls 
                    src={props.audioUrl}
                    className="w-full scale-[0.85] origin-center"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
            <span>{props.text}</span>
            {props.isMatched && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
        </button>
    )
}