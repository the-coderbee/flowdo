import { apiClient } from "@/lib/api"

export interface Group {
  id: number
  name: string
  user_id: number
  task_count?: number
}

export interface CreateGroupRequest {
  name: string
  user_id: number
}

export interface UpdateGroupRequest {
  id: number
  name: string
  user_id: number
}

class GroupService {
  private readonly endpoints = {
    groups: "/api/groups",
    userGroups: (userId: number) => `/api/groups/${userId}`,
    group: (groupId: number) => `/api/groups/${groupId}`,
  }

  /**
   * Get all groups for a user
   */
  async getGroupsForUser(userId: number): Promise<Group[]> {
    return apiClient.get<Group[]>(this.endpoints.userGroups(userId))
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    return apiClient.post<Group>(this.endpoints.groups, groupData)
  }

  /**
   * Update an existing group
   */
  async updateGroup(groupId: number, groupData: Partial<UpdateGroupRequest>): Promise<Group> {
    return apiClient.put<Group>(this.endpoints.group(groupId), groupData)
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: number): Promise<void> {
    await apiClient.delete(this.endpoints.group(groupId))
  }

  /**
   * Validate group name
   */
  validateGroupName(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!name || name.trim().length === 0) {
      errors.push("Group name is required")
    }
    
    if (name.length > 50) {
      errors.push("Group name must be 50 characters or less")
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const groupService = new GroupService()