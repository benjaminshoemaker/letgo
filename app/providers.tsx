"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { Toaster } from "sonner";

import { UiProvider } from "@/contexts/ui-context";
import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <UiProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              duration: 4000,
              className: "!text-sm",
            }}
          />
        </UiProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
