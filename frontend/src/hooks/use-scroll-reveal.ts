"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Observes an element and returns true when it enters the viewport.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @param options - IntersectionObserver configuration
 * @returns A tuple of [ref, isRevealed]
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
): [RefObject<T | null>, boolean] {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once = true,
  } = options;

  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  return [ref, isRevealed];
}

/**
 * Hook for staggered reveal animations on multiple elements.
 * Returns refs and reveal states for a specified count of items.
 *
 * @param count - Number of items to observe
 * @param staggerDelay - Delay between each item's reveal (ms)
 * @param options - IntersectionObserver configuration
 */
export function useStaggeredReveal(
  count: number,
  staggerDelay: number = 100,
  options: UseScrollRevealOptions = {},
): {
  containerRef: RefObject<HTMLDivElement | null>;
  isContainerRevealed: boolean;
  getItemDelay: (index: number) => string;
} {
  const [containerRef, isContainerRevealed] =
    useScrollReveal<HTMLDivElement>(options);

  const getItemDelay = (index: number): string => {
    return `${index * staggerDelay}ms`;
  };

  return { containerRef, isContainerRevealed, getItemDelay };
}
