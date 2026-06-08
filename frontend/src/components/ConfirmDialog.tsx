"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Loader2, LogOut, Trash2, X } from "lucide-react"

export type ConfirmDialogVariant = "danger" | "warning"

export interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: ConfirmDialogVariant
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

interface VariantConfig {
    iconWrapperClass: string
    iconClass: string
    confirmBtnClass: string
}

const VARIANT_CONFIG: Record<ConfirmDialogVariant, VariantConfig> = {
  danger: {
    iconWrapperClass: "bg-red-50 border border-red-100",
    iconClass: "text-red-500",
    confirmBtnClass:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800 text-white",
  },
  warning: {
    iconWrapperClass: "bg-amber-50 border border-amber-100",
    iconClass: "text-amber-500",
    confirmBtnClass:
      "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400 active:bg-amber-700 text-white",
  },
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => cancelBtnRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isLoading, onCancel])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const config = VARIANT_CONFIG[variant]
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* ── Dialog panel ─────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100">
        {/* Close ✕ button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Tutup dialog"
          className="
            absolute top-4 right-4
            p-1.5 rounded-lg text-slate-400
            hover:bg-slate-100 hover:text-slate-600
            transition-colors disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="p-6 pt-5">

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-lg font-bold text-slate-800 mb-2 pr-6"
          >
            {title}
          </h2>

          {/* Description */}
          <p
            id="confirm-dialog-description"
            className="text-sm text-slate-500 leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* ── Action row ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 pb-6">
          {/* Cancel — always the safe / left button */}
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-slate-100 text-slate-700
              hover:bg-slate-200 active:bg-slate-300
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
            "
          >
            {cancelLabel}
          </button>

          {/* Confirm — destructive, always the right button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed
              ${config.confirmBtnClass}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body  // ← portal target: renders outside any stacking context
  )
}