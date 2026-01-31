# Exam Attempts API

Base URL: `/api/v1`

## Authentication

Tất cả endpoints yêu cầu Bearer token trong header:

```
Authorization: Bearer <access_token>
```

Token lấy từ `POST /api/auth/login`.

---

## Enums

### AttemptStatus

| Value         | Description  |
| ------------- | ------------ |
| `in_progress` | Đang làm bài |
| `graded`      | Đã chấm điểm |

### ViolationType

| Value             | Description      |
| ----------------- | ---------------- |
| `tab_switch`      | Chuyển tab       |
| `fullscreen_exit` | Thoát fullscreen |
| `copy`            | Copy nội dung    |
| `paste`           | Paste nội dung   |
| `devtools_open`   | Mở DevTools      |

---

## 1. Start Exam

Bắt đầu làm bài thi. Nếu có attempt đang `in_progress`, trả về attempt đó thay vì tạo mới.

```
POST /api/v1/exams/{exam_id}/start
```

### Response 201

```json
{
  "attempt_id": 1,
  "exam_id": 5,
  "started_at": "2025-01-30T10:00:00Z",
  "duration": 90,
  "exam_data": {
    "sql_part": {
      "mermaid_code": "erDiagram...",
      "questions": ["Viết câu SQL...", "Viết câu SQL..."]
    },
    "testing_part": {
      "scenario": "Hệ thống đăng ký...",
      "rules_table": [{ "condition": "...", "result": "..." }],
      "question": "Thiết kế test cases..."
    }
  }
}
```

### Errors

| Status | Detail                    |
| ------ | ------------------------- |
| 404    | Đề thi không tồn tại      |
| 403    | Đề thi chưa được xuất bản |
| 403    | Đã hết lượt làm bài       |

---

## 2. Auto-save Answers

Lưu tạm câu trả lời (gọi mỗi 30s). Chỉ gửi fields đã thay đổi (partial update).

```
PATCH /api/v1/attempts/{attempt_id}/save
```

### Request Body

```json
{
  "answers": {
    "sql_part": {
      "question_1_answer": "SELECT * FROM users...",
      "question_2_answer": null
    },
    "testing_part": {
      "technique": "BVA",
      "explanation": "Chọn BVA vì...",
      "test_cases": [
        {
          "input": "age = 17",
          "expected_output": "Từ chối",
          "actual_result": null
        }
      ]
    }
  }
}
```

### Response 200

```json
{
  "id": 1,
  "exam_id": 5,
  "user_id": 10,
  "status": "in_progress",
  "answers": {...},
  "score": 0,
  "max_score": 100,
  "percentage": null,
  "tab_switch_count": 0,
  "fullscreen_exit_count": 0,
  "copy_paste_count": 0,
  "trust_score": 100,
  "started_at": "2025-01-30T10:00:00Z",
  "submitted_at": null,
  "time_taken": null,
  "created_at": "2025-01-30T10:00:00Z"
}
```

### Errors

| Status | Detail                         |
| ------ | ------------------------------ |
| 404    | Lượt làm bài không tồn tại     |
| 403    | Không có quyền cập nhật        |
| 400    | Bài đã nộp, không thể cập nhật |

---

## 3. Submit Exam

Nộp bài và trigger AI chấm điểm.

```
POST /api/v1/attempts/{attempt_id}/submit
```

### Request Body

```json
{
  "answers": {
    "sql_part": {
      "question_1_answer": "SELECT * FROM users WHERE age > 18",
      "question_2_answer": "SELECT COUNT(*) FROM orders GROUP BY user_id"
    },
    "testing_part": {
      "technique": "EP",
      "explanation": "Equivalence Partitioning phù hợp vì có nhiều lớp tương đương",
      "test_cases": [
        {
          "input": "age = 17",
          "expected_output": "Invalid",
          "actual_result": null
        },
        {
          "input": "age = 18",
          "expected_output": "Valid",
          "actual_result": null
        }
      ]
    }
  }
}
```

### Response 200

```json
{
  "attempt_id": 1,
  "exam_id": 5,
  "exam_title": "SQL & Testing Exam",
  "user_id": 10,
  "started_at": "2025-01-30T10:00:00Z",
  "submitted_at": "2025-01-30T11:15:00Z",
  "time_taken": 4500,
  "score": 75,
  "max_score": 100,
  "percentage": 75,
  "passed": true,
  "trust_score": 85,
  "violation_count": 2,
  "flagged_for_review": false,
  "grading": {
    "sql_part": {
      "question_1": {
        "score": 20,
        "max_score": 25,
        "feedback": "Logic đúng, cần tối ưu",
        "correct_syntax": true,
        "logic_correct": true,
        "optimal_query": false,
        "issues": ["Thiếu index hint"],
        "suggestions": ["Cân nhắc dùng EXPLAIN"]
      },
      "question_2": {...},
      "total_score": 40,
      "max_score": 50
    },
    "testing_part": {
      "technique_score": 8,
      "technique_correct": true,
      "explanation_score": 7,
      "test_cases_score": 15,
      "coverage_score": 5,
      "total_score": 35,
      "max_score": 50,
      "feedback": "Test cases bao phủ tốt các trường hợp chính",
      "missing_scenarios": ["Boundary age = 150"],
      "suggestions": ["Thêm negative test cases"]
    },
    "total_score": 75,
    "max_score": 100,
    "percentage": 75,
    "passed": true,
    "overall_feedback": "Kết quả tốt, cần cải thiện edge cases",
    "strengths": ["Hiểu đúng logic SQL", "Chọn đúng kỹ thuật test"],
    "improvements": ["Tối ưu query", "Thêm boundary tests"]
  }
}
```

### Errors

| Status | Detail                     |
| ------ | -------------------------- |
| 404    | Lượt làm bài không tồn tại |
| 403    | Không có quyền nộp bài     |
| 400    | Bài đã nộp trước đó        |
| 500    | Lỗi chấm điểm AI           |

---

## 4. Get Result

Xem kết quả bài thi đã nộp. User chỉ xem được của mình, Admin xem được tất cả.

```
GET /api/v1/attempts/{attempt_id}/result
```

### Response 200

Cấu trúc giống response của Submit Exam.

### Errors

| Status | Detail                     |
| ------ | -------------------------- |
| 404    | Lượt làm bài không tồn tại |
| 403    | Không có quyền xem         |
| 400    | Bài chưa được nộp          |

---

## 5. Log Violation

Ghi nhận vi phạm (tab switch, fullscreen exit, copy/paste...).

```
POST /api/v1/attempts/{attempt_id}/violations
```

### Request Body

```json
{
  "violation_type": "tab_switch",
  "timestamp": "2025-01-30T10:30:00Z",
  "details": "User switched to Chrome tab"
}
```

### Response 200

```json
{
  "success": true,
  "trust_score": 85,
  "tab_switch_count": 2,
  "fullscreen_exit_count": 0,
  "copy_paste_count": 0,
  "warning_level": "medium",
  "message": "Vui lòng không chuyển tab hoặc thoát fullscreen."
}
```

### Warning Levels

| Level      | Condition      | Action                |
| ---------- | -------------- | --------------------- |
| `none`     | 0 violations   | -                     |
| `low`      | 1 violation    | Thông báo nhẹ         |
| `medium`   | 2 violations   | Cảnh báo              |
| `high`     | 3-4 violations | Cảnh báo nghiêm trọng |
| `critical` | 5+ violations  | Đánh dấu xem xét      |

---

## 6. List Attempts (Admin)

Lấy danh sách lượt làm bài của một đề thi. Chỉ Admin.

```
GET /api/v1/exams/{exam_id}/attempts?skip=0&limit=20&status=graded
```

### Query Params

| Param  | Type   | Default | Description                     |
| ------ | ------ | ------- | ------------------------------- |
| skip   | int    | 0       | Offset                          |
| limit  | int    | 20      | Max 100                         |
| status | string | null    | Filter: `in_progress`, `graded` |

### Response 200

```json
{
  "items": [
    {
      "id": 1,
      "exam_id": 5,
      "user_id": 10,
      "user_name": "Nguyen Van A",
      "user_email": "a@example.com",
      "status": "graded",
      "score": 75,
      "max_score": 100,
      "percentage": 75,
      "trust_score": 85,
      "started_at": "2025-01-30T10:00:00Z",
      "submitted_at": "2025-01-30T11:15:00Z",
      "time_taken": 4500
    }
  ],
  "total": 50,
  "skip": 0,
  "limit": 20
}
```

---

## TypeScript Types

```typescript
// Answers
interface SQLPartAnswers {
  question_1_answer?: string | null;
  question_2_answer?: string | null;
}

interface TestCaseItem {
  input: string;
  expected_output: string;
  actual_result?: string | null;
}

interface TestingPartAnswers {
  technique?: string | null; // "EP" | "BVA" | "Decision Table" | "State Transition"
  explanation?: string | null;
  test_cases?: TestCaseItem[];
}

interface AnswersPayload {
  sql_part?: SQLPartAnswers | null;
  testing_part?: TestingPartAnswers | null;
}

// Exam Data
interface ExamData {
  sql_part?: {
    mermaid_code: string;
    questions: string[];
  } | null;
  testing_part?: {
    scenario: string;
    rules_table: { condition: string; result: string }[];
    question: string;
  } | null;
}

// Responses
interface AttemptStartResponse {
  attempt_id: number;
  exam_id: number;
  started_at: string;
  duration: number;
  exam_data: ExamData;
}

interface ViolationResponse {
  success: boolean;
  trust_score: number;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  copy_paste_count: number;
  warning_level: "none" | "low" | "medium" | "high" | "critical";
  message?: string | null;
}
```

---

## Frontend Integration Flow

```
1. User chọn đề thi → POST /exams/{exam_id}/start
2. Render exam_data (Mermaid ERD + questions)
3. Auto-save mỗi 30s → PATCH /attempts/{id}/save
4. Detect violations → POST /attempts/{id}/violations
5. User nộp bài → POST /attempts/{id}/submit
6. Hiển thị kết quả từ response
```
