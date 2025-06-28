# FlowDo - Task Management with Pomodoro

FlowDo is a productivity application that combines task management with the Pomodoro technique to help users stay focused and organized.

## Project Structure

The project is divided into two main parts:

- **Backend**: Flask API with SQLAlchemy and PostgreSQL
- **Frontend**: Next.js with TypeScript and Tailwind CSS

## Authentication System

The application uses JWT-based authentication with the following features:

- Email-based registration and login
- JWT tokens for authentication
- Refresh tokens for maintaining sessions
- Password reset functionality
- Protected routes

### Backend Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   # Make sure PostgreSQL is running
   # Create the database
   createdb flowdo_dev
   
   # Run migrations
   flask db upgrade
   ```

5. Start the backend server:
   ```
   python run.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend/flowdo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Authentication System

1. Register a new account at `/register`
2. Login with your credentials at `/login`
3. Access protected routes like `/dashboard`, `/tasks`, and `/pomodoro`
4. Logout using the user menu in the navbar

## Development Notes

- The backend uses Flask with the application factory pattern
- Authentication is handled with JWT tokens
- The frontend uses Next.js App Router
- Authentication state is managed with React Context
- Protected routes are handled with Next.js middleware 