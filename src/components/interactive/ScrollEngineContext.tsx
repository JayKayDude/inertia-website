"use client";

import { createContext, useContext } from "react";
import { ScrollPhysicsEngine } from "@/lib/scrollPhysics";

export interface ScrollEngineContextValue {
  getEngine: () => ScrollPhysicsEngine | null;
  isInertiaActive: boolean;
}

export const ScrollEngineContext = createContext<ScrollEngineContextValue>({
  getEngine: () => null,
  isInertiaActive: false,
});

export function useScrollEngine() {
  return useContext(ScrollEngineContext);
}
