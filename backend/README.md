# FlowDo Backend

A Flask-based backend API for the FlowDo productivity application.

## Project Structure

```
backend/
├── app/                  # Flask application
│   ├── routers/          # Route blueprints
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── config/               # Configuration
├── database/             # Database related code
│   ├── migrations/       # Alembic migrations
│   ├── models/           # SQLAlchemy models
│   └── repositories/     # Database repositories
├── logger/               # Logging configuration
├── tests/                # Test suite
├── .env                  # Environment variables (not in git)
├── alembic.ini           # Alembic configuration
├── requirements.txt      # Python dependencies
├── run.py               # Application entry point
└── setup.py             # Database setup script
```

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 14+

### Environment Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:
   ```bash
   # On Linux/macOS
   source .venv/bin/activate
   
   # On Windows
   .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend` directory with the following content:
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=flowdo_dev
   ```

### Database Setup

1. Make sure PostgreSQL is running

2. Run the setup script to create the database and run migrations:
   ```bash
   python setup.py
   ```

   Alternatively, you can set up the database manually:
   ```bash
   # Create database
   createdb -U postgres flowdo_dev
   
   # Run migrations
   alembic upgrade head
   ```

## Running the Application

Start the Flask development server:
```bash
python run.py
```

The API will be available at http://localhost:5000

## Development

### Creating a New Migration

After making changes to the models, create a new migration:
```bash
alembic revision --autogenerate -m "description of changes"
```

### Applying Migrations

Apply all pending migrations:
```bash
alembic upgrade head
```

### Running Tests

```bash
pytest
```

## API Documentation

API documentation is available at http://localhost:5000/docs when the server is running. 