from datetime import datetime, UTC, date, time, timezone
from typing import List, Optional, Dict, Any, Union

from sqlalchemy import asc, desc, or_, and_

from database.models.tag import Tag
from database.repositories.base_repository import BaseRepository
from database.models.task import Task
from database.models.tasktag import TaskTag

from sqlalchemy.orm import Session, Query, joinedload

from logger import get_logger

logger = get_logger(__name__)


class TaskRepository(BaseRepository[Task]):
    """Repository for Task model operations."""

    def __init__(self, session: Session):
        """Initialize the repository with the Task model."""
        super().__init__(Task, session)

    def create_task(self, task: Task) -> Task:
        """Create a new task."""
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task

    def update_task(self, task: Task) -> Task:
        """Update a task."""
        task.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(task)
        return task

    def _apply_filters(self, query: Query, filters: Dict[str, Any]) -> Query:
        """Apply filters to the query."""

        # Status filter
        if status := filters.get("status"):
            if isinstance(status, list):
                query = query.filter(Task.status.in_(status))
            else:
                query = query.filter(Task.status == status)

        # Priority filter
        if priority := filters.get("priority"):
            if isinstance(priority, list):
                query = query.filter(Task.priority.in_(priority))
            else:
                query = query.filter(Task.priority == priority)

        # Starred filter
        if "starred" in filters:
            query = query.filter(Task.starred == bool(filters["starred"]))

        # Completed filter (redundant with status, but keeping for API compatibility)
        if "completed" in filters:
            is_completed = bool(filters["completed"])
            if is_completed:
                query = query.filter(Task.status == "completed")
            else:
                query = query.filter(Task.status != "completed")

        # Due date filter - expect date objects from Pydantic
        if due_date_filter := filters.get("due_date"):
            if isinstance(due_date_filter, dict):
                # Range filter: {"from": date, "to": date}
                if from_date := due_date_filter.get("from"):
                    query = query.filter(Task.due_date >= from_date)
                if to_date := due_date_filter.get("to"):
                    query = query.filter(Task.due_date <= to_date)
            else:
                # Single date filter
                query = query.filter(Task.due_date == due_date_filter)

        # Created at filter - expect datetime objects from Pydantic
        if created_at_filter := filters.get("created_at"):
            if isinstance(created_at_filter, dict):
                if from_datetime := created_at_filter.get("from"):
                    query = query.filter(Task.created_at >= from_datetime)
                if to_datetime := created_at_filter.get("to"):
                    # If it's a date, convert to end of day
                    if isinstance(to_datetime, date) and not isinstance(
                        to_datetime, datetime
                    ):
                        to_datetime = datetime.combine(to_datetime, time(23, 59, 59))
                    query = query.filter(Task.created_at <= to_datetime)

        # Search filter
        if search_term := filters.get("search"):
            search_pattern = f"%{search_term.strip()}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern),
                )
            )

        # Group filter
        if "group_id" in filters:
            group_id = filters["group_id"]
            if group_id == 0 or group_id is None:
                query = query.filter(Task.group_id.is_(None))
            else:
                query = query.filter(Task.group_id == group_id)

        # Overdue filter
        if filters.get("overdue"):
            current_date = datetime.now(timezone.utc).date()
            query = query.filter(
                and_(Task.due_date < current_date, Task.status != "completed")
            )

        # Tags filter - fixed the relationship query
        if tags := filters.get("tags"):
            if not isinstance(tags, list):
                tags = [tags]

            # Filter by tag names using the relationship
            for tag_name in tags:
                query = query.filter(
                    Task.tags.any(TaskTag.tag.has(Tag.name == tag_name))
                )

        return query

    def _apply_sorting(self, query: Query, sort_by: str, sort_order: str) -> Query:
        """Apply sorting to the query."""
        allowed_sort_fields = {
            "title": Task.title,
            "status": Task.status,
            "priority": Task.priority,
            "due_date": Task.due_date,
            "created_at": Task.created_at,
            "updated_at": Task.updated_at,
            "starred": Task.starred,
        }
        if sort_by not in allowed_sort_fields:
            logger.warning(f"Invalid sort field: {sort_by}, defaulting to created_at")
            sort_by = "created_at"

        sort_field = allowed_sort_fields[sort_by]

        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_field))
        else:
            query = query.order_by(desc(sort_field))

        return query

    def get_task_by_id(self, task_id: int) -> Task:
        """Get a task by its ID."""
        return (
            self.session.query(Task)
            .options(
                joinedload(Task.tags).joinedload(TaskTag.tag), joinedload(Task.subtasks)
            )
            .filter(Task.id == task_id)
            .first()
        )

    def get_today_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are due today."""
        today = datetime.now(UTC).date()
        filters = {
            "due_date": {
                "from": today,
                "to": today,
            }
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_overdue_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are overdue."""
        filters = {
            "overdue": True,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_starred_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are starred."""
        filters = {
            "starred": True,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_completed_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are completed."""
        filters = {
            "completed": True,
        }
        results = self.get_all_tasks_for_user(
            user_id, filters, sort_by="updated_at", page_size=10
        )
        return results["tasks"]

    def search_tasks(self, user_id: int, search_query: str) -> List[Task]:
        """Search for tasks by title or description."""
        filters = {
            "search": search_query,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_tasks_by_priorities(
        self, user_id: int, priority_list: List[str]
    ) -> List[Task]:
        """Get all tasks for a user by priority."""
        filters = {
            "priority": priority_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_tasks_by_statuses(self, user_id: int, status_list: List[str]) -> List[Task]:
        """Get all tasks for a user by status."""
        filters = {
            "status": status_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_tasks_by_tags(self, user_id: int, tags_list: List[str]) -> List[Task]:
        """Get all tasks for a user by tag."""
        filters = {
            "tags": tags_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_tasks_by_group(self, user_id: int, group_id: int) -> List[Task]:
        """Get all tasks for a user by group."""
        filters = {
            "group_id": group_id,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=100)
        return results["tasks"]

    def get_all_tasks_for_user(
        self,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 25,
    ) -> Dict[str, Any]:
        """Get all tasks for a user."""
        query = self.session.query(Task).filter(Task.user_id == user_id)

        # Apply filters first
        if filters:
            query = self._apply_filters(query, filters)

        total_count = query.count()

        # Apply sorting
        query = self._apply_sorting(query, sort_by, sort_order)

        # Add eager loading for tags and their related tag objects
        query = query.options(
            joinedload(Task.tags).joinedload(TaskTag.tag), joinedload(Task.subtasks)
        )

        # Apply pagination
        offset = (page - 1) * page_size
        tasks = query.offset(offset).limit(page_size).all()

        total_pages = (total_count + page_size - 1) // page_size

        return {
            "tasks": tasks,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    def count_tasks_by_date(self, user_id: int, target_date: date) -> int:
        """Count tasks created on a specific date."""
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        count = (
            self.session.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.created_at >= start_datetime,
                Task.created_at <= end_datetime,
            )
            .count()
        )

        return count

    def count_completed_tasks_by_date(self, user_id: int, target_date: date) -> int:
        """Count completed tasks on a specific date."""
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        count = (
            self.session.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status == "completed",
                Task.completed_at >= start_datetime,
                Task.completed_at <= end_datetime,
            )
            .count()
        )

        return count

    def count_tasks_by_date_range(
        self, user_id: int, start_date: date, end_date: date
    ) -> int:
        """Count tasks created within a date range."""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())

        count = (
            self.session.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.created_at >= start_datetime,
                Task.created_at <= end_datetime,
            )
            .count()
        )

        return count

    def count_completed_tasks_by_date_range(
        self, user_id: int, start_date: date, end_date: date
    ) -> int:
        """Count completed tasks within a date range."""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())

        count = (
            self.session.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status == "completed",
                Task.completed_at >= start_datetime,
                Task.completed_at <= end_datetime,
            )
            .count()
        )

        return count

    def get_recent_completed_tasks(self, user_id: int, limit: int = 5) -> List[Task]:
        """Get recently completed tasks."""
        tasks = (
            self.session.query(Task)
            .filter(Task.user_id == user_id, Task.status == "completed")
            .order_by(desc(Task.completed_at))
            .limit(limit)
            .all()
        )

        return tasks

    def get_tasks_with_deadlines(self, user_id: int, end_date: date) -> List[Task]:
        """Get tasks with deadlines before the end_date."""
        end_datetime = datetime.combine(end_date, datetime.max.time())

        tasks = (
            self.session.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.due_date.isnot(None),
                Task.due_date <= end_datetime,
                Task.status != "completed",
            )
            .order_by(asc(Task.due_date))
            .all()
        )

        return tasks

    def delete_task(self, task: Task) -> None:
        """Delete a task."""
        self.session.delete(task)
        self.session.flush()
