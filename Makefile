# Makefile for Auto-Gen-Test-Exam Project
# Usage: make <target>

.PHONY: help install dev build test lint docker-up docker-down clean

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    make install     - Install all dependencies (backend + frontend)"
	@echo "    make dev         - Start development servers"
	@echo "    make dev-backend - Start backend dev server only"
	@echo "    make dev-frontend- Start frontend dev server only"
	@echo ""
	@echo "  Build & Test:"
	@echo "    make build       - Build both frontend and backend"
	@echo "    make test        - Run all tests"
	@echo "    make lint        - Run linters on all code"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-up   - Start all services with Docker Compose"
	@echo "    make docker-down - Stop all Docker services"
	@echo "    make docker-build- Rebuild Docker images"
	@echo "    make docker-logs - View Docker logs"
	@echo ""
	@echo "  Utilities:"
	@echo "    make clean       - Remove build artifacts and caches"
	@echo "    make db-migrate  - Run database migrations"

# ============================================
# Installation
# ============================================

install: install-backend install-frontend
	@echo "✅ All dependencies installed"

install-backend:
	@echo "📦 Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	cd backend && pip install ruff mypy

install-frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && pnpm install

# ============================================
# Development
# ============================================

dev:
	@echo "🚀 Starting development servers..."
	make -j2 dev-backend dev-frontend

dev-backend:
	@echo "🔧 Starting FastAPI backend..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "▲ Starting Next.js frontend..."
	cd frontend && pnpm dev

# ============================================
# Build
# ============================================

build: build-backend build-frontend
	@echo "✅ Build complete"

build-backend:
	@echo "🏗️ Building backend Docker image..."
	cd backend && docker build -t auto-gen-test-exam-backend:latest .

build-frontend:
	@echo "🏗️ Building frontend..."
	cd frontend && pnpm build

# ============================================
# Testing
# ============================================

test: test-backend test-frontend
	@echo "✅ All tests passed"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && pytest test/ -v --tb=short

test-frontend:
	@echo "🧪 Running frontend type check..."
	cd frontend && pnpm exec tsc --noEmit

# ============================================
# Linting
# ============================================

lint: lint-backend lint-frontend
	@echo "✅ All linting passed"

lint-backend:
	@echo "🔍 Linting backend..."
	cd backend && ruff check .
	cd backend && mypy app --ignore-missing-imports

lint-frontend:
	@echo "🔍 Linting frontend..."
	cd frontend && pnpm lint

# ============================================
# Docker
# ============================================

docker-up:
	@echo "🐳 Starting Docker services..."
	docker compose up -d
	@echo "✅ Services started. Backend: http://localhost:8000 | Frontend: http://localhost:3000"

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker compose down

docker-build:
	@echo "🏗️ Rebuilding Docker images..."
	docker compose build --no-cache

docker-logs:
	docker compose logs -f

# ============================================
# Database
# ============================================

db-migrate:
	@echo "🗄️ Running database migrations..."
	cd backend && alembic upgrade head

db-reset:
	@echo "⚠️ Resetting database..."
	rm -f backend/app.db backend/data/app.db
	cd backend && python -c "from app.db.session import engine; from app.db.base import Base; import asyncio; asyncio.run(engine.begin())"

# ============================================
# Cleanup
# ============================================

clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/.next
	@echo "✅ Cleanup complete"
