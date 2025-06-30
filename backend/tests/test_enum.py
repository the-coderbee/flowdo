# Create a standalone test file (test_enum_debug.py) to run this

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.database.models.task import TaskPriority, TaskStatus

# Create engine and session
engine = create_engine("postgresql://postgres:postgres@localhost:5432/flowdo_dev")  # Replace with your actual DB URL
Session = sessionmaker(bind=engine)
session = Session()

def test_enum_conversion():
    print("=== Testing Enum Conversion ===")
    
    # Test 1: Check what values the Python enums have
    print(f"TaskPriority.MEDIUM: {TaskPriority.MEDIUM}")
    print(f"TaskPriority.MEDIUM.value: {TaskPriority.MEDIUM.value}")
    print(f"Type: {type(TaskPriority.MEDIUM)}")
    
    # Test 2: Check what's in the database
    result = session.execute(text("""
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_priority')
        ORDER BY enumsortorder
    """))
    db_enum_values = [row[0] for row in result.fetchall()]
    print(f"Database enum values: {db_enum_values}")
    
    # Test 3: Try to insert directly with SQLAlchemy
    try:
        # Test raw SQL insert
        session.execute(text("""
            INSERT INTO tasks (title, priority, status, user_id, created_at, updated_at) 
            VALUES ('test', :priority, :status, 1, NOW(), NOW())
        """), {
            'priority': TaskPriority.MEDIUM.value,  # Use .value to get string
            'status': TaskStatus.PENDING.value
        })
        session.rollback()  # Don't actually save
        print("Direct SQL insert with .value worked")
    except Exception as e:
        session.rollback()
        print(f"Direct SQL insert with .value failed: {e}")
    
    # Test 4: Check SQLAlchemy enum column definition
    from backend.database.models.task import Task
    priority_column = Task.__table__.columns['priority']
    print(f"Priority column type: {priority_column.type}")
    print(f"Priority column type class: {priority_column.type.__class__}")
    
    session.close()

if __name__ == "__main__":
    test_enum_conversion()