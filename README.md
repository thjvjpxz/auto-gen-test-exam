# Auto Gen Test Exam

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-Next.js-000000)
![License](https://img.shields.io/badge/license-MIT-green)

Nền tảng sinh đề thi tự động bằng AI với kiến trúc full-stack:
- Backend: FastAPI (Python)
- Frontend: Next.js
- AI: Gemini API
- Hỗ trợ chạy local hoặc Docker Compose

## Mục lục

- [Mục tiêu](#mục-tiêu)
- [Phiên bản](#phiên-bản)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Chạy dự án](#chạy-dự-án)
- [Các lệnh hữu ích](#các-lệnh-hữu-ích)
- [Biến môi trường](#biến-môi-trường)
- [Bảo mật và bản quyền](#bảo-mật-và-bản-quyền)
- [Đóng góp](#đóng-góp)
- [License](#license)

## Mục tiêu

- Tự động tạo đề thi và câu hỏi theo yêu cầu.
- Cung cấp API cho frontend và các dịch vụ khác.
- Đơn giản hóa quy trình phát triển với bộ lệnh `make`.

## Phiên bản

- Current version: `0.1.0`
- Recommended release strategy: Semantic Versioning (`MAJOR.MINOR.PATCH`)

## Cấu trúc dự án

```text
.
|-- backend/
|-- frontend/
|-- docs/
|-- docker-compose.yml
`-- Makefile
```

## Yêu cầu hệ thống

- Python 3.12+
- Node.js 20+ và pnpm
- Docker + Docker Compose (nếu chạy bằng container)

## Cài đặt nhanh

1) Clone repository

```bash
git clone <repository-url>
cd auto-gen-test-exam
```

2) Cài đặt dependencies

```bash
make install
```

3) Tạo file môi trường

Backend:
```bash
cp backend/.env.example backend/.env
```

Frontend:
```bash
cp frontend/.env.example frontend/.env.local
```

4) Cập nhật các biến quan trọng trong `backend/.env`:
- `GEMINI_API_KEY`
- `JWT_SECRET`

## Chạy dự án

### Cách 1: Chạy local

```bash
make dev
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Cách 2: Chạy bằng Docker

```bash
make docker-up
```

Dừng dịch vụ:
```bash
make docker-down
```

## Các lệnh hữu ích

```bash
make test        # Chạy test backend + typecheck frontend
make lint        # Chạy ruff, mypy, lint frontend
make build       # Build backend image + build frontend
make docker-logs # Xem logs container
```

## Biến môi trường

### Backend (`backend/.env`)

- `GEMINI_API_KEY`: API key của Gemini
- `DATABASE_URL`: Chuỗi kết nối database
- `JWT_SECRET`, `JWT_ALGORITHM`: Cấu hình JWT
- `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`
- `CORS_ORIGINS`

### Frontend (`frontend/.env.local`)

- `API_URL`: Địa chỉ API backend (mặc định `http://localhost:8000/api`)

## Bảo mật và bản quyền

- Dự án sử dụng giấy phép MIT, xem chi tiết trong file `LICENSE`.
- Bạn có thể sử dụng, sao chép, chỉnh sửa và phân phối, nhưng phải giữ nguyên thông báo bản quyền và giấy phép.
- Nếu muốn bảo vệ thương hiệu, cần bổ sung thêm thông báo trademark riêng.

## Đóng góp

1) Tạo nhánh mới từ `main`
2) Commit rõ ràng theo từng thay đổi
3) Mở Pull Request với mô tả và test plan

## License

MIT License. Xem file `LICENSE`.
