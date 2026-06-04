"use client"

import { MatchingCard } from "@/app/lib/use-api"
import { ArrowRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import MatchingCardButton from "./MatchingCardButton"

interface MatchingCardProps {
    cards: MatchingCard[]
    matchedPairs: Record<number, number>
    onMatch: (leftId: number, rightId: number) => void
}

export default function MatchingCardQuestion(props: MatchingCardProps) {
    const shuffledRight = useMemo(
        () => [...props.cards] .sort(() => Math.random() - 0.5),
        [props.cards.map((c) => c.id).join(",")]
    )

    const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
    const [selectedRight, setSelectedRight] = useState<number | null>(null)
    const [flashWrong, setFlashWrong] = useState(false)

    useEffect(() => {
        if (selectedLeft == null || selectedRight == null) return 

        if (selectedLeft === selectedRight) {
            props.onMatch(selectedLeft, selectedRight)
            setSelectedLeft(null)
            setSelectedRight(null)
        } else {
            setFlashWrong(true)
            const timer = setTimeout(() => {
                setFlashWrong(false)
                setSelectedLeft(null)
                setSelectedRight(null)
            }, 700)
            return () => clearTimeout(timer)
        }
    }, [selectedLeft, selectedRight, props.onMatch])

    const handleLeftClick = (id: number) => {
        if (props.matchedPairs[id] !== undefined) return
        setSelectedLeft((prev) => (prev === id ? null : id))
    }

    const handleRightClick = (id: number) => {
        const isAlreadyMatched = Object.values(props.matchedPairs).includes(id)
        if (isAlreadyMatched) return
        setSelectedRight((prev) => (prev === id ? null : id))
    }

    const matchedCount = Object.keys(props.matchedPairs).length

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
                <ArrowRight className="w-4 h-4 shrink-0" />
                Klik satu kartu kiri lalu pasangannya di kanan hingga semua terjodohkan.
            </div>
 
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50 border border-slate-100 py-1.5 rounded-lg">
                        Questions
                    </p>
          
                    {props.cards.map((card) => (
                        <MatchingCardButton
                            key={`left-${card.id}`}
                            imageUrl={card.left_image_url}
                            audioUrl={card.left_audio_url}
                            text={card.left_text}
                            isMatched={props.matchedPairs[card.id] !== undefined}
                            isSelected={selectedLeft === card.id}
                            isFlashing={flashWrong && selectedLeft === card.id}
                            onClick={() => handleLeftClick(card.id)}
                        />
                    ))}
                </div>
                
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50 border border-slate-100 py-1.5 rounded-lg">
                        Answers
                    </p>
                    
                    {shuffledRight.map((card) => (
                        <MatchingCardButton
                            key={`right-${card.id}`}
                            imageUrl={card.right_image_url}
                            audioUrl={card.right_audio_url}
                            text={card.right_text}
                            isMatched={Object.values(props.matchedPairs).includes(card.id)}
                            isSelected={selectedRight === card.id}
                            isFlashing={flashWrong && selectedRight === card.id}
                            onClick={() => handleRightClick(card.id)}
                        />
                    ))}
                </div>
            </div>
 
            <p className="text-xs text-center text-slate-400 font-medium">
                {matchedCount} / {props.cards.length} Card Matched
            </p>
        </div>
    )
}