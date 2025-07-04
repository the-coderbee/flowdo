"""create all tables

Revision ID: 874e78d9b760
Revises: 
Create Date: 2025-06-30 14:42:50.159351

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '874e78d9b760'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('email', sa.String(length=30), nullable=False),
    sa.Column('display_name', sa.String(length=30), nullable=False),
    sa.Column('psw_hash', sa.String(length=255), nullable=False),
    sa.Column('work_duration', sa.Integer(), nullable=True),
    sa.Column('short_break_duration', sa.Integer(), nullable=True),
    sa.Column('long_break_duration', sa.Integer(), nullable=True),
    sa.Column('session_count', sa.Integer(), nullable=True),
    sa.Column('sessions_until_long_break', sa.Integer(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_display_name'), ['display_name'], unique=False)
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)
        batch_op.create_index(batch_op.f('ix_users_id'), ['id'], unique=False)

    op.create_table('groups',
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=False),
    sa.Column('color', sa.String(length=255), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_groups_id'), ['id'], unique=False)

    op.create_table('tags',
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('tags', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tags_id'), ['id'], unique=False)

    op.create_table('user_tokens',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('jti', sa.String(length=36), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('token_type', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_user_tokens_jti'), ['jti'], unique=True)

    op.create_table('tasks',
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('priority', sa.Enum('low', 'medium', 'high', 'urgent', name='task_priority'), nullable=False),
    sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'archived', 'cancelled', name='task_status'), nullable=False),
    sa.Column('due_date', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('estimated_pomodoros', sa.Integer(), nullable=True),
    sa.Column('completed_pomodoros', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('group_id', sa.Integer(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tasks_id'), ['id'], unique=False)

    op.create_table('pomodoro_sessions',
    sa.Column('session_id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('session_type', sa.Enum('work', 'short_break', 'long_break', name='pomodoro_session_type'), nullable=False),
    sa.Column('status', sa.Enum('in_progress', 'completed', 'pending', 'archived', 'cancelled', name='task_status'), nullable=False),
    sa.Column('duration', sa.Integer(), nullable=False),
    sa.Column('start_time', sa.DateTime(), nullable=False),
    sa.Column('paused_at', sa.DateTime(), nullable=True),
    sa.Column('end_time', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('session_id')
    )
    with op.batch_alter_table('pomodoro_sessions', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_pomodoro_sessions_id'), ['id'], unique=False)

    op.create_table('subtasks',
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('is_completed', sa.Boolean(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('subtasks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_subtasks_id'), ['id'], unique=False)

    op.create_table('task_tags',
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('tag_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('task_tags', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_task_tags_id'), ['id'], unique=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('task_tags', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_task_tags_id'))

    op.drop_table('task_tags')
    with op.batch_alter_table('subtasks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_subtasks_id'))

    op.drop_table('subtasks')
    with op.batch_alter_table('pomodoro_sessions', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_pomodoro_sessions_id'))

    op.drop_table('pomodoro_sessions')
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tasks_id'))

    op.drop_table('tasks')
    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_user_tokens_jti'))

    op.drop_table('user_tokens')
    with op.batch_alter_table('tags', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tags_id'))

    op.drop_table('tags')
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_groups_id'))

    op.drop_table('groups')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_id'))
        batch_op.drop_index(batch_op.f('ix_users_email'))
        batch_op.drop_index(batch_op.f('ix_users_display_name'))

    op.drop_table('users')
    # ### end Alembic commands ### 