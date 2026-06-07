"use client"

import { MatchingCard, Question } from "@/app/lib/use-api"
import MultipleChoiceOption from "./MultipleChoiceOption"
import MatchingCardQuestion from "./MatchingCardQuestion"

export interface StudentAnswer {
    questionId:          number
    questionType:        1 | 2 | 3
    selectedOptionId?:   number
    selectedOptionIndex?: number
    answerText?:         string
    matchedPairs?: Record<number, number>
}

export interface QuestionCardProps {
    question: Question
    index:    number
    total:    number
    answer:   StudentAnswer | undefined
    onAnswer: (answer: StudentAnswer) => void
}

export default function QuestionCard(props: QuestionCardProps) {
    const handleOptionSelect = (optionId: number, optionIndex: number) => {
        props.onAnswer({
            questionId:          props.question.id,
            questionType:        1,
            selectedOptionId:    optionId,
            selectedOptionIndex: optionIndex,
        })
    }

    const handleTextChange = (text: string) => {
        props.onAnswer({
            questionId:   props.question.id,
            questionType: 2,
            answerText:   text,
        })
    }

    const handleMatching = (leftCardId: number, rightCardId: number) => {
        const current = props.answer?.matchedPairs ?? {}

        props.onAnswer({
            questionId:   props.question.id,
            questionType: 3,
            matchedPairs: { ...current, [leftCardId]: rightCardId },
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="mb-6">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    Question {props.index + 1} from {props.total}
                </span>

                <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                    {props.question.question_text}
                </p>

                {props.question.image_url && (
                    <img
                        src={props.question.image_url}
                        alt="Gambar soal"
                        className="mt-4 rounded-xl max-h-48 object-contain border border-slate-200"
                    />
                )}
                {props.question.audio_url && (
                    <audio controls src={props.question.audio_url} className="mt-4 w-full h-10" />
                )}
            </div>

            {props.question.question_type === 1 && (
                <div className="grid grid-cols-1 gap-3">
                    {(props.question.question_options ?? []).map((opt, idx) => (
                        <MultipleChoiceOption
                            key={opt.id}
                            option={opt}
                            index={idx}
                            isSelected={props.answer?.selectedOptionId === opt.id}
                            onSelect={() => handleOptionSelect(opt.id, idx)}
                        />
                    ))}
                </div>
            )}

            {props.question.question_type === 2 && (
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-600">
                        Your answer
                    </label>
                    <input
                        type="text"
                        value={props.answer?.answerText ?? ""}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Ketik jawaban di sini..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
                    />
                </div>
            )}

            {props.question.question_type === 3 && (
                <MatchingCardQuestion
                    cards={props.question.matching_card ?? ([] as MatchingCard[])}
                    matchedPairs={props.answer?.matchedPairs ?? {}}
                    onMatch={handleMatching}
                />
            )}
        </div>
    )
}