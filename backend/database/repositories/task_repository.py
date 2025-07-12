from datetime import datetime, UTC, date
from typing import List, Optional, Dict, Any, Union

from sqlalchemy import asc, desc, or_, and_

from database.repositories.base_repository import BaseRepository
from database.models.task import Task
from database.models.tasktag import TaskTag

from sqlalchemy.orm import Session, Query, joinedload

from logger import get_logger

logger = get_logger(__name__)


class TaskRepository(BaseRepository[Task]):
    """Repository for Task model operations."""

    def __init__(self, db_session: Session):
        """Initialize the repository with the Task model."""
        super().__init__(Task)
        self.db = db_session

    def _apply_filters(self, query: Query, filters: Dict[str, Any]) -> Query:
        """Apply filters to the query."""
        # status filter
        if "status" in filters and filters["status"]:
            status = filters["status"]
            if isinstance(status, list):
                query = query.filter(Task.status.in_(status))
            else:
                query = query.filter(Task.status == status)

        # priority filter
        if "priority" in filters and filters["priority"]:
            priority = filters["priority"]
            if isinstance(priority, list):
                query = query.filter(Task.priority.in_(priority))
            else:
                query = query.filter(Task.priority == priority)

        # starred filter
        if "starred" in filters and filters["starred"]:
            query = query.filter(Task.starred == bool(filters["starred"]))

        # completed filter
        if "completed" in filters and filters["completed"]:
            is_completed = filters["completed"]
            if is_completed:
                query = query.filter(Task.status == "completed")
            else:
                query = query.filter(Task.status != "completed")

        # due_date range filter
        if "due_date" in filters and filters["due_date"]:
            due_date_filter = filters["due_date"]
            if isinstance(due_date_filter, dict):
                if "from" in due_date_filter and due_date_filter["from"]:
                    from_date = self._parse_date(due_date_filter["from"])
                    if from_date:
                        query = query.filter(Task.due_date >= from_date)
                if "to" in due_date_filter and due_date_filter["to"]:
                    to_date = self._parse_date(due_date_filter["to"])
                    if to_date:
                        query = query.filter(Task.due_date <= to_date)
            else:
                single_date = self._parse_date(due_date_filter)
                if single_date:
                    query = query.filter(Task.due_date == single_date)

        # search filter
        if "search" in filters and filters["search"]:
            search_term = filters["search"]

        if "created_at" in filters and filters["created_at"]:
            created_at_filter = filters["created_at"]
            if isinstance(created_at_filter, dict):
                if "from" in created_at_filter and created_at_filter["from"]:
                    from_date = self._parse_date(created_at_filter["from"])
                    if from_date:
                        query = query.filter(Task.created_at >= from_date)

                if "to" in created_at_filter and created_at_filter["to"]:
                    to_date = self._parse_date(created_at_filter["to"])
                    if to_date:
                        to_date_end = datetime.combine(to_date, datetime.max.time())
                        query = query.filter(Task.created_at <= to_date_end)

        if "search" in filters and filters["search"]:
            search_term = f"%{filters['search'].strip()}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term),
                )
            )

        if "group_id" in filters and filters["group_id"]:
            if filters["group_id"] == 0:
                query = query.filter(Task.group_id.is_(None))
            else:
                query = query.filter(Task.group_id == filters["group_id"])

        if "overdue" in filters and filters["overdue"]:
            current_date = datetime.now(UTC)
            query = query.filter(
                and_(Task.due_date < current_date, Task.status != "completed")
            )

        if "tags" in filters and filters["tags"]:
            if isinstance(filters["tags"], list):
                tags = filters["tags"]
            else:
                tags = [filters["tags"]]

            for tag in tags:
                query = query.filter(Task.tags.any(Task.tags.any(name == tag)))  # type: ignore

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

    def _parse_date(self, date_input: Union[str, date, datetime]) -> Optional[datetime]:
        """Parse a date input into a datetime object."""
        if isinstance(date_input, date):
            return datetime.combine(date_input, datetime.min.time())
        elif isinstance(date_input, datetime):
            return date_input.date()
        elif isinstance(date_input, str):
            try:
                for fmt in ["%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"]:
                    try:
                        return datetime.strptime(date_input, fmt).date()
                    except ValueError:
                        continue
                logger.warning(f"Could not parse date: {date_input}")
            except Exception as e:
                logger.error(f"Error parsing date {date_input}: {str(e)}")
            return None

    def get_task_by_id(self, task_id: int) -> Task:
        """Get a task by its ID."""
        return (
            self.db.query(Task)
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
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_overdue_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are overdue."""
        filters = {
            "overdue": True,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_starred_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user that are starred."""
        filters = {
            "starred": True,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
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
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_tasks_by_priorities(
        self, user_id: int, priority_list: List[str]
    ) -> List[Task]:
        """Get all tasks for a user by priority."""
        filters = {
            "priority": priority_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_tasks_by_statuses(self, user_id: int, status_list: List[str]) -> List[Task]:
        """Get all tasks for a user by status."""
        filters = {
            "status": status_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_tasks_by_tags(self, user_id: int, tags_list: List[str]) -> List[Task]:
        """Get all tasks for a user by tag."""
        filters = {
            "tags": tags_list,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_tasks_by_group(self, user_id: int, group_id: int) -> List[Task]:
        """Get all tasks for a user by group."""
        filters = {
            "group_id": group_id,
        }
        results = self.get_all_tasks_for_user(user_id, filters, page_size=1000)
        return results["tasks"]

    def get_all_tasks_for_user(
        self,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ) -> Dict[str, Any]:
        """Get all tasks for a user."""
        try:
            query = self.db.query(Task).filter(Task.user_id == user_id)

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
        except Exception as e:
            logger.error(f"Error getting all tasks for user {user_id}: {str(e)}")
            raise

    def create_task(self, task: Task) -> Task:
        """Create a new task."""
        try:
            self.db.add(task)
            self.db.flush()  # Use flush instead of commit to keep transaction open
            self.db.refresh(task)
            return task
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating task: {e}")
            raise e

    def update_task(self, task: Task) -> Task:
        """Update a task."""
        try:
            task.updated_at = datetime.now(UTC)
            self.db.flush()  # Use flush instead of commit to keep transaction open
            self.db.refresh(task)
            return task
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating task: {e}")
            raise e

    def delete_task(self, task: Task) -> None:
        """Delete a task."""
        try:
            self.db.delete(task)
            self.db.flush()  # Use flush instead of commit to keep transaction open
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting task: {e}")
            raise e

    def count_tasks_by_date(self, user_id: int, target_date: date) -> int:
        """Count tasks created on a specific date."""
        try:
            start_datetime = datetime.combine(target_date, datetime.min.time())
            end_datetime = datetime.combine(target_date, datetime.max.time())

            count = (
                self.db.query(Task)
                .filter(
                    Task.user_id == user_id,
                    Task.created_at >= start_datetime,
                    Task.created_at <= end_datetime,
                )
                .count()
            )

            return count
        except Exception as e:
            logger.error(f"Error counting tasks by date for user {user_id}: {str(e)}")
            return 0

    def count_completed_tasks_by_date(self, user_id: int, target_date: date) -> int:
        """Count completed tasks on a specific date."""
        try:
            start_datetime = datetime.combine(target_date, datetime.min.time())
            end_datetime = datetime.combine(target_date, datetime.max.time())

            count = (
                self.db.query(Task)
                .filter(
                    Task.user_id == user_id,
                    Task.status == "completed",
                    Task.completed_at >= start_datetime,
                    Task.completed_at <= end_datetime,
                )
                .count()
            )

            return count
        except Exception as e:
            logger.error(
                f"Error counting completed tasks by date for user {user_id}: {str(e)}"
            )
            return 0

    def count_tasks_by_date_range(
        self, user_id: int, start_date: date, end_date: date
    ) -> int:
        """Count tasks created within a date range."""
        try:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())

            count = (
                self.db.query(Task)
                .filter(
                    Task.user_id == user_id,
                    Task.created_at >= start_datetime,
                    Task.created_at <= end_datetime,
                )
                .count()
            )

            return count
        except Exception as e:
            logger.error(
                f"Error counting tasks by date range for user {user_id}: {str(e)}"
            )
            return 0

    def count_completed_tasks_by_date_range(
        self, user_id: int, start_date: date, end_date: date
    ) -> int:
        """Count completed tasks within a date range."""
        try:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())

            count = (
                self.db.query(Task)
                .filter(
                    Task.user_id == user_id,
                    Task.status == "completed",
                    Task.completed_at >= start_datetime,
                    Task.completed_at <= end_datetime,
                )
                .count()
            )

            return count
        except Exception as e:
            logger.error(
                f"Error counting completed tasks by date range for user {user_id}: {str(e)}"
            )
            return 0

    def get_recent_completed_tasks(self, user_id: int, limit: int = 5) -> List[Task]:
        """Get recently completed tasks."""
        try:
            tasks = (
                self.db.query(Task)
                .filter(Task.user_id == user_id, Task.status == "completed")
                .order_by(desc(Task.completed_at))
                .limit(limit)
                .all()
            )

            return tasks
        except Exception as e:
            logger.error(
                f"Error getting recent completed tasks for user {user_id}: {str(e)}"
            )
            return []

    def get_tasks_with_deadlines(self, user_id: int, end_date: date) -> List[Task]:
        """Get tasks with deadlines before the end_date."""
        try:
            end_datetime = datetime.combine(end_date, datetime.max.time())

            tasks = (
                self.db.query(Task)
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
        except Exception as e:
            logger.error(
                f"Error getting tasks with deadlines for user {user_id}: {str(e)}"
            )
            return []
