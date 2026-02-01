"""Prompt templates for AI-powered exam grading."""

SQL_GRADING_PROMPT = """
Bạn là một chuyên gia chấm điểm SQL với 15 năm kinh nghiệm. Nhiệm vụ: chấm điểm câu trả lời SQL của sinh viên.

## THÔNG TIN ĐỀ BÀI

**Sơ đồ ERD (Mermaid):**
```mermaid
{mermaid_code}
```

**Câu hỏi SQL:**
{sql_question}

## CÂU TRẢ LỜI CỦA SINH VIÊN

```sql
{student_answer}
```

## TIÊU CHÍ CHẤM ĐIỂM (25 điểm)

| Tiêu chí | Điểm | Mô tả |
|----------|------|-------|
| Cú pháp SQL | 5 | Câu lệnh có cú pháp đúng, không lỗi syntax |
| Logic truy vấn | 10 | Query trả về kết quả đúng với yêu cầu bài toán |
| Hiệu suất | 5 | Sử dụng JOIN hiệu quả, tránh subquery không cần thiết |
| Best practices | 5 | Đặt alias rõ ràng, format dễ đọc, tuân thủ conventions |

## YÊU CẦU OUTPUT

Trả về JSON với cấu trúc sau:

{{
  "score": <number 0-25>,
  "correct_syntax": <boolean>,
  "logic_correct": <boolean>,
  "optimal_query": <boolean>,
  "feedback": "<string - nhận xét chi tiết bằng tiếng Việt>",
  "issues": ["<string - lỗi 1>", "<string - lỗi 2>", ...],
  "suggestions": ["<string - gợi ý cải thiện 1>", ...]
}}

## LƯU Ý QUAN TRỌNG

1. Chấm điểm công bằng, khách quan
2. Feedback phải cụ thể, giúp sinh viên hiểu được lỗi
3. Nếu câu trả lời trống hoặc không liên quan → 0 điểm
4. Cho điểm một phần nếu đúng một số tiêu chí
5. Feedback và issues phải bằng tiếng Việt
"""

TESTING_GRADING_PROMPT = """
Bạn là một chuyên gia chấm điểm Kiểm thử phần mềm với 15 năm kinh nghiệm. Nhiệm vụ: chấm điểm câu trả lời Testing của sinh viên.

## THÔNG TIN ĐỀ BÀI

**Tình huống kiểm thử:**
{scenario}

**Bảng quy tắc:**
{rules_table}

**Câu hỏi:**
{testing_question}

## CÂU TRẢ LỜI CỦA SINH VIÊN

**Kỹ thuật kiểm thử đã chọn:** {technique}

**Giải thích lý do:**
{explanation}

**Danh sách Test Cases:**
{test_cases}

## TIÊU CHÍ CHẤM ĐIỂM (50 điểm)

| Tiêu chí | Điểm | Mô tả |
|----------|------|-------|
| Chọn kỹ thuật | 10 | Kỹ thuật phù hợp với bài toán (EP, BVA, Decision Table, State Transition) |
| Giải thích | 10 | Giải thích logic, rõ ràng tại sao chọn kỹ thuật này |
| Test cases | 20 | Test cases đủ coverage, đúng format, có giá trị thực tế |
| Edge cases | 10 | Xác định và cover được các trường hợp biên, ngoại lệ |

## ĐÁNH GIÁ KỸ THUẬT PHÙ HỢP

Dựa vào đặc điểm bài toán:
- **Phân vùng tương đương (EP)**: Khi input chia thành các nhóm tương đương
- **Giá trị biên (BVA)**: Khi cần test các giá trị boundary
- **Bảng quyết định (Decision Table)**: Khi có nhiều điều kiện kết hợp
- **Chuyển đổi trạng thái (State Transition)**: Khi có quy trình với các trạng thái

## YÊU CẦU OUTPUT

Trả về JSON với cấu trúc sau:

{{
  "technique_score": <number 0-10>,
  "technique_correct": <boolean>,
  "explanation_score": <number 0-10>,
  "test_cases_score": <number 0-20>,
  "coverage_score": <number 0-10>,
  "total_score": <number 0-50>,
  "feedback": "<string - nhận xét chi tiết bằng tiếng Việt>",
  "missing_scenarios": ["<string - scenario thiếu 1>", ...],
  "suggestions": ["<string - gợi ý 1>", ...]
}}

## LƯU Ý QUAN TRỌNG

1. Đánh giá kỹ thuật dựa trên bản chất bài toán, không phải tên gọi
2. Test cases phải có giá trị thực tế, không chấp nhận test cases mơ hồ
3. Feedback phải cụ thể, actionable
4. Nếu sinh viên không trả lời → 0 điểm phần đó
5. Feedback và missing_scenarios phải bằng tiếng Việt
"""

OVERALL_FEEDBACK_PROMPT = """
Bạn là một giáo viên IT với 15 năm kinh nghiệm. Dựa trên kết quả chấm điểm, viết nhận xét tổng thể cho sinh viên.

## KẾT QUẢ CHẤM ĐIỂM

**Phần SQL:** {sql_score}/50 điểm
- Chi tiết: {sql_details}

**Phần Testing:** {testing_score}/50 điểm
- Chi tiết: {testing_details}

**Tổng điểm:** {total_score}/100 ({percentage}%)
**Kết quả:** {passed_status}

## YÊU CẦU OUTPUT

Trả về JSON với cấu trúc:

{{
  "overall_feedback": "<string - nhận xét tổng thể 2-3 câu>",
  "strengths": ["<string - điểm mạnh 1>", "<string - điểm mạnh 2>"],
  "improvements": ["<string - cần cải thiện 1>", "<string - cần cải thiện 2>"]
}}

## LƯU Ý

1. Nhận xét phải khích lệ nhưng trung thực
2. Nêu cụ thể điểm mạnh để sinh viên tự tin
3. Gợi ý cải thiện phải actionable
4. Toàn bộ nội dung bằng tiếng Việt
"""


def build_sql_grading_prompt(
    mermaid_code: str,
    sql_question: str,
    student_answer: str,
) -> str:
    """Build the SQL grading prompt with exam data and student answer.

    Args:
        mermaid_code: ERD diagram in Mermaid syntax.
        sql_question: The SQL question text.
        student_answer: Student's SQL query answer.

    Returns:
        Formatted prompt string ready for AI model.
    """
    return SQL_GRADING_PROMPT.format(
        mermaid_code=mermaid_code,
        sql_question=sql_question,
        student_answer=student_answer or "(Không có câu trả lời)",
    )


def build_testing_grading_prompt(
    scenario: str,
    rules_table: list[dict],
    testing_question: str,
    technique: str,
    explanation: str,
    test_cases: list[dict],
) -> str:
    """Build the testing grading prompt with exam data and student answer.

    Args:
        scenario: Testing scenario description.
        rules_table: List of rule conditions and results.
        testing_question: The testing question text.
        technique: Student's selected testing technique.
        explanation: Student's explanation for technique choice.
        test_cases: List of student's test cases.

    Returns:
        Formatted prompt string ready for AI model.
    """
    rules_formatted = "\n".join(
        f"- {rule.get('condition', '')} → {rule.get('result', '')}"
        for rule in rules_table
    )

    test_cases_formatted = "\n".join(
        f"- Input: {tc.get('input', 'N/A')} | Expected: {tc.get('expected_output', 'N/A')}"
        for tc in test_cases
    ) if test_cases else "(Không có test cases)"

    return TESTING_GRADING_PROMPT.format(
        scenario=scenario,
        rules_table=rules_formatted,
        testing_question=testing_question,
        technique=technique or "(Không chọn)",
        explanation=explanation or "(Không có giải thích)",
        test_cases=test_cases_formatted,
    )


def build_overall_feedback_prompt(
    sql_score: float,
    sql_details: str,
    testing_score: float,
    testing_details: str,
    total_score: float,
    percentage: float,
    passed: bool,
) -> str:
    """Build the overall feedback prompt.

    Args:
        sql_score: Score for SQL part.
        sql_details: Summary of SQL grading.
        testing_score: Score for testing part.
        testing_details: Summary of testing grading.
        total_score: Total exam score.
        percentage: Percentage score.
        passed: Whether student passed.

    Returns:
        Formatted prompt string ready for AI model.
    """
    passed_status = "ĐẠT" if passed else "KHÔNG ĐẠT"
    
    return OVERALL_FEEDBACK_PROMPT.format(
        sql_score=sql_score,
        sql_details=sql_details,
        testing_score=testing_score,
        testing_details=testing_details,
        total_score=total_score,
        percentage=percentage,
        passed_status=passed_status,
    )
