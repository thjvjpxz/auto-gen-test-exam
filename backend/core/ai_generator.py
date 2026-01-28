"""AI-powered exam generator using Google Gemini 2.0 Flash.

This module provides the ExamGenerator class that generates structured exam content
using Google's Generative AI with JSON output mode for consistent data structure.
"""

import json
from google import genai
from google.genai import types
from core.config import GEMINI_API_KEY


# Master Prompt for exam generation - optimized for Vietnamese IT exams
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

## OUTPUT FORMAT (JSON)

{
  "exam_title": "string - Tiêu đề cụ thể theo chủ đề, ví dụ: Đề thi CSDL & Kiểm thử - Hệ thống Quản lý Gym",
  "sql_part": {
    "mermaid_code": "string - Code Mermaid erDiagram hoàn chỉnh",
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
- Mermaid code PHẢI là cú pháp hợp lệ, có thể render được
- Các con số trong bài Testing PHẢI nhất quán và tính toán được
"""


class ExamGenerator:
    """Generates exam content using Google Gemini 2.0 Flash model.

    This class handles the interaction with Google's Generative AI API to create
    structured exam content with SQL and Testing sections. It uses JSON mode to
    ensure consistent output format.

    Attributes:
        client: Google GenAI client instance configured with API key.
        model_name: Name of the Gemini model to use (default: gemini-2.5-flash-lite).
    """

    def __init__(self, model_name: str = "gemini-2.5-flash-lite"):
        """Initialize the ExamGenerator with Google GenAI client.

        Args:
            model_name: The Gemini model identifier to use for generation.
                       Defaults to "gemini-2.5-flash-lite".

        Raises:
            ValueError: If GEMINI_API_KEY is not properly configured.
        """
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY must be set in environment variables")

        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model_name = model_name

    def generate_exam(self) -> dict:
        """Generate a complete exam with SQL and Testing sections.

        This method calls the Gemini API with the master prompt to generate
        structured exam content. The output is forced to JSON format for
        reliable parsing and validation.

        Returns:
            dict: A dictionary containing the exam structure with keys:
                - exam_title (str): The title of the exam
                - sql_part (dict): Contains mermaid_code and questions list
                - testing_part (dict): Contains scenario, rules_table, and question

        Raises:
            json.JSONDecodeError: If the AI response is not valid JSON.
            Exception: For any API-related errors during generation.

        Example:
            >>> generator = ExamGenerator()
            >>> exam_data = generator.generate_exam()
            >>> print(exam_data['exam_title'])
            'Đề thi CSDL và Kiểm thử Phần mềm'
        """
        try:
            # Generate content with structured JSON output
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=MASTER_PROMPT,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=1.0  # Higher temperature for more variety
                )
            )

            # Parse JSON response
            exam_data = json.loads(response.text)

            # Validate basic structure
            self._validate_exam_structure(exam_data)

            return exam_data

        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Failed to parse AI response as JSON: {e.msg}",
                e.doc,
                e.pos
            )
        except Exception as e:
            raise Exception(f"Error generating exam content: {str(e)}")

    def _validate_exam_structure(self, exam_data: dict) -> None:
        """Validate that the generated exam has the required structure.

        Args:
            exam_data: The exam dictionary to validate.

        Raises:
            ValueError: If required keys are missing from the structure.
        """
        required_keys = ['exam_title', 'sql_part', 'testing_part']
        missing_keys = [key for key in required_keys if key not in exam_data]

        if missing_keys:
            raise ValueError(f"Missing required keys in exam data: {missing_keys}")

        # Validate sql_part structure
        if 'mermaid_code' not in exam_data['sql_part']:
            raise ValueError("Missing 'mermaid_code' in sql_part")
        if 'questions' not in exam_data['sql_part']:
            raise ValueError("Missing 'questions' in sql_part")

        # Validate testing_part structure
        testing_required = ['scenario', 'rules_table', 'question']
        testing_missing = [
            key for key in testing_required
            if key not in exam_data['testing_part']
        ]

        if testing_missing:
            raise ValueError(
                f"Missing required keys in testing_part: {testing_missing}"
            )
