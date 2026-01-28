export type UserRole = "teacher" | "student";

export type ExamType = "sql_testing" | "sql_only" | "testing_only";

export type ExamAttemptStatus = "in_progress" | "submitted" | "graded";

export type ViolationType =
  | "tab_switch"
  | "copy"
  | "paste"
  | "fullscreen_exit"
  | "devtools_open"
  | "mouse_leave"
  | "window_blur";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SqlQuestion {
  id: number;
  question: string;
  maxScore: number;
}

export interface SqlPart {
  mermaidCode: string;
  questions: SqlQuestion[];
}

export interface RuleTableRow {
  condition: string;
  result: string;
}

export interface TestingPart {
  scenario: string;
  rulesTable: RuleTableRow[];
  question: string;
  maxScore: number;
}

export interface ExamDataJson {
  sqlPart?: SqlPart;
  testingPart?: TestingPart;
}

export interface ExamSettings {
  allowReview: boolean;
  showSampleSolution: boolean;
  maxAttempts?: number;
}

export interface Exam {
  id: number;
  title: string;
  examType: ExamType;
  subject?: string;
  teacherId: number;
  duration: number;
  passingScore: number;
  examDataJson: ExamDataJson;
  aiGenerated: boolean;
  geminiModel?: string;
  settingsJson?: ExamSettings;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SqlAnswers {
  [questionId: string]: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualResult?: string;
}

export interface TestingAnswers {
  technique: string;
  explanation: string;
  testCases: TestCase[];
}

export interface AnswersJson {
  sqlPart?: SqlAnswers;
  testingPart?: TestingAnswers;
}

export interface SqlQuestionGrading {
  score: number;
  maxScore: number;
  feedback: string;
  correctSyntax: boolean;
  optimalQuery: boolean;
  issues?: string[];
  suggestions?: string[];
}

export interface TestingGrading {
  techniqueScore: number;
  testCasesScore: number;
  coverageScore: number;
  feedback: string;
  missingScenarios?: string[];
}

export interface AiGradingJson {
  sqlPart?: {
    [questionId: string]: SqlQuestionGrading;
  };
  testingPart?: TestingGrading;
  overallFeedback: string;
}

export interface ViolationLog {
  type: ViolationType;
  timestamp: string;
  details?: string;
}

export interface ExamAttempt {
  id: number;
  examId: number;
  studentId: number;
  answersJson: AnswersJson;
  score?: number;
  maxScore: number;
  percentage?: number;
  aiGradingJson?: AiGradingJson;
  tabSwitchCount: number;
  violationLogs: ViolationLog[];
  startedAt: string;
  submittedAt?: string;
  timeTaken?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExamGenerateRequest {
  examType: ExamType;
  customDomain?: string;
  difficulty?: "basic" | "intermediate" | "advanced";
}

export interface TaskStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: Exam;
  error?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}
