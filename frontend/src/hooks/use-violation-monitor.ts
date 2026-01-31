import { useEffect, useCallback, useRef } from "react";
import { useLogViolation } from "./attempt";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { ViolationType, ViolationRequest } from "@/types";

/**
 * Violation monitoring hook.
 * Detects: tab switch, window blur, copy, paste, devtools.
 */
export function useViolationMonitor(attemptId: number | null) {
  const logViolation = useLogViolation();
  const addViolation = useExamAttemptStore((s) => s.addViolation);
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);
  const isActive = useRef(true);

  const reportViolation = useCallback(
    (type: ViolationType, details?: string) => {
      if (!isActive.current) return;

      const violation: ViolationRequest = {
        violation_type: type,
        timestamp: new Date().toISOString(),
        details,
      };

      addViolation({ type, timestamp: violation.timestamp, details });

      if (attemptId) {
        logViolation.mutate({ attemptId, violation });
      }
    },
    [attemptId, logViolation, addViolation],
  );

  // Tab switch / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation("tab_switch", "User switched to another tab");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [reportViolation]);

  // Window blur
  useEffect(() => {
    const handleBlur = () => {
      reportViolation("window_blur", "Window lost focus");
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [reportViolation]);

  // Copy/Paste detection
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation("copy", "Attempted to copy content");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation("paste", "Attempted to paste content");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [reportViolation]);

  // DevTools detection (basic resize heuristic)
  useEffect(() => {
    const threshold = 160;
    let devToolsOpen = false;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const isOpen = widthDiff > threshold || heightDiff > threshold;

      if (isOpen && !devToolsOpen) {
        devToolsOpen = true;
        reportViolation("devtools_open", "DevTools detected");
      } else if (!isOpen) {
        devToolsOpen = false;
      }
    };

    window.addEventListener("resize", checkDevTools);
    return () => window.removeEventListener("resize", checkDevTools);
  }, [reportViolation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActive.current = false;
    };
  }, []);

  return { reportViolation, warningLevel };
}
