export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  dueDate: string | null;
  priority: TaskPriority;
  tags: Tag[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  groupId?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
}

export const sampleTags: Tag[] = [
  { id: 'tag1', name: 'Work', color: '#51557E' },
  { id: 'tag2', name: 'Personal', color: '#816797' },
  { id: 'tag3', name: 'Urgent', color: '#D14343' },
  { id: 'tag4', name: 'Learning', color: '#43A047' },
  { id: 'tag5', name: 'Project', color: '#1565C0' },
  { id: 'tag6', name: 'Meeting', color: '#FFA000' },
];

export const sampleGroups: TaskGroup[] = [
  { id: 'group1', name: 'Frontend Tasks' },
  { id: 'group2', name: 'Backend Tasks' },
  { id: 'group3', name: 'Personal Projects' },
];

export const sampleTasks: Task[] = [
  {
    id: 'task1',
    title: 'Implement user authentication',
    description: 'Create login and registration forms with proper validation',
    completed: false,
    createdAt: '2023-10-15T10:30:00Z',
    dueDate: '2023-10-25T17:00:00Z',
    priority: 'high',
    tags: [sampleTags[0], sampleTags[4]],
    estimatedPomodoros: 5,
    completedPomodoros: 2,
    groupId: 'group1',
  },
  {
    id: 'task2',
    title: 'Design database schema',
    description: 'Create ERD and implement database models',
    completed: true,
    createdAt: '2023-10-14T09:15:00Z',
    dueDate: '2023-10-20T16:00:00Z',
    priority: 'medium',
    tags: [sampleTags[0], sampleTags[4]],
    estimatedPomodoros: 4,
    completedPomodoros: 4,
    groupId: 'group2',
  },
  {
    id: 'task3',
    title: 'Weekly team meeting',
    description: 'Discuss project progress and upcoming milestones',
    completed: false,
    createdAt: '2023-10-16T14:00:00Z',
    dueDate: '2023-10-18T15:30:00Z',
    priority: 'medium',
    tags: [sampleTags[0], sampleTags[5]],
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    groupId: 'group1',
  },
  {
    id: 'task4',
    title: 'Learn React Server Components',
    description: 'Complete tutorial on Next.js 14 Server Components',
    completed: false,
    createdAt: '2023-10-12T12:00:00Z',
    dueDate: '2023-10-30T23:59:59Z',
    priority: 'low',
    tags: [sampleTags[3]],
    estimatedPomodoros: 6,
    completedPomodoros: 2,
  },
  {
    id: 'task5',
    title: 'Fix navigation bug in mobile view',
    description: 'The navbar dropdown menu disappears when clicking outside on mobile devices',
    completed: false,
    createdAt: '2023-10-17T09:00:00Z',
    dueDate: '2023-10-19T17:00:00Z',
    priority: 'urgent',
    tags: [sampleTags[0], sampleTags[2]],
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    groupId: 'group1',
  },
  {
    id: 'task6',
    title: 'Grocery shopping',
    description: 'Buy fruits, vegetables, and other essentials',
    completed: false,
    createdAt: '2023-10-17T10:00:00Z',
    dueDate: '2023-10-18T20:00:00Z',
    priority: 'medium',
    tags: [sampleTags[1]],
    estimatedPomodoros: 1,
    completedPomodoros: 0,
  },
  {
    id: 'task7',
    title: 'Implement API endpoints for tasks',
    description: 'Create REST API endpoints for CRUD operations on tasks',
    completed: false,
    createdAt: '2023-10-15T15:45:00Z',
    dueDate: '2023-10-24T17:00:00Z',
    priority: 'high',
    tags: [sampleTags[0], sampleTags[4]],
    estimatedPomodoros: 4,
    completedPomodoros: 1,
    groupId: 'group2',
  },
];