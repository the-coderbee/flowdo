from pydantic import BaseModel
from typing import Optional
from datetime import date


class DashboardFilterRequest(BaseModel):
    """Schema for analytics filtering."""

    start_date: Optional[date] = None
    end_date: Optional[date] = None
    timeframe: Optional[str] = "daily"
    include_abandoned: bool = False
