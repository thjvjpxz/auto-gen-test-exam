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
  const retryQueueRef = useRef<AnswersPayload[]>([]);
  const answersRef = useRef(answers);
  const isFirstRender = useRef(true);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const storageKey = `exam_draft_${STORAGE_VERSION}_${attemptId}`;

  // Layer 1: localStorage (debounce 500ms)
  useEffect(() => {
    if (!attemptId || isFirstRender.current) {
      isFirstRender.current = false;
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
    if (!attemptId || isFirstRender.current) return;

    if (!isOnline) {
      setServerSyncStatus("offline");
      retryQueueRef.current.push(answers);
      return;
    }

    setServerSyncStatus("syncing");

    const timer = setTimeout(async () => {
      try {
        await attemptService.saveAnswers(attemptId, answers);
        setServerSyncStatus("synced");
        setLastSyncedAt(new Date().toISOString());
      } catch {
        retryQueueRef.current.push(answers);
        setServerSyncStatus("error");
      }
    }, SERVER_SYNC_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [answers, attemptId, isOnline, setServerSyncStatus, setLastSyncedAt]);

  // Retry queue processor - runs when back online
  useEffect(() => {
    if (!isOnline || !attemptId || retryQueueRef.current.length === 0) return;

    const processQueue = async () => {
      const latestAnswers = answersRef.current;
      retryQueueRef.current = [];

      try {
        setServerSyncStatus("syncing");
        await attemptService.saveAnswers(attemptId, latestAnswers);
        setServerSyncStatus("synced");
        setLastSyncedAt(new Date().toISOString());
      } catch {
        retryQueueRef.current.push(latestAnswers);
        setServerSyncStatus("error");
      }
    };

    processQueue();
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
