export type UserRole = "user" | "admin";

export type ExamType = "sql_testing" | "sql_only" | "testing_only";

export type ExamAttemptStatus = "in_progress" | "submitted" | "graded";

export type TaskStatus = "pending" | "completed" | "failed";

export type ViolationType =
  | "tab_switch"
  | "copy"
  | "paste"
  | "fullscreen_exit"
  | "devtools_open"
  | "mouse_leave"
  | "window_blur";

// UserOut từ OpenAPI spec (backend response)
export interface UserOut {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
}

// User interface cho frontend (có thể extend từ UserOut)
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
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

// TokenResponse
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export type AuthResponse = TokenResponse;

// Request types từ OpenAPI spec
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Error types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail: ValidationError[] | string;
}

export interface ApiError {
  detail: string | ValidationError[];
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
  exam_type?: ExamType;
  duration?: number;
  passing_score?: number;
  subject?: string | null;
}

export interface GenerationTaskResponse {
  task_id: string;
  status: TaskStatus;
}

export interface RuleTableItem {
  condition: string;
  result: string;
}

export interface ExamSQLPart {
  mermaid_code?: string;
  erd_diagram?: string;
  context?: string;
  questions?: string[];
  question_1?: string;
  question_2?: string;
  question_1_points?: number;
  question_2_points?: number;
}

export interface ExamTestingPart {
  scenario?: string;
  requirements?: string[];
  rules_table?: RuleTableItem[];
  question?: string;
  max_points?: number;
}

export interface ExamData {
  title?: string;
  sql_part?: ExamSQLPart;
  testing_part?: ExamTestingPart;
}

export interface ExamSettings {
  allow_review?: boolean;
  show_sample_solution?: boolean;
  max_attempts?: number;
}

export interface ExamOut {
  id: number;
  title: string;
  exam_type: ExamType;
  subject: string | null;
  created_by: number;
  duration: number;
  passing_score: number;
  exam_data: ExamData;
  ai_generated: boolean;
  gemini_model: string;
  settings: ExamSettings | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ExamListItem {
  id: number;
  title: string;
  exam_type: ExamType;
  subject: string | null;
  created_by: number;
  duration: number;
  passing_score: number;
  ai_generated: boolean;
  is_published: boolean;
  created_at: string;
  last_attempt_status?: string | null;
  last_attempt_score?: number | null;
  last_attempt_id?: number | null;
  last_attempt_at?: string | null;
  recent_attempt_score?: number | null;
  recent_attempt_at?: string | null;
}

export interface ExamListResponse {
  items: ExamListItem[];
  exams?: ExamOut[];
  total: number;
  skip: number;
  limit: number;
}

export interface GenerationStatusResponse {
  status: TaskStatus;
  progress?: number;
  exam_id?: number;
  exam?: ExamOut;
  error?: string;
}

export interface ExamListParams {
  skip?: number;
  limit?: number;
  exam_type?: ExamType;
  is_published?: boolean;
}

export interface ExamSettingsUpdate {
  allow_review?: boolean;
  show_sample_solution?: boolean;
  max_attempts?: number | null;
}

export interface ExamUpdateData {
  title?: string;
  subject?: string;
  duration?: number;
  passing_score?: number;
  is_published?: boolean;
  settings?: ExamSettingsUpdate;
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
}

export interface ExamGenerateFormData {
  exam_type: ExamType;
  duration: number;
  passing_score: number;
  subject?: string;
}

// ========== ATTEMPT API TYPES ==========

export type AttemptStatus = "in_progress" | "graded";
export type WarningLevel = "none" | "low" | "medium" | "high" | "critical";

/** Response from POST /exams/{exam_id}/start */
export interface AttemptStartResponse {
  attempt_id: number;
  exam_id: number;
  started_at: string;
  duration: number;
  exam_data: ExamData;
}

/** Response from PATCH /attempts/{attempt_id}/save */
export interface AttemptSaveResponse {
  id: number;
  exam_id: number;
  user_id: number;
  status: AttemptStatus;
  answers: AnswersPayload;
  score: number;
  max_score: number;
  percentage: number | null;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  copy_paste_count: number;
  trust_score: number;
  started_at: string;
  submitted_at: string | null;
  time_taken: number | null;
  created_at: string;
}

/** Request body for POST /attempts/{attempt_id}/violations */
export interface ViolationRequest {
  violation_type: ViolationType;
  timestamp: string;
  details?: string;
}

/** Response from POST /attempts/{attempt_id}/violations */
export interface ViolationResponse {
  success: boolean;
  trust_score: number;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  copy_paste_count: number;
  warning_level: WarningLevel;
  message?: string;
}

/** Answers payload for save/submit */
export interface AnswersPayload {
  sql_part?: {
    question_1_answer?: string | null;
    question_2_answer?: string | null;
  } | null;
  testing_part?: {
    technique?: string | null;
    explanation?: string | null;
    test_cases?: TestCaseItem[];
  } | null;
}

export interface TestCaseItem {
  input: string;
  expected_output: string;
  actual_result?: string | null;
}

/** User's submitted answers for result display */
export interface SubmittedAnswers {
  sql_part?: {
    question_1_answer?: string | null;
    question_2_answer?: string | null;
  } | null;
  testing_part?: {
    technique?: string | null;
    explanation?: string | null;
    test_cases?: TestCaseItem[];
  } | null;
}

/** Response from POST /attempts/{attempt_id}/submit and GET /attempts/{attempt_id}/result */
export interface ExamSubmitResponse {
  attempt_id: number;
  exam_id: number;
  exam_title: string;
  user_id: number;
  started_at: string;
  submitted_at: string;
  time_taken: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  trust_score: number;
  violation_count: number;
  flagged_for_review: boolean;
  grading: ExamGrading;
  submitted_answers?: SubmittedAnswers | null;
  coin_reward?: number | null;
  coin_balance_after?: number | null;
  reward_breakdown?: {
    base_reward: number;
    performance_bonus?: number;
    speed_bonus?: number;
    perfect_score_bonus?: number;
  } | null;
}

export interface ExamGrading {
  sql_part?: SqlPartGrading;
  testing_part?: TestingPartGradingResult;
  total_score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  overall_feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface SqlPartGrading {
  question_1?: SqlQuestionGradingResult;
  question_2?: SqlQuestionGradingResult;
  total_score: number;
  max_score: number;
}

export interface SqlQuestionGradingResult {
  score: number;
  max_score: number;
  feedback: string;
  correct_syntax: boolean;
  logic_correct: boolean;
  optimal_query: boolean;
  issues?: string[];
  suggestions?: string[];
}

export interface TestingPartGradingResult {
  technique_score: number;
  technique_correct: boolean;
  explanation_score: number;
  test_cases_score: number;
  coverage_score: number;
  total_score: number;
  max_score: number;
  feedback: string;
  missing_scenarios?: string[];
  suggestions?: string[];
}

export interface UserAttemptHistoryItem {
  id: number;
  exam_id: number;
  exam_title: string;
  exam_type: ExamType;
  status: ExamAttemptStatus;
  score: number;
  max_score: number;
  percentage: number | null;
  passed: boolean;
  passing_score: number;
  trust_score: number;
  started_at: string;
  submitted_at: string | null;
  time_taken: number | null;
}

export interface UserAttemptHistoryResponse {
  items: UserAttemptHistoryItem[];
  total: number;
}

// ========== GAMIFICATION TYPES ==========

export interface UserProgression {
  coin_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

export type CoinTransactionType = "exam_reward" | "hint_purchase";

export interface CoinTransaction {
  id: number;
  type: CoinTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  created_at: string;
  meta?: {
    exam_title?: string;
    question_key?: string;
    hint_level?: number;
  };
}

export interface HintCatalogItem {
  level: number;
  cost: number;
  preview: string;
  content?: string;
  is_purchased: boolean;
  is_locked: boolean;
}

export interface HintPurchaseRequest {
  question_key: string;
  hint_level: number;
}

export interface HintPurchaseResponse {
  hint_content: string;
  coin_spent: number;
  new_balance: number;
}

export interface PurchasedHint {
  question_key: string;
  hint_level: number;
  hint_content: string;
  coin_cost: number;
}

export interface CoinRewardBreakdown {
  base_reward: number;
  score_bonus: number;
  trust_bonus: number;
  hint_penalty: number;
}

export interface CoinReward {
  total_earned: number;
  breakdown: CoinRewardBreakdown;
}
