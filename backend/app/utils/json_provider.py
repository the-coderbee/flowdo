# app/utils/json_provider.py

from flask.json.provider import DefaultJSONProvider
from sqlalchemy.orm import DeclarativeMeta

class AlchemyJSONProvider(DefaultJSONProvider):
    def default(self, o):
        # Check for SQLAlchemy declarative classes
        if isinstance(o.__class__, DeclarativeMeta):
            return {
                c.key: getattr(o, c.key)
                for c in o.__table__.columns
            }
        return super().default(o)
