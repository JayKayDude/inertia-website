"use client";

import { createContext, useContext } from "react";
import { ScrollPhysicsEngine } from "@/lib/scrollPhysics";

export interface ScrollEngineContextValue {
  getEngine: () => ScrollPhysicsEngine | null;
  isInertiaActive: boolean;
  subscribeToScroll: (cb: (offset: number) => void) => () => void;
}

export const ScrollEngineContext = createContext<ScrollEngineContextValue>({
  getEngine: () => null,
  isInertiaActive: false,
  subscribeToScroll: () => () => {},
});

export function useScrollEngine() {
  return useContext(ScrollEngineContext);
}
