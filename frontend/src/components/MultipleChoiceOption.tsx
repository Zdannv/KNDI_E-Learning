"use client"

import { QuestionOption } from "@/app/lib/use-api"

interface MultipleChoiceProps {
    option: QuestionOption
    index: number
    isSelected: boolean
    onSelect: () => void
}

export default function MultipleChoiceOption(props: MultipleChoiceProps) {
    const letter = String.fromCharCode(65 + props.index)

    return (
        <button
            type="button"
            onClick={props.onSelect}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                ${ props.isSelected
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`
            }
        >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                    ${props.isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`
                }
            >
                {letter}
            </span>

            <div className="flex-1 min-w-0">
                {props.option.image_url && (
                    <img src={props.option.image_url} className="mb-2 max-h-24 rounded-lg object-contain" />
                )}
                {props.option.audio_url && (
                    <audio
                        controls
                        src={props.option.audio_url}
                        className="mb-2 w-full h-10"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
                <span
                    className={`text-sm font-medium 
                        ${props.isSelected 
                            ? "text-indigo-800" 
                            : "text-slate-700"
                        }`
                    }
                >
                    {props.option.option_text}
                </span>
            </div>
        </button>
    )
}