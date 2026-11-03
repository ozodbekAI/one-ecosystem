import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import Lenis from "lenis";
import { getLenis, setLenis } from "@/lib/smooth-scroll";
import { isLiteDevice } from "@/lib/device";

/** Inertial smooth scrolling for wheel and trackpad; native scrolling on touch. */
export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    getLenis()?.resize();
  }, [pathname]);

  return null;
}

/** Film grain over everything and a soft light that trails the pointer. */
export function Atmosphere() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLiteDevice()) {
      document.documentElement.classList.add("lite");
      return;
    }
    const el = glowRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const tick = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.4 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} aria-hidden="true" className="cursor-glow" />
      <div aria-hidden="true" className="grain" />
    </>
  );
}
