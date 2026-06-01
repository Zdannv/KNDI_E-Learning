"use client"

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AppLayout({
    children
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login")
        }
    }, [isLoading, user, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
                    <p className="text-slate-500 font-medium text-sm">Loading Session...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return <DashboardLayout>{children}</DashboardLayout>
}