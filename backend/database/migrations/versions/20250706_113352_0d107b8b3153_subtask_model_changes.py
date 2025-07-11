"""subtask model changes

Revision ID: 0d107b8b3153
Revises: dd7428e4ab16
Create Date: 2025-07-06 11:33:52.878599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d107b8b3153'
down_revision: Union[str, None] = 'dd7428e4ab16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.VARCHAR(length=255),
               server_default=None,
               type_=sa.String(length=7),
               existing_nullable=True)

    with op.batch_alter_table('subtasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('position', sa.Integer(), nullable=False))
        batch_op.create_index('ix_subtasks_task_id', ['task_id'], unique=False)
        batch_op.create_index('ix_subtasks_task_position', ['task_id', 'position'], unique=False)
        batch_op.drop_constraint('subtasks_task_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'tasks', ['task_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('tags', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.VARCHAR(length=7),
               server_default=None,
               nullable=False)

    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.alter_column('revoked',
               existing_type=sa.BOOLEAN(),
               server_default=None,
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.alter_column('revoked',
               existing_type=sa.BOOLEAN(),
               server_default=sa.text('false'),
               existing_nullable=False)

    with op.batch_alter_table('tags', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.VARCHAR(length=7),
               server_default=sa.text("'#3b82f6'::character varying"),
               nullable=True)

    with op.batch_alter_table('subtasks', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('subtasks_task_id_fkey', 'tasks', ['task_id'], ['id'])
        batch_op.drop_index('ix_subtasks_task_position')
        batch_op.drop_index('ix_subtasks_task_id')
        batch_op.drop_column('position')
        batch_op.drop_column('description')

    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.alter_column('color',
               existing_type=sa.String(length=7),
               server_default=sa.text("'#3b82f6'::character varying"),
               type_=sa.VARCHAR(length=255),
               existing_nullable=True)

    # ### end Alembic commands ### 