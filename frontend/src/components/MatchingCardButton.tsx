"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

interface MatchingCardButtonProps {
    imageUrl:      string | null
    audioUrl:      string | null
    text:          string
    isCommitted:   boolean
    pairIndex?:    number
    isRight?:      boolean
    isHoveredPair?: boolean
    isSelected:    boolean
    isFlashing:    boolean
    onClick:       () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export default function MatchingCardButton(props: MatchingCardButtonProps) {
    let stateClass: string

    if (props.isCommitted) {
        if (props.isHoveredPair) {
            stateClass = "border-indigo-400 bg-slate-100 text-slate-700 cursor-default shadow-sm ring-2 ring-indigo-100"
        } else {
            stateClass = "border-slate-300 bg-slate-50 text-slate-500 cursor-default opacity-90"
        }
    } else if (props.isFlashing) {
        stateClass = "border-red-400 bg-red-50 text-red-700 animate-pulse"
    } else if (props.isSelected) {
        stateClass = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
    } else {
        stateClass = "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
    }

    // Determine min-height based on media presence on this specific card
    const hasMedia = props.imageUrl || props.audioUrl
    const minHeightClass = hasMedia ? "min-h-[10rem]" : "min-h-[3.5rem]"

    const isDisabled = props.isCommitted

    const handleClick = () => {
        if (!isDisabled) {
            props.onClick()
        }
    }

    return (
        <div
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    handleClick()
                }
            }}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            className={`w-full ${minHeightClass} p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-between gap-3 text-sm font-bold text-center shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${stateClass} group`}
        >
            {props.imageUrl && (
                <img src={props.imageUrl} className="w-full h-24 object-cover rounded-xl border border-slate-100" alt="" />
            )}

            {props.audioUrl && (
                <audio
                    controls
                    src={props.audioUrl}
                    className="w-full scale-[0.9] origin-center"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            <span className="grow flex items-center justify-center min-h-[1.5rem] break-words w-full">{props.text}</span>

            {props.isCommitted && props.pairIndex !== undefined && (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-xs font-semibold select-none border border-slate-300">
                    {!props.isRight ? (
                        <>
                            <span>Hubungan {props.pairIndex}</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-500 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                    ) : (
                        <>
                            <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-500 transition-transform duration-200 group-hover:-translate-x-1" />
                            <span>Hubungan {props.pairIndex}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}