"use client"

import { MatchingCard } from "@/app/lib/use-api"
import { ArrowRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import MatchingCardButton from "./MatchingCardButton"

interface MatchingCardProps {
    cards:        MatchingCard[]
    matchedPairs: Record<number, number>
    onMatch: (leftId: number, rightId: number) => void
}

export default function MatchingCardQuestion(props: MatchingCardProps) {
    const shuffledRight = useMemo(
        () => [...props.cards].sort(() => Math.random() - 0.5),
        [props.cards.map((c) => c.id).join(",")]
    )

    const [selectedLeft,  setSelectedLeft]  = useState<number | null>(null)
    const [selectedRight, setSelectedRight] = useState<number | null>(null)

    useEffect(() => {
        if (selectedLeft === null || selectedRight === null) return

        props.onMatch(selectedLeft, selectedRight)
        setSelectedLeft(null)
        setSelectedRight(null)

    }, [selectedLeft, selectedRight])

    const isLeftCommitted  = (id: number) => props.matchedPairs[id] !== undefined
    const isRightCommitted = (id: number) => Object.values(props.matchedPairs).includes(id)

    const handleLeftClick = (id: number) => {
        if (isLeftCommitted(id)) return
        setSelectedLeft((prev) => (prev === id ? null : id))
    }

    const handleRightClick = (id: number) => {
        if (isRightCommitted(id)) return
        setSelectedRight((prev) => (prev === id ? null : id))
    }

    const isCorrectPair = (leftId: number): boolean => {
        return props.matchedPairs[leftId] === leftId
    }

    const isRightCorrect = (rightId: number): boolean => {
        const leftId = Number(
            Object.keys(props.matchedPairs).find(
                (k) => props.matchedPairs[Number(k)] === rightId
            )
        )
        return leftId === rightId
    }

    const totalCommitted = Object.keys(props.matchedPairs).length
    const totalCards     = props.cards.length

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
                <ArrowRight className="w-4 h-4 shrink-0" />
                Klik satu kartu kiri lalu pasangannya di kanan. Pasangan akan langsung terkunci.
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50 border border-slate-100 py-1.5 rounded-lg">
                        Questions
                    </p>

                    {props.cards.map((card) => {
                        const committed = isLeftCommitted(card.id)
                        const correct   = committed && isCorrectPair(card.id)
                        const wrong     = committed && !correct

                        return (
                            <MatchingCardButton
                                key={`left-${card.id}`}
                                imageUrl={card.left_image_url}
                                audioUrl={card.left_audio_url}
                                text={card.left_text}
                                isMatched={correct}
                                isWrong={wrong}
                                isSelected={selectedLeft === card.id}
                                isFlashing={false}
                                onClick={() => handleLeftClick(card.id)}
                            />
                        )
                    })}
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50 border border-slate-100 py-1.5 rounded-lg">
                        Answers
                    </p>

                    {shuffledRight.map((card) => {
                        const committed = isRightCommitted(card.id)
                        const correct   = committed && isRightCorrect(card.id)
                        const wrong     = committed && !correct

                        return (
                            <MatchingCardButton
                                key={`right-${card.id}`}
                                imageUrl={card.right_image_url}
                                audioUrl={card.right_audio_url}
                                text={card.right_text}
                                isMatched={correct}
                                isWrong={wrong}
                                isSelected={selectedRight === card.id}
                                isFlashing={false}
                                onClick={() => handleRightClick(card.id)}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}