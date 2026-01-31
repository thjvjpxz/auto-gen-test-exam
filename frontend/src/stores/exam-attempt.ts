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

interface ExamAttemptState {
  attemptId: number | null;
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

  initAttempt: (data: {
    attemptId: number;
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
  reset: () => void;
}

const initialState = {
  attemptId: null,
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
};

/**
 * Zustand store for exam attempt state management.
 * Handles answers, save status, violations, and proctoring data.
 */
export const useExamAttemptStore = create<ExamAttemptState>((set) => ({
  ...initialState,

  initAttempt: ({
    attemptId,
    examData,
    startedAt,
    duration,
    existingAnswers,
  }) =>
    set({
      attemptId,
      examData,
      startedAt,
      duration,
      answers: existingAnswers ?? {},
      localSaveStatus: "idle",
      serverSyncStatus: "idle",
      violations: [],
      trustScore: 100,
      warningLevel: "none",
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
    set((state) => ({
      violations: [...state.violations, violation],
    })),

  updateTrustScore: (score, level) =>
    set({ trustScore: score, warningLevel: level }),

  reset: () => set(initialState),
}));
