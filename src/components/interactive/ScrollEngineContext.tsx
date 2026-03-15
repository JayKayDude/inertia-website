"use client";

import { createContext, useContext } from "react";
import { ScrollPhysicsEngine } from "@/lib/scrollPhysics";

export interface ScrollEngineContextValue {
  getEngine: () => ScrollPhysicsEngine | null;
  isInertiaActive: boolean;
  subscribeToScroll: (cb: (offset: number) => void) => () => void;
  scrollToOffset: (offset: number) => void;
}

export const ScrollEngineContext = createContext<ScrollEngineContextValue>({
  getEngine: () => null,
  isInertiaActive: false,
  subscribeToScroll: () => () => {},
  scrollToOffset: () => {},
});

export function useScrollEngine() {
  return useContext(ScrollEngineContext);
}
