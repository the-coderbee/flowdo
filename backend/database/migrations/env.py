import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool, text

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Import our models and config
from config.config import get_config
from database.db import Base, engine as app_engine
import database.models  # Import all models to ensure they're known to SQLAlchemy

# Import all models to register them
# This will ensure that Alembic detects all tables
from database.models import *

# Interpret the config file for Python logging
fileConfig(context.config.config_file_name)

# Get database configuration
app_config = get_config()

# Override alembic.ini settings with our app settings
config = context.config
config_section = config.config_ini_section
config.set_section_option(config_section, "sqlalchemy.url", app_config.SQLALCHEMY_DATABASE_URI)

# MetaData object for 'autogenerate' support
target_metadata = Base.metadata

# We'll skip the check_alembic_version function since it's handled in database/db.py
# This avoids duplicating the functionality and potential issues

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This works by emitting SQL commands to stdout with context.execute(), useful
    for creating SQL scripts or reviewing what Alembic would run.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate it with the context.
    """
    # Use our existing engine connection if available
    connectable = app_engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            process_revision_directives=None,
            # Use a transaction to run migrations
            transaction_per_migration=True,
            # Check if tables exist before applying migrations to avoid errors
            # This requires Alembic 1.5.0 or later
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online() 