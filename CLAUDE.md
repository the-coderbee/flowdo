# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowDo is a productivity application combining task management with the Pomodoro technique. It consists of a Flask backend API and Next.js frontend.

## Architecture

### Backend (Flask + SQLAlchemy + PostgreSQL)
- **Entry Point**: `backend/run.py` - Main application runner
- **Configuration**: `backend/config/config.py` - Environment-based config (Development/Testing/Production)
- **Database**: Custom SQLAlchemy setup in `backend/database/db.py` with connection pooling and session management
- **Models**: Located in `backend/database/models/` using declarative base
- **Repositories**: Data access layer in `backend/database/repositories/`
- **Services**: Business logic in `backend/app/services/`
- **Routers**: API endpoints in `backend/app/routers/`
- **Schemas**: Pydantic models in `backend/app/schemas/`

### Frontend (Next.js + TypeScript + Tailwind)
- **App Router**: Uses Next.js 15 App Router pattern
- **Authentication**: JWT-based auth with React Context (`frontend/contexts/auth-context.tsx`)
- **Components**: Organized by feature in `frontend/components/`
- **API Layer**: Centralized in `frontend/lib/api.ts`
- **Services**: Authentication service in `frontend/services/auth.ts`

## Development Commands

### Backend
-always use the .venv in backend/ and activate the venv before running
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# activate venv
source .venv/bin/activate
# Run development server
python run.py

# Database migrations
flask db upgrade

# Testing
pytest
pytest tests/test_specific.py  # Single test file

# Code formatting
black .
flake8 .
```

### Frontend
```bash
cd frontend
# Install dependencies
npm install

# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Database Setup

The application uses PostgreSQL with custom SQLAlchemy configuration:

1. Create database: `createdb flowdo_dev`
2. Set environment variables in `.env`:
   - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
   - `JWT_SECRET_KEY`, `SECRET_KEY`
3. Run migrations: `flask db upgrade`

## Authentication System

- JWT-based authentication with access and refresh tokens
- Token storage in HTTP-only cookies and headers
- Protected routes using Next.js middleware (`frontend/src/middleware.ts`)
- Context-based auth state management in React

### Key Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## Key Patterns

### Backend Repository Pattern
Services use repository classes for data access, providing clean separation between business logic and data persistence.

### Frontend Authentication Flow
1. Login form submits to API
2. JWT tokens stored in context and cookies
3. API calls include authorization headers
4. Middleware protects routes based on auth state

### Database Session Management
Uses scoped sessions with proper connection pooling. The `session_scope()` context manager provides transaction handling.

## Environment Configuration

The app supports three environments (development/testing/production) with different database names and logging levels. Configuration is centralized in `backend/config/config.py`.