import { apiClient } from "@/lib/api"

export interface Tag {
  id: number
  name: string
  color: string
  user_id: number
  task_count?: number
}

export interface CreateTagRequest {
  name: string
  color: string
  user_id: number
}

export interface UpdateTagRequest {
  id: number
  name: string
  color: string
  user_id: number
}

class TagService {
  private readonly endpoints = {
    tags: "/api/tags",
    userTags: (userId: number) => `/api/tags/${userId}`,
    tag: (tagId: number) => `/api/tags/${tagId}`,
  }

  /**
   * Get all tags for a user
   */
  async getTagsForUser(userId: number): Promise<Tag[]> {
    return apiClient.get<Tag[]>(this.endpoints.userTags(userId))
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: CreateTagRequest): Promise<Tag> {
    return apiClient.post<Tag>(this.endpoints.tags, tagData)
  }

  /**
   * Update an existing tag
   */
  async updateTag(tagId: number, tagData: Partial<UpdateTagRequest>): Promise<Tag> {
    return apiClient.put<Tag>(this.endpoints.tag(tagId), tagData)
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: number): Promise<void> {
    await apiClient.delete(this.endpoints.tag(tagId))
  }

  /**
   * Validate tag name
   */
  validateTagName(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!name || name.trim().length === 0) {
      errors.push("Tag name is required")
    }
    
    if (name.length > 30) {
      errors.push("Tag name must be 30 characters or less")
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get predefined color options
   */
  getColorOptions(): string[] {
    return [
      "#3b82f6", // blue
      "#10b981", // green
      "#ef4444", // red
      "#f59e0b", // yellow
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
      "#84cc16", // lime
    ]
  }
}

// Export singleton instance
export const tagService = new TagService()