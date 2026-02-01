import { useEffect, useRef, useCallback } from "react";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import { attemptService } from "@/services/attempt";
import { useOnlineStatus } from "./use-online-status";
import type { AnswersPayload } from "@/types";

const LOCAL_SAVE_DEBOUNCE = 500;
const SERVER_SYNC_DEBOUNCE = 3000;
const STORAGE_VERSION = "v1";

/**
 * Two-layer auto-save hook.
 * Layer 1: localStorage (immediate, offline-capable)
 * Layer 2: Server sync (debounced, with retry queue)
 */
export function useAutoSave(attemptId: number | null) {
  const answers = useExamAttemptStore((s) => s.answers);
  const setLocalSaveStatus = useExamAttemptStore((s) => s.setLocalSaveStatus);
  const setServerSyncStatus = useExamAttemptStore((s) => s.setServerSyncStatus);
  const setLastSyncedAt = useExamAttemptStore((s) => s.setLastSyncedAt);

  const isOnline = useOnlineStatus();
  const pendingRetryRef = useRef<AnswersPayload | null>(null);
  const answersRef = useRef(answers);
  const previousAttemptIdRef = useRef<number | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const storageKey = `exam_draft_${STORAGE_VERSION}_${attemptId}`;

  // Layer 1: localStorage (debounce 500ms)
  useEffect(() => {
    // Skip first render or when attemptId just changed (initialization)
    if (!attemptId || previousAttemptIdRef.current !== attemptId) {
      previousAttemptIdRef.current = attemptId;
      return;
    }

    setLocalSaveStatus("saving");

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(answers));
        setLocalSaveStatus("saved");
      } catch {
        console.error("Failed to save to localStorage");
      }
    }, LOCAL_SAVE_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [answers, attemptId, storageKey, setLocalSaveStatus]);

  // Layer 2: Server sync (debounce 3s)
  useEffect(() => {
    if (!attemptId || previousAttemptIdRef.current !== attemptId) return;

    if (!isOnline) {
      setServerSyncStatus("offline");
      // Only keep latest answers for retry, not accumulate
      pendingRetryRef.current = answers;
      return;
    }

    setServerSyncStatus("syncing");

    const timer = setTimeout(async () => {
      try {
        await attemptService.saveAnswers(attemptId, answers);
        setServerSyncStatus("synced");
        setLastSyncedAt(new Date().toISOString());
        pendingRetryRef.current = null;
      } catch {
        // Only keep latest answers for retry, not accumulate
        pendingRetryRef.current = answers;
        setServerSyncStatus("error");
      }
    }, SERVER_SYNC_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [answers, attemptId, isOnline, setServerSyncStatus, setLastSyncedAt]);

  // Retry processor - runs when back online
  useEffect(() => {
    if (!isOnline || !attemptId || !pendingRetryRef.current) return;

    const processRetry = async () => {
      const latestAnswers = answersRef.current;
      pendingRetryRef.current = null;

      try {
        setServerSyncStatus("syncing");
        await attemptService.saveAnswers(attemptId, latestAnswers);
        setServerSyncStatus("synced");
        setLastSyncedAt(new Date().toISOString());
      } catch {
        pendingRetryRef.current = latestAnswers;
        setServerSyncStatus("error");
      }
    };

    processRetry();
  }, [isOnline, attemptId, setServerSyncStatus, setLastSyncedAt]);

  // Save before unload
  useEffect(() => {
    if (!attemptId) return;

    const handleBeforeUnload = () => {
      localStorage.setItem(storageKey, JSON.stringify(answersRef.current));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attemptId, storageKey]);

  const recoverFromLocal = useCallback((): AnswersPayload | null => {
    if (!attemptId) return null;

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [attemptId, storageKey]);

  const clearLocalDraft = useCallback(() => {
    if (attemptId) {
      localStorage.removeItem(storageKey);
    }
  }, [attemptId, storageKey]);

  return { recoverFromLocal, clearLocalDraft };
}
