"""update user_token table

Revision ID: dd7428e4ab16
Revises: 874e78d9b760
Create Date: 2025-07-03 08:28:14.698532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd7428e4ab16'
down_revision: Union[str, None] = '874e78d9b760'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.add_column(sa.Column('revoked', sa.Boolean(), nullable=False, server_default='false'))

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user_tokens', schema=None) as batch_op:
        batch_op.drop_column('revoked')

    # ### end Alembic commands ### 