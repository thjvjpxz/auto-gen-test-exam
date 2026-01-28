# 📋 Tech Spec - Hệ Thống Thi CNTT Online với AI

**Version:** 1.0  
**Ngày tạo:** 28/01/2026  
**Mục đích:** Phát triển web app từ Telegram bot hiện tại thành nền tảng thi CNTT (SQL & Testing) online

---

## 🎯 Tổng Quan Dự Án

### Context Hiện Tại

**Telegram Bot tự động sinh đề thi CNTT:**

- ✅ Dùng **Gemini AI** (Google GenAI) để sinh đề
- ✅ Đề thi gồm 2 phần:
  - **Phần 1: SQL & Database** (ERD diagram với Mermaid + câu hỏi SQL)
  - **Phần 2: Testing** (Kỹ thuật kiểm thử hộp đen, bảng quyết định)
- ✅ Xuất PDF qua Telegram (`/gen` command)
- ✅ Code Python hiện tại: `core/ai_generator.py`, `render/pdf_exporter.py`

### Mục Tiêu Mới

Chuyển từ Telegram Bot → **Web App đầy đủ** với:

- 🎯 Sinh đề thi CNTT tự động (tái sử dụng logic Gemini AI hiện tại)
- 🎯 Chế độ làm bài có giám sát (timer, chống gian lận)
- 🎯 AI tự động chấm điểm các câu trả lời tự luận (SQL queries, test cases)
- 🎯 Quản lý đề thi, sinh viên, kết quả

### Người Dùng

- **Giáo viên/Giảng viên CNTT:** Tạo đề SQL/Testing, xem kết quả sinh viên
- **Sinh viên CNTT:** Làm bài thi, xem điểm & feedback

---

## 🏗️ Kiến Trúc Hệ Thống

### Architecture Pattern

**Clean Separation Architecture: Frontend UI Only + Backend All Business Logic**

```
┌─────────────────────────────────────────────┐
│         Frontend: Next.js 16                │
│     (UI ONLY - No Business Logic)           │
│  - Server Components (rendering)            │
│  - Client Components (interactivity)        │
│  - NO Database Access                       │
│  - NO Auth Logic                            │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┼──────────┐
        │      │          │
      REST    REST    WebSocket
       API     API    (Real-time)
        │      │          │
┌───────▼──────▼──────────▼────────────┐
│   Backend: FastAPI (Python)          │
│   (ALL Business Logic)                │
│  - Auth: JWT (python-jose)            │
│  - Database: SQLAlchemy ORM           │
│  - AI generation (Gemini)             │
│  - Auto grading logic                 │
│  - Anti-cheating logic                │
│  - WebSocket server (Socket.io)       │
│  - Background tasks (Celery)          │
└──────────────┬───────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼────┐ ┌──▼───┐  ┌──▼─────┐
│PostgreSQL│Redis │  │Gemini  │
│        │ │      │  │  API   │
│- Exams │ │-Cache│  │-Gen AI │
│- Users │ │-Queue│  │-Grading│
│-Results│ │-Lock │  │        │
└────────┘ └──────┘  └────────┘
```

### Communication Flow

1. **Đồng bộ (Synchronous):** Next.js UI → FastAPI REST API → SQLAlchemy → PostgreSQL
2. **Bất đồng bộ (Async):** FastAPI → Celery (Redis broker) → Gemini AI → Database
3. **Real-time:** Next.js Client ↔ FastAPI WebSocket Server (timer, violations)

### Nguyên Tắc Phân Chia

**Frontend (Next.js):**

- ✅ Rendering UI components
- ✅ Form validation (Zod - client-side)
- ✅ Browser APIs (fullscreen, visibilitychange)
- ✅ WebSocket client
- ❌ NO database queries
- ❌ NO authentication logic (chỉ lưu token)
- ❌ NO business logic

**Backend (FastAPI):**

- ✅ ALL authentication (JWT generation, validation)
- ✅ ALL database operations (CRUD)
- ✅ ALL business logic (grading, scoring, trust score)
- ✅ ALL AI integration (Gemini API calls)
- ✅ WebSocket server (broadcast timer, violations)
- ✅ Background jobs (Celery)

---

## 💻 Tech Stack Chi Tiết

### Frontend Stack

#### Core Framework

| Technology     | Version | Lý do chọn                                                                                                                                        |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**    | 16.1.5  | - App Router với Server Components (chỉ rendering)<br>- Turbopack build siêu nhanh<br>- SEO tốt, performance cao<br>- **CHỈ làm UI, gọi FastAPI** |
| **React**      | 19.0.0  | - Latest với React Compiler<br>- Better hooks, transitions                                                                                        |
| **TypeScript** | 5.6.3   | - Type safety cho types/interfaces<br>- Match với Pydantic models                                                                                 |

#### HTTP Client

| Technology                | Version | Lý do chọn                                                                               |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| **axios**                 | 1.6.0   | - REST API client cho FastAPI<br>- Interceptors cho JWT token<br>- Better error handling |
| **@tanstack/react-query** | 5.0.0   | - Data fetching & caching<br>- Auto refetch<br>- Optimistic updates                      |

#### UI & Styling

| Technology       | Version | Lý do chọn                                                                                            |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| **shadcn/ui**    | Latest  | - Copy-paste components<br>- Radix UI primitives (accessible)<br>- TailwindCSS<br>- Customizable 100% |
| **TailwindCSS**  | 3.4.0   | - Utility-first CSS<br>- Performance tốt<br>- Design system chuẩn                                     |
| **Radix UI**     | Various | Headless components (Dialog, Toast, etc)                                                              |
| **lucide-react** | 0.303.0 | Icon library đẹp, tree-shakeable                                                                      |

#### Form Handling & Validation

| Technology              | Version | Lý do chọn                                                                                 |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------ |
| **React Hook Form**     | 7.66.0  | - Performance cao (uncontrolled)<br>- Validation tích hợp<br>- DevTools support            |
| **Zod**                 | 3.22.4  | - TypeScript schema validation<br>- Type inference tự động<br>- Server + client validation |
| **@hookform/resolvers** | 3.3.4   | Zod adapter cho RHF                                                                        |

#### Real-time & State Management

| Technology           | Version | Lý do chọn                                                                                          |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| **socket.io-client** | 4.6.1   | - WebSocket client kết nối FastAPI<br>- Timer sync, violations alerts<br>- Auto reconnect           |
| **Zustand**          | 4.5.0   | - Client state (exam progress, timer)<br>- Lightweight, no boilerplate<br>- Persist to localStorage |

---

### Backend Stack

#### Core Framework

| Technology   | Version  | Lý do chọn                                                                                                                                |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **FastAPI**  | 0.115.13 | - **TOÀN BỘ business logic**<br>- Async/await native<br>- Auto OpenAPI docs<br>- WebSocket built-in<br>- Tái sử dụng code Python hiện tại |
| **Uvicorn**  | 0.27.0   | ASGI server hiệu năng cao                                                                                                                 |
| **Pydantic** | 2.5.3    | - Request/response validation<br>- Type hints → export TypeScript types<br>- Config management                                            |

#### Database & ORM

| Technology     | Version | Lý do chọn                                                                                          |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| **PostgreSQL** | 16+     | - ACID compliant<br>- JSONB support (exam_data, answers)<br>- Full-text search<br>- Mature & stable |
| **SQLAlchemy** | 2.0+    | - **Backend ORM chính**<br>- Async support<br>- Relationships, migrations<br>- Connection pooling   |
| **Alembic**    | 1.13.0  | - Database migrations<br>- Version control cho schema                                               |
| **asyncpg**    | 0.29.0  | - Async PostgreSQL driver<br>- Nhanh hơn psycopg2                                                   |
| **Redis**      | 7+      | - Cache<br>- Session store<br>- Celery broker<br>- Rate limiting                                    |

#### AI & Background Jobs

| Technology              | Version | Lý do chọn                                                                        |
| ----------------------- | ------- | --------------------------------------------------------------------------------- |
| **google-generativeai** | 0.8.6   | **Gemini AI SDK** - đang dùng trong bot hiện tại                                  |
| **Celery**              | 5.3.4   | - Background tasks<br>- Async AI generation<br>- Retry logic<br>- Task scheduling |
| **celery[redis]**       | 5.3.4   | Redis broker cho Celery                                                           |

#### Security

| Technology           | Version | Lý do chọn              |
| -------------------- | ------- | ----------------------- |
| **python-jose**      | 3.3.0   | JWT token handling      |
| **passlib[bcrypt]**  | 1.7.4   | Password hashing secure |
| **python-multipart** | 0.0.6   | Form data parsing       |

#### WebSocket & Real-time

| Technology            | Version | Lý do chọn                                                              |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| **python-socketio**   | 5.10.0  | - WebSocket server cho FastAPI<br>- Room support<br>- Namespace support |
| **uvicorn[standard]** | 0.27.0  | WebSocket support                                                       |

#### CORS & Middleware

| Technology       | Version  | Lý do chọn                        |
| ---------------- | -------- | --------------------------------- |
| **fastapi-cors** | Built-in | CORS cho Next.js frontend         |
| **slowapi**      | 0.1.9    | Rate limiting (chống spam AI API) |

---

## 🗄️ Database Schema

### Tables Overview

#### 1. **users**

```
- id: SERIAL PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- name: TEXT NOT NULL
- password_hash: TEXT NOT NULL
- role: ENUM('teacher', 'student') NOT NULL
- avatar_url: TEXT
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP
```

#### 2. **exams**

```
- id: SERIAL PRIMARY KEY
- title: TEXT NOT NULL              // VD: "Đề thi CSDL & Kiểm thử - Hệ thống Quản lý Gym"
- exam_type: ENUM('sql_testing', 'sql_only', 'testing_only') DEFAULT 'sql_testing'
- subject: TEXT                     // VD: "Database & Software Testing"
- teacher_id: INTEGER REFERENCES users(id)
- duration: INTEGER NOT NULL        // phút
- passing_score: INTEGER DEFAULT 60
- exam_data_json: JSONB NOT NULL
  Structure: {
    sql_part: {
      mermaid_code: string,         // ERD diagram code
      questions: string[]           // Câu hỏi SQL (tự luận)
    },
    testing_part: {
      scenario: string,             // Mô tả tình huống
      rules_table: [{               // Bảng quy tắc
        condition: string,
        result: string
      }],
      question: string              // Yêu cầu (tự luận)
    }
  }
- ai_generated: BOOLEAN DEFAULT TRUE
- gemini_model: TEXT DEFAULT 'gemini-2.5-flash-lite'
- settings_json: JSONB
  {
    allow_review: boolean,
    show_sample_solution: boolean,
    max_attempts: number
  }
- is_published: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP
```

#### 3. **exam_attempts**

```
- id: SERIAL PRIMARY KEY
- exam_id: INTEGER REFERENCES exams(id) ON DELETE CASCADE
- student_id: INTEGER REFERENCES users(id)
- answers_json: JSONB NOT NULL
  Structure: {
    sql_part: {
      question_1_answer: string,    // SQL query sinh viên viết
      question_2_answer: string
    },
    testing_part: {
      technique: string,            // Kỹ thuật chọn (EP, BVA, Decision Table, etc)
      explanation: string,          // Giải thích lý do chọn
      test_cases: [{                // Danh sách test cases
        input: string,
        expected_output: string,
        actual_result?: string
      }]
    }
  }
- score: DECIMAL(5,2)              // Điểm tổng
- max_score: DECIMAL(5,2) DEFAULT 100
- percentage: DECIMAL(5,2)
- ai_grading_json: JSONB
  Structure: {
    sql_part: {
      question_1: {
        score: number,
        feedback: string,
        correct_syntax: boolean,
        optimal_query: boolean
      },
      question_2: { ... }
    },
    testing_part: {
      technique_score: number,
      test_cases_score: number,
      feedback: string,
      suggestions: string[]
    },
    overall_feedback: string
  }
- tab_switch_count: INTEGER DEFAULT 0
- violation_logs: JSONB
  [{
    type: 'tab_switch' | 'copy' | 'paste' | 'fullscreen_exit',
    timestamp: ISO string,
    details: string
  }]
- started_at: TIMESTAMP DEFAULT NOW()
- submitted_at: TIMESTAMP
- time_taken: INTEGER (seconds)
- ip_address: TEXT
- user_agent: TEXT
```

#### 4. **exam_invitations** (optional - cho private exams)

```
- id: SERIAL PRIMARY KEY
- exam_id: INTEGER REFERENCES exams(id)
- student_id: INTEGER REFERENCES users(id)
- invited_by: INTEGER REFERENCES users(id)
- status: ENUM('pending', 'accepted', 'completed')
- invited_at: TIMESTAMP DEFAULT NOW()
```

#### 5. **ai_generation_logs** (tracking AI usage)

```
- id: SERIAL PRIMARY KEY
- user_id: INTEGER REFERENCES users(id)
- exam_id: INTEGER REFERENCES exams(id)
- prompt: TEXT
- model: TEXT
- tokens_used: INTEGER
- cost: DECIMAL(10,4)
- duration_ms: INTEGER
- created_at: TIMESTAMP DEFAULT NOW()
```

### Relations

```
users (1) ----< (N) exams (teacher creates exams)
users (1) ----< (N) exam_attempts (student takes exams)
exams (1) ----< (N) exam_attempts (exam has many attempts)
```

---

## 🎨 UI/UX Components

### shadcn/ui Components Cần Thiết

#### Forms & Inputs

- ✅ **Form** - Wrapper với context
- ✅ **Input** - Text inputs
- ✅ **Textarea** - Long text
- ✅ **Select** - Dropdowns
- ✅ **RadioGroup** - Multiple choice
- ✅ **Checkbox** - Boolean options
- ✅ **Label** - Field labels
- ✅ **Button** - Actions

#### Feedback

- ✅ **Toast** - Notifications
- ✅ **Alert** - Warnings/errors
- ✅ **Progress** - Loading states
- ✅ **Skeleton** - Loading placeholders

#### Overlays

- ✅ **Dialog** - Modals
- ✅ **AlertDialog** - Confirmations
- ✅ **Sheet** - Side panels
- ✅ **Popover** - Tooltips/menus

#### Data Display

- ✅ **Table** - Data tables
- ✅ **DataTable** - With sorting/filtering
- ✅ **Badge** - Status tags
- ✅ **Card** - Content containers
- ✅ **Tabs** - Tab navigation

#### Navigation

- ✅ **Breadcrumb** - Navigation trail
- ✅ **Pagination** - Page navigation
- ✅ **Command** - Search/command palette

---

## 🔒 Authentication Flow

### Session Strategy

**JWT-based** với FastAPI Backend (python-jose)

#### Login Flow

```
1. User nhập email/password (Next.js form)
2. Next.js → POST /api/auth/login (FastAPI)
3. FastAPI:
   - Query user từ PostgreSQL (SQLAlchemy)
   - passlib.verify(password, hash)
   - Generate JWT token (python-jose)
   - Return { access_token, user_data }
4. Next.js:
   - Lưu token vào cookie (httpOnly) hoặc localStorage
   - Lưu user data vào Zustand store
   - Redirect to dashboard
```

#### Protected Routes

**Backend (FastAPI):**

- Dependency injection để verify JWT token
- Extract user từ token payload
- Validate permissions theo role
- Return 401 nếu unauthorized

**Frontend (Next.js):**

- Middleware kiểm tra token existence
- Redirect to /login nếu không có token
- Axios interceptor tự động attach token vào headers
- Handle 401 response → redirect login

#### Role-Based Access Control (RBAC)

```
Teacher:
  ✅ Create/edit/delete exams
  ✅ View all attempts
  ✅ View analytics
  ❌ Take exams

Student:
  ✅ View available exams
  ✅ Take exams
  ✅ View own results
  ❌ Create exams
  ❌ View others' results
```

---

## 🔌 API Endpoints Overview

### Authentication

```
POST   /api/auth/register          # Đăng ký (email, password, name, role)
POST   /api/auth/login             # Đăng nhập → JWT token
POST   /api/auth/refresh           # Refresh token
GET    /api/auth/me                # Get current user info
POST   /api/auth/logout            # Logout (invalidate token)
```

### Exams (Teacher)

```
GET    /api/exams                  # List exams (filter, sort, pagination)
POST   /api/exams                  # Create exam manually
POST   /api/exams/generate         # AI generate exam → task_id
GET    /api/tasks/{task_id}        # Poll generation status
GET    /api/exams/{id}             # Get exam details
PATCH  /api/exams/{id}             # Update exam (title, settings, publish)
DELETE /api/exams/{id}             # Delete exam
```

### Exams (Student)

```
GET    /api/exams/available        # List published exams (student view)
GET    /api/exams/{id}/preview     # Preview exam (before start)
POST   /api/exams/{id}/start       # Start exam → create attempt
```

### Exam Attempts

```
GET    /api/attempts/{id}          # Get attempt details
PATCH  /api/attempts/{id}/save     # Auto-save answers (partial)
POST   /api/attempts/{id}/submit   # Submit exam → trigger AI grading
POST   /api/violations             # Log violation
```

### Results

```
GET    /api/attempts/{id}/result   # Get grading result
GET    /api/exams/{id}/attempts    # List attempts for exam (teacher)
GET    /api/exams/{id}/analytics   # Analytics data
GET    /api/exams/{id}/export      # Export CSV/PDF
```

### WebSocket Events

```
Client → Server:
  - join_exam(exam_id, student_id)
  - heartbeat(timestamp)
  - violation(type, details)

Server → Client:
  - timer_update(remaining_seconds)
  - violation_warning(message, severity)
  - force_submit(reason)
```

---

## 🤖 AI Integration

### AI Provider

**Google Gemini** (giữ nguyên như code hiện tại)

#### Models

- **Exam Generation:** Gemini 2.5 Flash Lite (fast, cost-effective)
- **Grading SQL/Testing:** Gemini 2.5 Flash Thinking (reasoning, analysis)

### Use Cases

#### 1. Exam Generation (Tái sử dụng logic hiện tại)

**Endpoint:** `POST /api/ai/generate-exam`

**Input:**

- `exam_type`: 'sql_testing' | 'sql_only' | 'testing_only'
- `custom_domain` (optional): VD "Hệ thống quản lý khách sạn"
- `difficulty` (optional): 'basic' | 'intermediate' | 'advanced'
- `teacher_id`: ID của giáo viên

**Process:**

1. User click "Generate Exam" (giáo viên)
2. Next.js Server Action → FastAPI endpoint
3. FastAPI → Celery task (async)
4. Celery → **Tái sử dụng `core/ai_generator.py`**
5. Gemini API với MASTER_PROMPT (đã có trong code)
6. Parse JSON response (có sẵn validation)
7. Save to DB (exams table)
8. Return exam_id + preview data

**Prompt Template:**
Sử dụng **MASTER_PROMPT hiện tại** trong `core/ai_generator.py` (dòng 14-108):

- ✅ Chọn ngẫu nhiên lĩnh vực (10+ nhóm)
- ✅ Thiết kế ERD 4-6 bảng với Mermaid
- ✅ Tạo câu hỏi SQL (cơ bản → nâng cao)
- ✅ Tạo bài toán Testing (EP, BVA, Decision Table, State Transition)
- ✅ Output JSON structure:
  - `exam_title`: "Đề thi CSDL & Kiểm thử - [Domain]"
  - `sql_part`:
    - `mermaid_code`: ERD diagram (Mermaid syntax)
    - `questions`: Array câu hỏi SQL
  - `testing_part`:
    - `scenario`: Mô tả tình huống
    - `rules_table`: Array quy tắc {condition, result}
    - `question`: Yêu cầu thiết kế test cases

#### 2. Auto Grading (SQL & Testing Answers)

**Endpoint:** `POST /api/ai/grade-exam`

**Request Body:**

- `attempt_id`: ID của exam attempt
- `exam_data`: Dữ liệu đề thi từ exams.exam_data_json
- `student_answers`:
  - `sql_part`:
    - `question_1_answer`: SQL query sinh viên viết
    - `question_2_answer`: SQL query câu 2
  - `testing_part`:
    - `technique`: Kỹ thuật testing chọn
    - `explanation`: Giải thích lý do
    - `test_cases`: Array test cases

**Response:**

- `score`: Tổng điểm
- `max_score`: 100
- `percentage`: Phần trăm điểm
- `grading_details`:
  - `sql_part`: Chi tiết chấm từng câu SQL
    - `question_X`: {score, max_score, feedback, issues[]}
  - `testing_part`:
    - `technique_score`: Điểm chọn kỹ thuật
    - `test_cases_score`: Điểm thiết kế test cases
    - `coverage_score`: Điểm coverage
    - `feedback`: Nhận xét tổng quát
    - `missing_scenarios`: Các scenarios thiếu
- `overall_feedback`: Feedback tổng thể

**AI Grading Prompts:**

**Cho SQL:**

```
Đề bài SQL: {sql_question}
ERD Schema: {mermaid_code}

Câu trả lời của sinh viên:
{student_sql_query}

Hãy chấm điểm (0-25) dựa trên:
1. Syntax đúng (5 điểm)
2. Logic query chính xác (10 điểm)
3. Hiệu suất (sử dụng JOIN, index tối ưu) (5 điểm)
4. Best practices (alias, formatting) (5 điểm)

Output JSON:
{
  "score": number,
  "feedback": string,
  "issues": string[],
  "suggestions": string[]
}
```

**Cho Testing:**

```
Tình huống: {testing_scenario}
Bảng quy tắc: {rules_table}

Câu trả lời sinh viên:
- Kỹ thuật: {technique}
- Giải thích: {explanation}
- Test cases: {test_cases}

Chấm điểm (0-50):
1. Chọn kỹ thuật phù hợp (10 điểm)
2. Giải thích lý do (10 điểm)
3. Test cases đủ coverage (20 điểm)
4. Xác định edge cases (10 điểm)

Output JSON:
{
  "technique_score": number,
  "test_cases_score": number,
  "coverage_score": number,
  "feedback": string,
  "missing_scenarios": string[]
}
```

---

## ⏱️ Real-time Features

### WebSocket Implementation

#### Use Cases

1. **Exam Timer Sync**
2. **Tab Switch Detection Alerts**
3. **Live Violation Monitoring**

#### Socket.io Events

**Client → Server:**

- `join_exam` - Join exam room với examId, studentId
- `ping` - Heartbeat mỗi 5s
- `violation` - Log vi phạm (type, timestamp)
- `answer_submitted` - Thông báo đã save answer

**Server → Client:**

- `timer_update` - Cập nhật thời gian còn lại
- `violation_warning` - Cảnh báo vi phạm (message, severity: low/high)
- `force_submit` - Bắt buộc nộp bài (reason)

---

## 🛡️ Anti-Cheating System

### Detection Methods

#### 1. Tab Visibility Detection

**Browser API:** `document.visibilitychange`

**Logic:**

- Detect khi user chuyển tab/window
- Increment switch count
- Log violation → WebSocket → Backend
- Thresholds:
  - 1-2 lần: Warning toast
  - 3-4 lần: Serious warning dialog
  - 5+ lần: Auto-submit + flag for review

#### 2. Fullscreen Enforcement

**Browser API:** `Element.requestFullscreen()`

**Logic:**

- Bắt buộc fullscreen khi start exam
- Detect exit fullscreen event
- Log violation + show warning
- Option: Force re-enter hoặc auto-submit

#### 3. Copy/Paste Prevention

**Browser Events:** `copy`, `paste`, `cut`, `contextmenu`, `keydown`

**Logic:**

- Disable clipboard operations
- Disable right-click menu
- Block Ctrl+C/V/X/U keyboard shortcuts
- Log attempts vào violations

#### 4. Browser DevTools Detection

**Method:** Window size comparison

**Logic:**

- So sánh outerWidth/Height vs innerWidth/Height
- Nếu chênh lệch > threshold → DevTools mở
- Log violation mỗi 1s khi detected

#### 5. Mouse/Focus Tracking

**Browser Events:** `mouseleave`, `blur`

**Logic:**

- Track khi mouse rời window
- Track khi window mất focus
- Lighter penalty (trust score deduction nhỏ hơn)

### Violation Scoring System

**Violation Weights:**

- `tab_switch`: -10 điểm
- `fullscreen_exit`: -8 điểm
- `devtools_open`: -15 điểm
- `copy/paste`: -12 điểm
- `mouse_leave`: -3 điểm
- `window_blur`: -5 điểm

**Trust Score Calculation:**

- Bắt đầu: 100 điểm
- Mỗi violation trừ theo weight
- Trust score = 100 - sum(violation_weights)
- Nếu trust score < 50 → Flag for teacher review

---

## 📊 Features Specification

### 1. Dashboard (Teacher)

#### Overview Cards

- 📝 Total Exams Created
- 👥 Total Students
- ✅ Total Attempts
- 📈 Average Score

#### Recent Exams Table

**Columns:**

- Title
- Subject
- Questions Count
- Attempts
- Avg Score
- Status (Published/Draft)
- Actions (Edit, Delete, View Results)

**Features:**

- Search by title
- Filter by subject
- Sort by date/attempts
- Pagination

#### Analytics Charts

- 📊 Score distribution (histogram)
- 📈 Attempts over time (line chart)
- 🎯 Pass/fail rate (pie chart)

---

### 2. Create Exam (Teacher)

#### Form Fields

**Basic Info:**

- `title` (optional): Auto-generated hoặc custom
- `exam_type`: 'sql_testing' | 'sql_only' | 'testing_only'
- `subject`: Default "Database & Software Testing"

**Exam Settings:**

- `duration`: Thời gian (phút), default 90
- `passing_score`: Điểm đạt (%), default 60
- `max_attempts` (optional): Giới hạn số lần làm, null = unlimited

**AI Generation Options:**

- `generation_mode`: 'auto' | 'custom'
- `custom_domain` (optional): VD "Hệ thống đặt vé máy bay"
- `difficulty` (optional): 'basic' | 'intermediate' | 'advanced'

**Settings:**

- `allow_review`: Cho phép xem lại bài làm
- `show_sample_solution`: Hiện đáp án mẫu sau khi nộp

#### AI Generation Flow (Simplified)

1. Teacher click **"Generate New Exam"** (Next.js UI)
2. Chọn options trong form:
   - Exam type (SQL+Testing, chỉ SQL, chỉ Testing)
   - Custom domain (optional)
   - Difficulty level
3. Click **"Generate"** → Next.js gọi POST /api/exams/generate (FastAPI)

4. **FastAPI Backend:**
   - Validate request (Pydantic)
   - Create Celery task (async)
   - Return task_id ngay lập tức

   **Celery Worker:**
   - Call core/ai_generator.py (code hiện tại)
   - Gemini API (gemini-2.5-flash-lite)
   - Parse JSON response
   - SQLAlchemy: Save to exams table
   - Update task status → "completed"

5. **Next.js Frontend:**
   - Poll GET /api/tasks/{task_id} (mỗi 2s)
   - Show progress spinner
   - Khi completed → fetch exam data
6. **Preview Generated Exam:**
   - Hiển thị ERD (Mermaid diagram client-side)
   - Hiển thị SQL questions
   - Hiển thị Testing scenario + rules
7. **Teacher actions:**
   - ✅ **Publish:** PATCH /api/exams/{id} set is_published=true
   - 🔄 **Regenerate:** POST /api/exams/generate lại
   - ✏️ **Edit (future):** PUT /api/exams/{id}
8. **Published** → Students có thể làm bài

#### No Manual Entry (MVP)

- **Tất cả đề thi đều AI-generated**
- Lý do: Đề SQL/Testing phức tạp, khó nhập manual
- Future: Có thể thêm editor cho ERD/questions

---

### 3. Exam List (Student)

#### Display

- Grid/List view toggle
- Each exam card shows:
  - Title (VD: "Đề thi CSDL & Kiểm thử - Quản lý Gym")
  - Exam type badge (SQL+Testing / SQL only / Testing only)
  - Duration (90 phút)
  - Domain/Topic (Database, Testing)
  - Attempts: X/Y (if limited)
  - Status: Not started / In progress / Completed
  - **"Start Exam"** button

#### Filters

- Exam type (All / SQL+Testing / SQL only / Testing only)
- Status (All / Available / Completed)
- Search by keyword (trong title)

---

### 4. Take Exam (Student)

#### Pre-Exam Screen

```
┌──────────────────────────────────────┐
│  Đề thi CSDL & Kiểm thử              │
│  Hệ thống Quản lý Gym                │
│                                      │
│  Duration: 90 phút                   │
│  Sections: SQL (2 câu) + Testing    │
│  Attempts: 2/3                       │
│                                      │
│  ⚠️ Rules:                           │
│  - Không chuyển tab (max 3 lần)     │
│  - Fullscreen required               │
│  - No copy/paste trong exam          │
│  - Câu trả lời là TỰ LUẬN           │
│                                      │
│  [Ready? Start Exam]                 │
└──────────────────────────────────────┘
```

#### Exam Interface (SQL Part)

```
┌───────────────────────────────────────────┐
│  Timer: ⏱️ 82:15 remaining      [Submit] │
├───────────────────────────────────────────┤
│  PHẦN 1: SQL & DATABASE (50 điểm)        │
│                                           │
│  [ERD Diagram Rendered Here]             │
│  (Mermaid diagram hiển thị database)     │
│                                           │
│  Câu 1 (25đ): Viết query SQL để...       │
│  ┌─────────────────────────────────────┐ │
│  │ SELECT ...                          │ │
│  │                                     │ │
│  │                                     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│  (Code editor với syntax highlighting)   │
│                                           │
│  Câu 2 (25đ): Viết query SQL để...       │
│  ┌─────────────────────────────────────┐ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  [← Back]  [Next: Testing Part →]        │
└───────────────────────────────────────────┘
```

#### Exam Interface (Testing Part)

```
┌───────────────────────────────────────────┐
│  Timer: ⏱️ 78:30 remaining      [Submit] │
├───────────────────────────────────────────┤
│  PHẦN 2: TESTING (50 điểm)               │
│                                           │
│  Tình huống: [Scenario text]             │
│                                           │
│  Bảng quy tắc:                           │
│  ┌─────────────────┬──────────────────┐  │
│  │ Điều kiện       │ Kết quả          │  │
│  ├─────────────────┼──────────────────┤  │
│  │ Rule 1...       │ Result...        │  │
│  └─────────────────┴──────────────────┘  │
│                                           │
│  Câu hỏi: [Question text]                │
│                                           │
│  1. Kỹ thuật kiểm thử phù hợp:           │
│  ○ Equivalence Partitioning              │
│  ○ Boundary Value Analysis               │
│  ○ Decision Table Testing                │
│  ○ State Transition Testing              │
│                                           │
│  2. Giải thích lý do chọn:               │
│  ┌─────────────────────────────────────┐ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  3. Thiết kế test cases (min 5 cases):   │
│  [Dynamic form: Add/Remove test case]    │
│  ┌───────────────┬───────────────────┐   │
│  │ Input         │ Expected Output   │   │
│  ├───────────────┼───────────────────┤   │
│  │ ...           │ ...               │   │
│  └───────────────┴───────────────────┘   │
│  [+ Add Test Case]                       │
│                                           │
│  [← Back to SQL]  [Submit Exam]          │
└───────────────────────────────────────────┘
```

#### Features

- ✅ Auto-save answers (every 30s to localStorage + DB)
- ✅ Section navigation (SQL ↔ Testing)
- ✅ Timer warning (10 min, 5 min, 1 min left)
- ✅ Auto-submit on timeout
- ✅ Confirm before submit modal
- ✅ Code editor cho SQL (Monaco Editor hoặc CodeMirror)
- ✅ Dynamic test case form (add/remove rows)

---

### 5. Results Page (Student)

#### Summary Card

```
┌──────────────────────────────────────┐
│  Your Score: 78/100 (78%)            │
│  Time Taken: 85m 12s                 │
│  Status: PASSED ✅                   │
│  Trust Score: 92/100 (2 tab switches)│
└──────────────────────────────────────┘
```

#### Score Breakdown

```
┌──────────────────────────────────────┐
│  📊 Score Details                    │
│                                      │
│  SQL Part: 42/50 (84%)               │
│    • Question 1: 22/25               │
│    • Question 2: 20/25               │
│                                      │
│  Testing Part: 36/50 (72%)           │
│    • Technique Selection: 8/10       │
│    • Explanation: 7/10               │
│    • Test Cases: 15/20               │
│    • Coverage: 6/10                  │
└──────────────────────────────────────┘
```

#### AI Feedback (SQL)

```
┌──────────────────────────────────────┐
│  💬 SQL Câu 1 Feedback (22/25)       │
│                                      │
│  ✅ Điểm tốt:                        │
│  - Syntax chính xác                  │
│  - Sử dụng INNER JOIN đúng           │
│  - Có WHERE clause logic             │
│                                      │
│  ⚠️ Cần cải thiện:                   │
│  - Thiếu ORDER BY để sắp xếp kết quả │
│  - Có thể tối ưu với INDEX           │
│                                      │
│  💡 Gợi ý:                           │
│  SELECT t1.*, t2.name                │
│  FROM table1 t1                      │
│  INNER JOIN table2 t2 ON ...         │
│  ORDER BY t1.created_at DESC         │
└──────────────────────────────────────┘
```

#### AI Feedback (Testing)

```
┌──────────────────────────────────────┐
│  💬 Testing Part Feedback (36/50)    │
│                                      │
│  ✅ Kỹ thuật chọn đúng:              │
│  - Decision Table phù hợp với bài    │
│  - Giải thích logic rõ ràng          │
│                                      │
│  ⚠️ Test cases thiếu:                │
│  - Chưa cover edge case: giá trị âm │
│  - Thiếu test cho boundary values    │
│  - Chưa test null/empty input        │
│                                      │
│  📝 Missing scenarios:               │
│  1. Input: -100 → Expected: Error    │
│  2. Input: 0 → Boundary case         │
│  3. Input: MAX_INT → Upper bound     │
│                                      │
│  💡 Suggestions:                     │
│  - Luôn test giá trị biên            │
│  - Kết hợp EP + BVA cho bài này      │
└──────────────────────────────────────┘
```

#### Answer Review (Expandable)

- **SQL Answers:**
  - Show student's query
  - Highlight syntax errors (if any)
  - Show sample optimal solution (if enabled)
- **Testing Answers:**
  - Show selected technique + explanation
  - Display test cases table
  - Highlight missing cases

---

### 6. Results Management (Teacher)

#### Attempt Details

- Student info
- Timestamp
- Score
- Time taken
- Trust score
- Violation logs (expandable)
- Answer review

#### Bulk Actions

- Export to CSV
- Send feedback emails
- Download PDF reports

---

## 🚀 Deployment Architecture

### Frontend (Next.js)

**Platform:** Vercel

**Config (vercel.json):**

- Framework: nextjs
- Build: `npm run build`
- Dev: `npm run dev`

**Environment Variables:**

- `NEXT_PUBLIC_API_URL`: FastAPI backend URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

**Regions:**

- Primary: Singapore (sin1)
- Fallback: Tokyo (hnd1)

---

### Backend (FastAPI)

**Platform:** Railway

**Config (railway.toml):**

- Builder: NIXPACKS
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Healthcheck: `/health` endpoint
- Restart policy: ON_FAILURE

**Environment Variables:**

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `JWT_SECRET`: Secret key cho JWT signing
- `CORS_ORIGINS`: Frontend domain (Vercel URL)

---

### Database

**Platform:** Neon (Serverless PostgreSQL)

**Tier:** Free → Pro

- Free: 0.5GB storage, 1 compute unit
- Pro: 10GB storage, autoscaling

**Connection:**

- Format: `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`
- Connection Pooling: PgBouncer (built-in)

---

### Cache/Queue

**Platform:** Upstash Redis

**Tier:** Free → Pay-as-you-go

- Free: 10K requests/day
- Paid: $0.2/100K requests

**Use Cases:**

- Session storage
- Celery broker
- Rate limiting
- Cache API responses

---

### File Storage (Optional)

**Platform:** Vercel Blob

**Use Cases:**

- User avatars
- Exported PDFs
- Uploaded images (questions)

**Pricing:** $0.15/GB/month

---

## 📈 Performance Targets

### Frontend

- ✅ First Contentful Paint (FCP): < 1.5s
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ Time to Interactive (TTI): < 3.5s
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ Lighthouse Score: > 90

### Backend

- ✅ API Response Time (p95): < 200ms
- ✅ AI Generation: < 30s (async)
- ✅ Database Query: < 50ms
- ✅ WebSocket Latency: < 100ms

### Scalability

- ✅ Support 1000 concurrent exam takers
- ✅ Handle 100 exams/day generation
- ✅ Store 10K+ exam attempts

---

## 🔐 Security Considerations

### Authentication

- ✅ JWT with HTTP-only cookies
- ✅ CSRF protection (SameSite=Strict)
- ✅ Bcrypt password hashing (cost: 12)
- ✅ Password strength validation
- ✅ Rate limiting on auth endpoints

### Authorization

- ✅ Role-based access control (RBAC)
- ✅ Resource ownership validation
- ✅ API endpoint protection

### Data Protection

- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (sanitize inputs)
- ✅ CORS configuration
- ✅ Input validation (Zod + Pydantic)
- ✅ File upload validation

### Privacy

- ✅ GDPR compliance (data export/deletion)
- ✅ Encrypt sensitive data at rest
- ✅ Audit logs for admin actions
- ✅ Anonymize analytics

---

## 🧪 Testing Strategy

### Frontend Testing

**Unit Tests:**

- Vitest + Testing Library
- Component testing
- Hook testing
- Utility functions

**E2E Tests:**

- Playwright
- Critical user journeys (login → create exam → take exam → view results)
- Cross-browser testing

### Backend Testing

**Unit Tests:**

- pytest
- API endpoint testing
- Business logic testing
- Pydantic model validation

**Integration Tests:**

- Database operations (SQLAlchemy)
- AI API mocking (Gemini responses)
- WebSocket events
- Celery tasks

### Coverage Target

- ✅ Unit: > 80%
- ✅ Integration: > 60%
- ✅ E2E: Critical paths

---

## 📊 Monitoring & Logging

### Frontend

- **Vercel Analytics:** Web Vitals, page views
- **Sentry:** Error tracking, performance monitoring

### Backend

- **Railway Logs:** Application logs
- **LogTail:** Structured logging
- **Uptime Robot:** Health checks

### Metrics to Track

**Business Metrics:**

- Daily active users (DAU)
- Exams created/day
- Exam completion rate
- Average exam score
- AI generation success rate

**Technical Metrics:**

- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connection pool usage
- Redis cache hit rate
- Celery queue length & task duration

---

## 💰 Cost Estimation

### Development Phase (Free Tier)

| Service        | Free Tier                            | Cost         |
| -------------- | ------------------------------------ | ------------ |
| Vercel         | Unlimited hobby                      | $0           |
| Railway        | $5 credit/mo                         | $0           |
| Neon DB        | 0.5GB                                | $0           |
| Upstash Redis  | 10K req/day                          | $0           |
| **Gemini API** | **Free tier: 15 RPM, 1M tokens/day** | **$0** 🎉    |
| **Total**      |                                      | **$0/mo** ✅ |

### Production (50 students, 5 teachers)

| Service        | Usage                 | Cost        |
| -------------- | --------------------- | ----------- |
| Vercel         | Pro plan              | $20/mo      |
| Railway        | ~15GB-hours           | $7/mo       |
| Neon           | Pro plan              | $19/mo      |
| Upstash        | 500K requests         | $5/mo       |
| **Gemini API** | **Free tier đủ dùng** | **$0**      |
| **Total**      |                       | **~$51/mo** |

### Scale (500 students, 50 teachers)

| Service        | Usage                         | Cost         |
| -------------- | ----------------------------- | ------------ |
| Vercel         | Pro plan                      | $20/mo       |
| Railway        | ~100GB-hours                  | $50/mo       |
| Neon           | Pro plan                      | $69/mo       |
| Upstash        | 5M requests                   | $30/mo       |
| **Gemini API** | Pay-as-you-go (nếu vượt free) | ~$20/mo      |
| **Total**      |                               | **~$189/mo** |

**Lưu ý:** Gemini API có free tier rất hào phóng:

- ✅ 15 requests/minute (RPM)
- ✅ 1 million tokens/day
- ✅ Đủ cho 50-100 đề thi/ngày (mỗi đề ~10K tokens)
- ✅ Chi phí paid: $0.075/$1.50 per 1M tokens (input/output)

---

## 🔗 Useful Resources

### Documentation

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Google Gemini API](https://ai.google.dev/docs)
- [Socket.io](https://socket.io/docs)

### Tools

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app)
- [Neon Console](https://console.neon.tech)
- [Upstash Console](https://console.upstash.com)

### Community

- [Next.js Discord](https://discord.gg/nextjs)
- [FastAPI Discord](https://discord.gg/fastapi)

---

## 📝 Notes

### Migration từ Code Hiện Tại

#### Python Backend (Tái sử dụng)

**Giữ nguyên 100%:**

- `core/ai_generator.py` → ExamGenerator class
  - Wrap vào FastAPI endpoint: POST /api/exams/generate
  - Chạy trong Celery task (async)
- `core/config.py` → Gemini API key, prompts
  - Thêm: DATABASE_URL, REDIS_URL, JWT_SECRET
- `render/pdf_exporter.py` → Export results as PDF
  - Endpoint: GET /api/attempts/{id}/export

**MASTER_PROMPT:**

- Giữ nguyên 100% (đã optimize tốt)
- Đa dạng domains (10+ nhóm)
- JSON output format hoàn hảo

#### New Code Cần Viết

**Frontend (Next.js):**

- UI components với shadcn/ui
- Exam taking interface (SQL editor, test case form)
- Results display với AI feedback
- Auth pages (login, register)
- Dashboard (teacher, student)

**Backend (FastAPI):**

- REST API endpoints (auth, CRUD exams/attempts)
- WebSocket server (timer, violations)
- AI grading endpoint (NEW - chấm điểm SQL/Testing)
- SQLAlchemy models & migrations

### Tech Decisions Rationale

1. **SQLAlchemy (Backend) > Drizzle (Frontend):**
   - Next.js không truy cập DB trực tiếp
   - SQLAlchemy: Python ORM chuẩn, async support, mature
2. **FastAPI JWT > Auth.js:**
   - Tất cả auth logic ở backend
   - python-jose + passlib: chuẩn industry
3. **FastAPI > Django:**
   - Lightweight, async native
   - Tái sử dụng code Python hiện tại (ai_generator.py)
4. **PostgreSQL > MongoDB:**
   - Relational data (users, exams, attempts)
   - JSONB cho unstructured (exam_data, answers)
5. **Gemini > Claude/GPT:**
   - Đang dùng trong bot, tái sử dụng 100%
   - Free tier: 15 RPM, 1M tokens/day
6. **React Query > SWR:**
   - Better caching strategy
   - Optimistic updates cho exam answers

---

**Last Updated:** 28/01/2026  
**Version:** 1.0  
**Status:** Ready for Development 🚀
