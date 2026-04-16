"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  done: Record<string, true>;
  markDone: (id: string) => void;
  reset: () => void;
  hasHydrated: boolean;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      hasHydrated: false,
      markDone: (id) =>
        set((state) => ({ done: { ...state.done, [id]: true } })),
      reset: () => set({ done: {} }),
    }),
    {
      name: "probe:progress",
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);

export function isAvailable(
  prerequisites: string[],
  done: Record<string, true>,
): boolean {
  return prerequisites.every((p) => done[p]);
}

export function statusOf(
  id: string,
  prerequisites: string[],
  done: Record<string, true>,
): "done" | "available" | "suggested" {
  if (done[id]) return "done";
  return isAvailable(prerequisites, done) ? "available" : "suggested";
}

export function missingPrerequisites(
  prerequisites: string[],
  done: Record<string, true>,
): string[] {
  return prerequisites.filter((p) => !done[p]);
}
