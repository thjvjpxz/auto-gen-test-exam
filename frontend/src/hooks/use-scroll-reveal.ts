"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useCallback,
  type RefObject,
} from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
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
  const [isIntersecting, setIsIntersecting] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsIntersecting(false);
        }
      });
    },
    [once],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, prefersReducedMotion, handleIntersection]);

  // If user prefers reduced motion, always show revealed state
  const isRevealed = prefersReducedMotion || isIntersecting;

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
