import { getToken } from "./auth";

export enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
}

export enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ARCHIVED = "archived",
    CANCELLED = "cancelled",
}

export interface TaskCreateRequest {
    title: string;
    description: string | null;
    priority: TaskPriority | null;
    status: TaskStatus | null;
    due_date: string | null;
    estimated_pomodoros: number | null;
    completed_pomodoros: number | null;
    user_id: number;
    group_id: number | null;
}

export interface TaskUpdateRequest {
    id: number;
    title?: string;
    description?: string | null;
    priority?: TaskPriority | null;
    status?: TaskStatus | null;
    due_date?: string | null;
    estimated_pomodoros?: number | null;
    completed_pomodoros?: number | null;
}

export interface TaskResponse {
    id: number;
    title: string;
    description: string | null;
    priority: TaskPriority | null;
    status: TaskStatus | null;
    due_date: string | null;
    estimated_pomodoros: number | null;
    completed_pomodoros: number | null;
    user_id: number;
    group_id: number | null;
    completed_at: string | null;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getTasks(user_id: number): Promise<TaskResponse[]> {
    const token = getToken();
    
    try {
        const response = await fetch(`${API_URL}/tasks/${user_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            console.error('Error response:', await response.text());
            throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return []; // Return empty array instead of throwing to prevent infinite loading state
    }
}

async function createTask(task: TaskCreateRequest): Promise<TaskResponse> {
    const token = getToken();
    
    try {
        console.log('Creating task with payload:', task);
        console.log('Priority type:', typeof task.priority);
        console.log('Priority value:', task.priority);
        console.log('JSON payload:', JSON.stringify(task));
        
        const response = await fetch(`${API_URL}/tasks/create`, {
            method: 'POST',
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error creating task:', errorText);
            throw new Error(`Failed to create task: ${errorText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error in createTask:', error);
        throw error;
    }
}

async function updateTask(task: TaskUpdateRequest): Promise<TaskResponse> {
    const token = getToken();
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to update task');
    }
    
    return response.json();
}

async function deleteTask(taskId: number): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete task');
    }
}

async function toggleTaskComplete(taskId: number, completed: boolean): Promise<TaskResponse> {
    const token = getToken();
    const status = completed ? TaskStatus.COMPLETED : TaskStatus.PENDING;
    
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to update task status');
    }
    
    return response.json();
}

export { getTasks, createTask, updateTask, deleteTask, toggleTaskComplete };
