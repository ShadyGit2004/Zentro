"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 45 * 1000,
            gcTime: 5 * 60 * 1000,

            retry: (failureCount, error: any) => {
              const status = error?.response?.status;

              // Auth/client errors ko retry mat karo
              if (
                status === 400 || 
                status === 401 || 
                status === 403 || 
                status === 404 ||
                status === 422
              ) {
                return false;
              }

              // Network / 5xx errors ko max 2 retries
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
