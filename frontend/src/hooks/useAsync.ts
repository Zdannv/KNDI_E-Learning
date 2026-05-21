import { useCallback, useEffect, useRef, useState } from "react"

export interface AsyncState<T> {
    data: T | null
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useAsync<T>(
    fn: () => Promise<T>,
    deps: unknown[] = []
): AsyncState<T> {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tick, setTick] = useState(0)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        setIsLoading(true)
        setError(null)

        fn().then((result) => {
            if (!cancelled && mountedRef.current) {
                setData(result)
                setIsLoading(false)
            }
        }).catch((err: unknown) => {
            if (!cancelled && mountedRef.current) {
                const message = err instanceof Error ? err.message : "An unexpected error occured"
                setError(message)
                setIsLoading(false)
            }
        })
        
        return () => {
            cancelled = true
        }
    }, [tick, ...deps])

    const refetch = useCallback(() => setTick((t) => t + 1), [])

    return { data, isLoading, error, refetch }
}