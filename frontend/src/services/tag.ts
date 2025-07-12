import { apiClient } from "@/lib/api/client"
import { Tag } from "@/types/task"

export interface CreateTagRequest {
  name: string
  color?: string
  user_id?: number
}

export interface UpdateTagRequest {
  id?: number
  name?: string
  color?: string
  user_id?: number
}

export class TagService {
  static async getAllTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>('/api/tags')
  }

  static async getTagsForUser(): Promise<(Tag & { task_count?: number })[]> {
    return apiClient.get<(Tag & { task_count?: number })[]>(`/api/tags`)
  }

  static async createTag(tag: CreateTagRequest): Promise<Tag & { task_count?: number }> {
    return apiClient.post<Tag & { task_count?: number }>('/api/tags/create', tag)
  }

  static async updateTag(id: number, updates: UpdateTagRequest): Promise<Tag> {
    return apiClient.put<Tag>(`/api/tags/${id}`, updates)
  }

  static async deleteTag(id: number): Promise<void> {
    return apiClient.delete(`/api/tags/${id}`)
  }

  static async getTagById(id: number): Promise<Tag> {
    return apiClient.get<Tag>(`/api/tags/${id}`)
  }

  static getColorOptions(): string[] {
    return [
      "#3b82f6", // Blue
      "#ef4444", // Red
      "#10b981", // Green
      "#f59e0b", // Yellow
      "#8b5cf6", // Purple
      "#f97316", // Orange
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#ec4899", // Pink
      "#6b7280"  // Gray
    ]
  }
}

export const tagService = TagService
export type { Tag as TagType }