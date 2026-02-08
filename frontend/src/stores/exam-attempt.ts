import { create } from "zustand";
import type {
  ExamData,
  AnswersPayload,
  ViolationType,
  WarningLevel,
} from "@/types";

interface ViolationLog {
  type: ViolationType;
  timestamp: string;
  details?: string;
}

type SaveStatus = "idle" | "saving" | "saved";
type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

const VIOLATION_THRESHOLDS = {
  LOW_WARNING: 1,
  HIGH_WARNING: 3,
  FORCE_SUBMIT: 5,
} as const;

interface ExamAttemptState {
  attemptId: number | null;
  examId: number | null;
  examData: ExamData | null;
  startedAt: string | null;
  duration: number;
  answers: AnswersPayload;
  localSaveStatus: SaveStatus;
  serverSyncStatus: SyncStatus;
  lastSyncedAt: string | null;
  violations: ViolationLog[];
  trustScore: number;
  warningLevel: WarningLevel;
  shouldForceSubmit: boolean;

  initAttempt: (data: {
    attemptId: number;
    examId: number;
    examData: ExamData;
    startedAt: string;
    duration: number;
    existingAnswers?: AnswersPayload;
  }) => void;
  updateSqlAnswer: (questionKey: string, value: string) => void;
  updateTestingAnswer: (field: string, value: unknown) => void;
  updateTestCases: (testCases: AnswersPayload["testing_part"]) => void;
  setLocalSaveStatus: (status: SaveStatus) => void;
  setServerSyncStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (timestamp: string) => void;
  addViolation: (violation: ViolationLog) => void;
  updateTrustScore: (score: number, level: WarningLevel) => void;
  clearForceSubmit: () => void;
  reset: () => void;
}

const initialState = {
  attemptId: null,
  examId: null,
  examData: null,
  startedAt: null,
  duration: 0,
  answers: {},
  localSaveStatus: "idle" as SaveStatus,
  serverSyncStatus: "idle" as SyncStatus,
  lastSyncedAt: null,
  violations: [] as ViolationLog[],
  trustScore: 100,
  warningLevel: "none" as WarningLevel,
  shouldForceSubmit: false,
};

/**
 * Calculates warning level based on violation count.
 * Per spec: 1-2 = low/medium, 3-4 = high, 5+ = critical (force submit)
 */
function calculateWarningLevel(count: number): WarningLevel {
  if (count >= VIOLATION_THRESHOLDS.FORCE_SUBMIT) return "critical";
  if (count >= VIOLATION_THRESHOLDS.HIGH_WARNING) return "high";
  if (count >= VIOLATION_THRESHOLDS.LOW_WARNING + 1) return "medium";
  if (count >= VIOLATION_THRESHOLDS.LOW_WARNING) return "low";
  return "none";
}

/**
 * Zustand store for exam attempt state management.
 * Handles answers, save status, violations, and proctoring data.
 */
export const useExamAttemptStore = create<ExamAttemptState>((set) => ({
  ...initialState,

  initAttempt: ({
    attemptId,
    examId,
    examData,
    startedAt,
    duration,
    existingAnswers,
  }) =>
    set({
      attemptId,
      examId,
      examData,
      startedAt,
      duration,
      answers: existingAnswers ?? {},
      localSaveStatus: "idle",
      serverSyncStatus: "idle",
      violations: [],
      trustScore: 100,
      warningLevel: "none",
      shouldForceSubmit: false,
    }),

  updateSqlAnswer: (questionKey, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        sql_part: {
          ...state.answers.sql_part,
          [questionKey]: value,
        },
      },
      localSaveStatus: "idle",
    })),

  updateTestingAnswer: (field, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        testing_part: {
          ...state.answers.testing_part,
          [field]: value,
        },
      },
      localSaveStatus: "idle",
    })),

  updateTestCases: (testingPart) =>
    set((state) => ({
      answers: {
        ...state.answers,
        testing_part: testingPart,
      },
      localSaveStatus: "idle",
    })),

  setLocalSaveStatus: (status) => set({ localSaveStatus: status }),

  setServerSyncStatus: (status) => set({ serverSyncStatus: status }),

  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),

  addViolation: (violation) =>
    set((state) => {
      const newViolations = [...state.violations, violation];
      const count = newViolations.length;
      const newWarningLevel = calculateWarningLevel(count);
      const shouldForce = count >= VIOLATION_THRESHOLDS.FORCE_SUBMIT;

      return {
        violations: newViolations,
        warningLevel: newWarningLevel,
        shouldForceSubmit: shouldForce,
      };
    }),

  updateTrustScore: (score, level) =>
    set({ trustScore: score, warningLevel: level }),

  clearForceSubmit: () => set({ shouldForceSubmit: false }),

  reset: () => set(initialState),
}));
