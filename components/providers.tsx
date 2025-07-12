"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { ListingsProvider } from "@/contexts/listings-context"
import { SessionProvider } from "@/components/session-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ListingsProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ListingsProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
