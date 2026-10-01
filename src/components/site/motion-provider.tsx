"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Rispetta "riduci animazioni" del sistema operativo: niente spostamenti, solo dissolvenze.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
