# AI-Powered Exam Generator

Dự án sử dụng Trí tuệ nhân tạo (AI) để tự động tạo các đề thi CNTT (SQL, Testing) và gửi trực tiếp cho người dùng qua Telegram dưới dạng file PDF chất lượng cao.

## Tech Stack

- **Ngôn ngữ:** Python 3.12+
- **AI:** google-genai (Gemini AI)
- **Telegram Bot:** python-telegram-bot
- **Rendering:** pdfkit, wkhtmltopdf, Jinja2
- **Diagrams:** Kroki.io API (dùng để render Mermaid diagrams)

## Cài đặt

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd auto-gen-test-exam
   ```

2. **Cài đặt thư viện Python:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Cài đặt wkhtmltopdf (Ubuntu/Debian):**

   ```bash
   sudo apt install wkhtmltopdf
   ```

4. **Cấu hình môi trường:**
   - Copy file `.env.example` thành `.env` (nếu chưa có file `.env.example`, hãy tạo mới file `.env`).
   - Điền các API keys cần thiết:
     ```env
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     GEMINI_API_KEY=your_google_gemini_api_key
     ```

## Chạy dự án

Chạy lệnh sau để khởi động bot:

```bash
python main.py
```

## Các lệnh trong Bot (Commands)

- `/gen`: Sinh đề thi mới và nhận kết quả dưới dạng file PDF.
- `/help`: Hiển thị hướng dẫn sử dụng và danh sách các lệnh.

## License

Dự án được phát hành dưới bản quyền **MIT**.
