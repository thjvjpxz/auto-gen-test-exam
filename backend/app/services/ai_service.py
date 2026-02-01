"""AI service for exam generation using Google Gemini.

This module wraps the exam generation logic from core/ai_generator.py
into an async service suitable for FastAPI.
"""

import asyncio
import json
from typing import Any

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.models.exam import ExamType

# Constants
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite"
GENERATION_TEMPERATURE = 1.0

MASTER_PROMPT = """
Bạn là một chuyên gia soạn đề thi CNTT với 20 năm kinh nghiệm. Nhiệm vụ: tạo đề thi gồm 2 phần (SQL và Testing) hoàn toàn MỚI và KHÁC BIỆT so với các đề trước.

## CHIẾN LƯỢC TẠO ĐỀ ĐA DẠNG

### 1. PHẦN SQL - Sơ đồ ERD và Truy vấn

**Bước 1: Chọn NGẪU NHIÊN một lĩnh vực từ các nhóm sau (luân phiên các nhóm):**

| Nhóm             | Ví dụ chủ đề                                                                                      |
|------------------|---------------------------------------------------------------------------------------------------|
| Thương mại       | Bán hàng online, Siêu thị, Cửa hàng điện thoại, Đại lý xe máy, Sàn thương mại điện tử             |
| Giáo dục         | Quản lý sinh viên, Thư viện, Trung tâm ngoại ngữ, Khóa học online, Hệ thống thi trắc nghiệm       |
| Y tế             | Bệnh viện, Phòng khám, Nhà thuốc, Quản lý bảo hiểm y tế, Đặt lịch tiêm vaccine                   |
| Dịch vụ          | Đặt vé máy bay, Khách sạn, Nhà hàng, Salon tóc, Rạp chiếu phim, Gym/Fitness                      |
| Tài chính        | Ngân hàng, Sàn chứng khoán, Ví điện tử, Cho vay tín dụng, Quản lý quỹ đầu tư                     |
| Vận tải          | Giao hàng nhanh, Xe buýt/Metro, Đặt xe công nghệ, Quản lý kho bãi, Chuỗi cung ứng               |
| Giải trí         | Nền tảng stream nhạc/phim, Quán game, Tổ chức sự kiện, Bán vé concert                           |
| Bất động sản     | Môi giới nhà đất, Quản lý chung cư, Cho thuê căn hộ, Đấu giá đất                                 |
| Nhân sự          | Tuyển dụng, Chấm công, Tính lương, Đánh giá KPI, Quản lý hợp đồng lao động                      |
| Nông nghiệp      | Trang trại thông minh, Sàn nông sản, Quản lý rừng, Hệ thống tưới tự động                        |

**Bước 2: Thiết kế ERD (4-6 bảng) với các quy tắc:**
- Mỗi bảng có 3-6 thuộc tính thực tế (KHÔNG dùng tên chung chung như field1, field2)
- Bắt buộc có ít nhất: 1 quan hệ 1-n và 1 quan hệ n-n thông qua bảng trung gian
- Sử dụng các kiểu dữ liệu phù hợp: VARCHAR, INT, DECIMAL, DATE, DATETIME, BOOLEAN

**Bước 3: Tạo câu hỏi SQL (chọn NGẪU NHIÊN mức độ và kiểu):**

| Mức độ    | Yêu cầu kỹ thuật                                                                 |
|-----------|---------------------------------------------------------------------------------|
| Cơ bản    | SELECT-WHERE, ORDER BY, LIKE, BETWEEN, IN, DISTINCT                             |
| Trung bình| INNER/LEFT/RIGHT JOIN, GROUP BY, HAVING, COUNT/SUM/AVG/MAX/MIN                  |
| Nâng cao  | Subquery, EXISTS, UNION, CASE WHEN, Window Functions (ROW_NUMBER, RANK)         |

Yêu cầu:
- Câu 1: Chọn ngẫu nhiên từ mức Cơ bản hoặc Trung bình
- Câu 2: Chọn ngẫu nhiên từ mức Trung bình hoặc Nâng cao
- Câu hỏi phải liên quan đến NGHIỆP VỤ THỰC TẾ (không hỏi chung chung)

---

### 2. PHẦN TESTING - Kỹ thuật kiểm thử hộp đen

**Bước 1: Chọn NGẪU NHIÊN một loại bài toán:**

| Loại bài toán                | Kỹ thuật phù hợp                                      | Ví dụ nghiệp vụ                                               |
|------------------------------|-------------------------------------------------------|--------------------------------------------------------------|
| Phân loại theo điều kiện số  | Phân vùng tương đương (EP) + Giá trị biên (BVA)       | Xếp loại học lực, Tính thuế thu nhập, Phí giao hàng          |
| Kết hợp nhiều điều kiện      | Bảng quyết định (Decision Table)                      | Chính sách giảm giá, Phê duyệt khoản vay, Xét tốt nghiệp     |
| Quy trình có trạng thái      | Chuyển đổi trạng thái (State Transition)              | Đơn hàng, Vé máy bay, Hồ sơ xin việc, Bug tracking           |
| Nghiệp vụ tính toán          | EP + BVA + Bảng quyết định                            | Lãi suất tiết kiệm, Tính điểm thưởng member, Phí bảo hiểm    |

**Bước 2: Thiết kế bài toán với:**
- Mô tả ngữ cảnh nghiệp vụ rõ ràng (30-50 từ)
- Bảng quy tắc (3-6 rules) hoặc sơ đồ trạng thái
- Có số liệu cụ thể, thực tế (tiền tệ dùng VND, khoảng cách dùng km)

**Bước 3: Câu hỏi yêu cầu thí sinh:**
- Xác định kỹ thuật kiểm thử phù hợp VÀ giải thích lý do
- Liệt kê các lớp tương đương / giá trị biên / trạng thái / tổ hợp điều kiện
- Thiết kế tối thiểu 5-10 test cases

---

## YẾU TỐ ĐẢM BẢO ĐA DẠNG

1. **Seed ngẫu nhiên**: Mỗi lần gọi, hãy chọn ngẫu nhiên: Nhóm lĩnh vực (1-10), Chủ đề cụ thể, Mức độ câu hỏi SQL, Loại bài toán Testing
2. **Quy tắc chống lặp**: KHÔNG sử dụng các chủ đề quá phổ biến như: Quản lý thư viện, Quản lý sinh viên đơn thuần, Bán hàng đơn giản
3. **Tính thực tiễn**: Số liệu và nghiệp vụ phải phản ánh thực tế Việt Nam

---

## CÚ PHÁP MERMAID ERD (BẮT BUỘC TUÂN THỦ)

Mermaid ERD có cú pháp NGHIÊM NGẶT. Mỗi thuộc tính phải theo format:
```
TYPE attribute_name [PK|FK|UK]
```

**QUY TẮC:**
- PK = Primary Key, FK = Foreign Key, UK = Unique Key
- KHÔNG dùng: `PRIMARY KEY (...)`, `FOREIGN KEY (...)`, `CONSTRAINT`, `UNIQUE` (dùng UK thay thế)
- Với bảng trung gian (junction table), mỗi cột FK được đánh dấu riêng

**VÍ DỤ ĐÚNG:**
```
erDiagram
    USERS {
        INT user_id PK
        VARCHAR email UK
        VARCHAR name
        DATE created_at
    }
    ORDERS {
        INT order_id PK
        INT user_id FK
        DECIMAL total_amount
        DATETIME order_date
    }
    ORDER_ITEMS {
        INT order_id FK
        INT product_id FK
        INT quantity
    }
    USERS ||--|{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
```

---

## OUTPUT FORMAT (JSON)

{
  "exam_title": "string - Tiêu đề cụ thể theo chủ đề, ví dụ: Đề thi CSDL & Kiểm thử - Hệ thống Quản lý Gym",
  "sql_part": {
    "mermaid_code": "string - Code Mermaid erDiagram hoàn chỉnh theo cú pháp trên",
    "questions": ["string - Câu hỏi SQL 1", "string - Câu hỏi SQL 2"]
  },
  "testing_part": {
    "scenario": "string - Mô tả tình huống nghiệp vụ chi tiết",
    "rules_table": [
      {"condition": "string - Điều kiện", "result": "string - Kết quả"}
    ],
    "question": "string - Yêu cầu cụ thể cho thí sinh"
  }
}

**LƯU Ý QUAN TRỌNG:**
- KHÔNG trả về ví dụ mẫu, PHẢI sinh nội dung hoàn toàn mới
- Mermaid code PHẢI tuân thủ cú pháp ở trên, KHÔNG dùng PRIMARY KEY(...) hay UNIQUE
- Các con số trong bài Testing PHẢI nhất quán và tính toán được
"""

# SQL-only prompt - generates only SQL part
SQL_ONLY_PROMPT = """
Bạn là một chuyên gia soạn đề thi CNTT với 20 năm kinh nghiệm. Nhiệm vụ: tạo đề thi SQL hoàn toàn MỚI và KHÁC BIỆT.

## PHẦN SQL - Sơ đồ ERD và Truy vấn

**Bước 1: Chọn NGẪU NHIÊN một lĩnh vực từ các nhóm:**
- Thương mại, Giáo dục, Y tế, Dịch vụ, Tài chính, Vận tải, Giải trí, Bất động sản, Nhân sự, Nông nghiệp

**Bước 2: Thiết kế ERD (4-6 bảng) với các quy tắc:**
- Mỗi bảng có 3-6 thuộc tính thực tế
- Bắt buộc có ít nhất: 1 quan hệ 1-n và 1 quan hệ n-n thông qua bảng trung gian

**Bước 3: Tạo 2-3 câu hỏi SQL với độ khó đa dạng:**
- Từ cơ bản (SELECT-WHERE, ORDER BY) đến nâng cao (Subquery, JOIN, Window Functions)

---

## CÚ PHÁP MERMAID ERD (BẮT BUỘC TUÂN THỦ)

Mermaid ERD có cú pháp NGHIÊM NGẶT. Mỗi thuộc tính phải theo format:
```
TYPE attribute_name [PK|FK|UK]
```

**QUY TẮC:**
- PK = Primary Key, FK = Foreign Key, UK = Unique Key
- KHÔNG được dùng: `PRIMARY KEY (...)`, `FOREIGN KEY (...)`, `CONSTRAINT`, `UNIQUE`
- Dùng UK thay cho UNIQUE
- Với bảng trung gian (junction table), mỗi cột FK được đánh dấu riêng

**VÍ DỤ ĐÚNG:**
```
erDiagram
    USERS {
        INT user_id PK
        VARCHAR email UK
        VARCHAR name
        DATE created_at
    }
    ORDERS {
        INT order_id PK
        INT user_id FK
        DECIMAL total_amount
        DATETIME order_date
    }
    ORDER_ITEMS {
        INT order_id FK
        INT product_id FK
        INT quantity
    }
    USERS ||--|{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
```

**VÍ DỤ SAI (KHÔNG ĐƯỢC LÀM):**
```
TABLE {
    PRIMARY KEY (col1, col2)  ❌ Không hợp lệ
    VARCHAR email UNIQUE      ❌ Dùng UK thay thế
    CONSTRAINT fk_xxx         ❌ Không hợp lệ
}
```

---

## OUTPUT FORMAT (JSON)

{
  "exam_title": "string - Tiêu đề cụ thể",
  "sql_part": {
    "mermaid_code": "string - Code Mermaid erDiagram hoàn chỉnh theo cú pháp trên",
    "questions": ["string - Câu hỏi SQL 1", "string - Câu hỏi SQL 2"]
  },
  "testing_part": null
}

**LƯU Ý:** Mermaid code PHẢI tuân thủ cú pháp ở trên. KHÔNG dùng PRIMARY KEY(...), UNIQUE, CONSTRAINT.
"""

# Testing-only prompt - generates only Testing part
TESTING_ONLY_PROMPT = """
Bạn là một chuyên gia soạn đề thi CNTT với 20 năm kinh nghiệm. Nhiệm vụ: tạo đề thi Kiểm thử phần mềm hoàn toàn MỚI.

## PHẦN TESTING - Kỹ thuật kiểm thử hộp đen

**Bước 1: Chọn NGẪU NHIÊN một loại bài toán:**
- Phân loại theo điều kiện số: Phân vùng tương đương (EP) + Giá trị biên (BVA)
- Kết hợp nhiều điều kiện: Bảng quyết định (Decision Table)
- Quy trình có trạng thái: Chuyển đổi trạng thái (State Transition)

**Bước 2: Thiết kế bài toán với:**
- Mô tả ngữ cảnh nghiệp vụ rõ ràng (30-50 từ)
- Bảng quy tắc (3-6 rules) hoặc sơ đồ trạng thái
- Có số liệu cụ thể, thực tế (VND, km)

**Bước 3: Câu hỏi yêu cầu thí sinh:**
- Xác định kỹ thuật kiểm thử phù hợp và giải thích lý do
- Thiết kế tối thiểu 5-10 test cases

## OUTPUT FORMAT (JSON)

{
  "exam_title": "string - Tiêu đề cụ thể",
  "sql_part": null,
  "testing_part": {
    "scenario": "string - Mô tả tình huống nghiệp vụ chi tiết",
    "rules_table": [
      {"condition": "string - Điều kiện", "result": "string - Kết quả"}
    ],
    "question": "string - Yêu cầu cụ thể cho thí sinh"
  }
}

**LƯU Ý:** Các con số trong bài Testing PHẢI nhất quán và tính toán được.
"""


class ExamGeneratorService:
    """Async service for generating exam content using Google Gemini AI.
    
    This service wraps the Gemini API calls in an async interface suitable
    for FastAPI background tasks and non-blocking operations.
    """

    def __init__(
        self,
        model_name: str = DEFAULT_GEMINI_MODEL,
        exam_type: ExamType = ExamType.SQL_TESTING,
    ):
        """Initialize the ExamGeneratorService with Google GenAI client.
        
        Args:
            model_name: The Gemini model identifier to use for generation.
                       Defaults to "gemini-2.5-flash-lite".
            exam_type: Type of exam to generate (sql_testing, sql_only, testing_only).
                       Defaults to SQL_TESTING.
                       
        Raises:
            ValueError: If GEMINI_API_KEY is not configured.
        """
        settings = get_settings()
        
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY must be set in environment variables")
        
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model_name = model_name
        self.exam_type = exam_type

    def _get_prompt_for_exam_type(self) -> str:
        """Get the appropriate prompt based on exam type.
        
        Returns:
            The prompt string for the configured exam type.
        """
        if self.exam_type == ExamType.SQL_ONLY:
            return SQL_ONLY_PROMPT
        elif self.exam_type == ExamType.TESTING_ONLY:
            return TESTING_ONLY_PROMPT
        else:
            return MASTER_PROMPT

    async def generate_exam(self) -> dict[str, Any]:
        """Generate a complete exam with SQL and Testing sections asynchronously.
        
        This method calls the Gemini API in a non-blocking way using asyncio.to_thread()
        to prevent blocking the event loop during the AI generation process.
        
        Returns:
            dict: A dictionary containing the exam structure with keys:
                - exam_title (str): The title of the exam
                - sql_part (dict): Contains mermaid_code and questions list
                - testing_part (dict): Contains scenario, rules_table, and question
                
        Raises:
            json.JSONDecodeError: If the AI response is not valid JSON.
            Exception: For any API-related errors during generation.
        """
        try:
            # Run the synchronous Gemini API call in a thread pool
            # to avoid blocking the async event loop
            response = await asyncio.to_thread(
                self._call_gemini_api
            )
            
            # Parse JSON response
            exam_data = json.loads(response.text)
            
            # Validate basic structure
            self._validate_exam_structure(exam_data)
            
            return exam_data
            
        except json.JSONDecodeError as e:
            error_msg = f"Failed to parse AI response as JSON: {e.msg}"
            raise json.JSONDecodeError(error_msg, e.doc, e.pos) from e
        except ValueError:
            # Re-raise validation errors as-is
            raise
        except Exception as e:
            error_msg = f"Error generating exam content: {str(e)}"
            raise RuntimeError(error_msg) from e

    def _call_gemini_api(self) -> Any:
        """Call Gemini API synchronously (run in thread pool).
        
        Returns:
            Response object from Gemini API.
        """
        prompt = self._get_prompt_for_exam_type()
        return self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=GENERATION_TEMPERATURE
            )
        )

    def _validate_exam_structure(self, exam_data: dict[str, Any]) -> None:
        """Validate that the generated exam has the required structure.
        
        Validation rules depend on exam_type:
        - sql_testing: requires both sql_part and testing_part
        - sql_only: requires only sql_part (testing_part can be null)
        - testing_only: requires only testing_part (sql_part can be null)
        
        Args:
            exam_data: The exam dictionary to validate.
            
        Raises:
            ValueError: If required keys are missing from the structure.
        """
        if 'exam_title' not in exam_data:
            raise ValueError("Missing 'exam_title' in exam data")
        
        # Determine required parts based on exam_type
        requires_sql = self.exam_type in (ExamType.SQL_TESTING, ExamType.SQL_ONLY)
        requires_testing = self.exam_type in (ExamType.SQL_TESTING, ExamType.TESTING_ONLY)
        
        # Validate sql_part if required
        if requires_sql:
            sql_part = exam_data.get('sql_part')
            if sql_part is None:
                raise ValueError("Missing 'sql_part' for exam_type requiring SQL")
            if 'mermaid_code' not in sql_part:
                raise ValueError("Missing 'mermaid_code' in sql_part")
            if 'questions' not in sql_part:
                raise ValueError("Missing 'questions' in sql_part")
        
        # Validate testing_part if required
        if requires_testing:
            testing_part = exam_data.get('testing_part')
            if testing_part is None:
                raise ValueError("Missing 'testing_part' for exam_type requiring Testing")
            testing_required = ['scenario', 'rules_table', 'question']
            testing_missing = [
                key for key in testing_required
                if key not in testing_part
            ]
            if testing_missing:
                raise ValueError(
                    f"Missing required keys in testing_part: {testing_missing}"
                )
