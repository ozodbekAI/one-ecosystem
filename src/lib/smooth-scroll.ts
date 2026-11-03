import type Lenis from "lenis";

let instance: Lenis | null = null;

/** The running smooth-scroll instance (null with reduced motion or before mount). */
export function getLenis() {
  return instance;
}

export function setLenis(next: Lenis | null) {
  instance = next;
}
