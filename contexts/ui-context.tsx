"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ItemsFilter = "all" | "TODO" | "DONE";

type UiState = {
  itemsFilter: ItemsFilter;
  setItemsFilter: (next: ItemsFilter) => void;
};

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [itemsFilter, setItemsFilter] = useState<ItemsFilter>("all");

  const value = useMemo<UiState>(() => ({ itemsFilter, setItemsFilter }), [itemsFilter]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}

