"use client"

import { CheckCircle2, XCircle } from "lucide-react"

interface MatchingCardButtonProps {
    imageUrl:   string | null
    audioUrl:   string | null
    text:       string
    isMatched:  boolean
    isWrong:    boolean
    isSelected: boolean
    isFlashing: boolean
    onClick:    () => void
    hasImagePlaceholders?: boolean
    hasAudioPlaceholders?: boolean
}

export default function MatchingCardButton(props: MatchingCardButtonProps) {
    let stateClass: string

    if (props.isMatched) {
        stateClass = "border-green-400 bg-green-50 text-green-700 cursor-default opacity-90"
    } else if (props.isWrong) {
        stateClass = "border-red-400 bg-red-50 text-red-700 cursor-default opacity-90"
    } else if (props.isFlashing) {
        stateClass = "border-red-400 bg-red-50 text-red-700 animate-pulse"
    } else if (props.isSelected) {
        stateClass = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
    } else {
        stateClass = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
    }

    // Determine min-height based on media presence
    const hasMedia = props.hasImagePlaceholders || props.hasAudioPlaceholders || props.imageUrl || props.audioUrl
    const minHeightClass = hasMedia ? "min-h-[14rem]" : "min-h-[5rem]"

    return (
        <button
            type="button"
            onClick={props.onClick}
            disabled={props.isMatched || props.isWrong}
            className={`w-full ${minHeightClass} p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-between gap-3 text-sm font-bold text-center shadow-xs hover:shadow-md ${stateClass}`}
        >
            {props.hasImagePlaceholders ? (
                props.imageUrl ? (
                    <img src={props.imageUrl} className="w-full h-24 object-cover rounded-xl border border-slate-100" alt="" />
                ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs select-none">
                        (Tidak Ada Gambar)
                    </div>
                )
            ) : (
                props.imageUrl && (
                    <img src={props.imageUrl} className="w-full h-24 object-cover rounded-xl border border-slate-100" alt="" />
                )
            )}

            {props.hasAudioPlaceholders ? (
                props.audioUrl ? (
                    <audio
                        controls
                        src={props.audioUrl}
                        className="w-full scale-[0.9] origin-center"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="w-full h-9 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 flex items-center justify-center text-slate-350 text-xs select-none scale-[0.9] origin-center">
                        (Tidak Ada Audio)
                    </div>
                )
            ) : (
                props.audioUrl && (
                    <audio
                        controls
                        src={props.audioUrl}
                        className="w-full scale-[0.9] origin-center"
                        onClick={(e) => e.stopPropagation()}
                    />
                )
            )}

            <span className="grow flex items-center justify-center min-h-[1.5rem] break-words w-full">{props.text}</span>

            <div className="flex items-center gap-1 shrink-0 h-5">
                {props.isMatched && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {props.isWrong   && <XCircle      className="w-4 h-4 text-red-500" />}
            </div>
        </button>
    )
}