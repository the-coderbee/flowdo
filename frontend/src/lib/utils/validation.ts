import { z } from 'zod'
import { APP_CONSTANTS } from './constants'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`)
    this.name = 'ValidationError'
  }
}

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .max(APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH, `Password must be no more than ${APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const displayNameSchema = z
  .string()
  .min(APP_CONSTANTS.VALIDATION.DISPLAY_NAME_MIN_LENGTH, `Display name must be at least ${APP_CONSTANTS.VALIDATION.DISPLAY_NAME_MIN_LENGTH} characters`)
  .max(APP_CONSTANTS.VALIDATION.DISPLAY_NAME_MAX_LENGTH, `Display name must be no more than ${APP_CONSTANTS.VALIDATION.DISPLAY_NAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9\s._-]+$/, 'Display name can only contain letters, numbers, spaces, dots, underscores, and hyphens')

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  rememberMe: z.boolean().optional().default(false),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Task validation schemas
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(APP_CONSTANTS.TASK.MAX_TITLE_LENGTH, `Title must be no more than ${APP_CONSTANTS.TASK.MAX_TITLE_LENGTH} characters`),
  description: z
    .string()
    .max(APP_CONSTANTS.TASK.MAX_DESCRIPTION_LENGTH, `Description must be no more than ${APP_CONSTANTS.TASK.MAX_DESCRIPTION_LENGTH} characters`)
    .optional(),
  priority: z.enum(APP_CONSTANTS.TASK.PRIORITIES).optional().default('medium'),
  dueDate: z.date().optional(),
  isStarred: z.boolean().optional().default(false),
  groupId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional().default([]),
})

export const subtaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Subtask title is required')
    .max(255, 'Subtask title must be no more than 255 characters'),
  completed: z.boolean().optional().default(false),
})

// Tag validation schema
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(APP_CONSTANTS.VALIDATION.TAG_NAME_MAX_LENGTH, `Tag name must be no more than ${APP_CONSTANTS.VALIDATION.TAG_NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Tag name can only contain letters, numbers, spaces, dots, underscores, and hyphens'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color')
    .optional(),
})

// Group validation schema
export const groupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(APP_CONSTANTS.VALIDATION.GROUP_NAME_MAX_LENGTH, `Group name must be no more than ${APP_CONSTANTS.VALIDATION.GROUP_NAME_MAX_LENGTH} characters`),
  description: z
    .string()
    .max(500, 'Description must be no more than 500 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color')
    .optional(),
})

// Utility validation functions
export function validateEmail(email: string): ValidationResult {
  try {
    emailSchema.parse(email)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) }
    }
    return { valid: false, errors: ['Invalid email format'] }
  }
}

export function validatePassword(password: string): ValidationResult {
  try {
    passwordSchema.parse(password)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) }
    }
    return { valid: false, errors: ['Invalid password format'] }
  }
}

export function validateDisplayName(displayName: string): ValidationResult {
  try {
    displayNameSchema.parse(displayName)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) }
    }
    return { valid: false, errors: ['Invalid display name format'] }
  }
}

export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, errors: [`${fieldName} is required`] }
  }
  return { valid: true, errors: [] }
}

export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url)
    return { valid: true, errors: [] }
  } catch {
    return { valid: false, errors: ['Please enter a valid URL'] }
  }
}

export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      errors: [`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`] 
    }
  }
  return { valid: true, errors: [] }
}

export function validateFileSize(file: File, maxSize: number): ValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { 
      valid: false, 
      errors: [`File size exceeds ${maxSizeMB}MB limit`] 
    }
  }
  return { valid: true, errors: [] }
}

export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  if (startDate >= endDate) {
    return { valid: false, errors: ['End date must be after start date'] }
  }
  return { valid: true, errors: [] }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function validateAndSanitize<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  sanitizeStrings = true
): { data: T; errors: string[] } {
  try {
    let processedData = data
    
    if (sanitizeStrings && typeof data === 'object' && data !== null) {
      processedData = sanitizeObjectStrings(data)
    }
    
    const validatedData = schema.parse(processedData)
    return { data: validatedData, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        data: {} as T, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
      }
    }
    return { data: {} as T, errors: ['Validation failed'] }
  }
}

function sanitizeObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings)
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value)
    }
    return sanitized
  }
  
  return obj
}

export { z }
export type { z as ZodType }

export default {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateRequired,
  validateUrl,
  validateFileType,
  validateFileSize,
  validateDateRange,
  sanitizeInput,
  validateAndSanitize,
  schemas: {
    email: emailSchema,
    password: passwordSchema,
    displayName: displayNameSchema,
    login: loginSchema,
    register: registerSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
    task: taskSchema,
    subtask: subtaskSchema,
    tag: tagSchema,
    group: groupSchema,
  },
}