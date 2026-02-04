"use client";

import type { Variants } from "framer-motion";

/**
 * Stagger container - wrap children to create cascade animation effect.
 * Children using `springItem` or `fadeInItem` will animate one after another.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Spring-based fade-in animation for individual items.
 * Use inside a `staggerContainer` for cascading effect.
 */
export const springItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * Simple fade-in from top (for headers, navbars).
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

/**
 * Fade-in with scale effect (for cards, dialogs).
 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

/**
 * Continuous floating animation (for decorators, icons).
 */
export const floatAnimation: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
};

/**
 * Default viewport settings for scroll-triggered animations.
 * `once: true` prevents re-animation when scrolling back.
 */
export const defaultViewport = {
  once: true,
  margin: "-50px" as const,
};

/**
 * Shake animation for error feedback on forms.
 */
export const shakeAnimation: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut" as const,
    },
  },
};

/**
 * Blob floating animation for background decorative elements.
 * Creates organic, breathing movement.
 */
export const blobFloat: Variants = {
  animate: {
    x: [0, 30, -20, 0],
    y: [0, -40, 20, 0],
    scale: [1, 1.1, 0.95, 1],
    transition: {
      duration: 20,
      ease: "easeInOut" as const,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

/**
 * Secondary blob float with different timing for visual depth.
 */
export const blobFloatAlt: Variants = {
  animate: {
    x: [0, -25, 35, 0],
    y: [0, 30, -25, 0],
    scale: [1, 0.9, 1.15, 1],
    transition: {
      duration: 25,
      ease: "easeInOut" as const,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

/**
 * Pulse glow animation for focus states and CTAs.
 */
export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(var(--primary), 0)",
      "0 0 0 8px rgba(var(--primary), 0.1)",
      "0 0 0 0 rgba(var(--primary), 0)",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
};
