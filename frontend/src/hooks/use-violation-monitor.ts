import { useEffect, useCallback, useRef } from "react";
import { useLogViolation } from "./attempt";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { ViolationType, ViolationRequest } from "@/types";

/**
 * Violation monitoring hook with session-based tracking.
 * Only counts one violation per "leave page" session.
 * Resets when user returns to the page.
 */
export function useViolationMonitor(attemptId: number | null) {
  const logViolation = useLogViolation();
  const addViolation = useExamAttemptStore((s) => s.addViolation);
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);

  const isActiveRef = useRef(true);
  const attemptIdRef = useRef(attemptId);
  const addViolationRef = useRef(addViolation);
  const logViolationRef = useRef(logViolation);

  // Track if user has left the page (to avoid duplicate violations)
  const hasLeftPageRef = useRef(false);

  useEffect(() => {
    isActiveRef.current = true;
    attemptIdRef.current = attemptId;
    addViolationRef.current = addViolation;
    logViolationRef.current = logViolation;
  }, [attemptId, addViolation, logViolation]);

  const reportViolation = useCallback(
    (type: ViolationType, details?: string) => {
      if (!isActiveRef.current) return;

      const violation: ViolationRequest = {
        violation_type: type,
        timestamp: new Date().toISOString(),
        details,
      };

      addViolationRef.current({
        type,
        timestamp: violation.timestamp,
        details,
      });

      if (attemptIdRef.current) {
        logViolationRef.current.mutate({
          attemptId: attemptIdRef.current,
          violation,
        });
      }
    },
    [],
  );

  /**
   * Handle page leave - only report once per leave session.
   * Combines tab_switch and window_blur into single "leave" violation.
   */
  const handlePageLeave = useCallback(
    (type: ViolationType, details: string) => {
      if (!hasLeftPageRef.current) {
        hasLeftPageRef.current = true;
        reportViolation(type, details);
      }
    },
    [reportViolation],
  );

  const handlePageReturn = useCallback(() => {
    hasLeftPageRef.current = false;
  }, []);

  // Tab switch / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePageLeave("tab_switch", "User switched to another tab");
      } else {
        handlePageReturn();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handlePageLeave, handlePageReturn]);

  // Window blur/focus
  useEffect(() => {
    const handleBlur = () => {
      handlePageLeave("window_blur", "Window lost focus");
    };

    const handleFocus = () => {
      handlePageReturn();
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [handlePageLeave, handlePageReturn]);

  // Copy/Paste detection - these are always counted individually
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

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  return { reportViolation, warningLevel };
}
