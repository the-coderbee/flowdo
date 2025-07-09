import { ReactNode } from 'react'

// General utility types
export type ID = string | number
export type Timestamp = string | Date
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Nullable<T> = T | null
export type Undefineable<T> = T | undefined

// Environment types
export type Environment = 'development' | 'production' | 'test'

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  badge?: string | number
  children?: NavigationItem[]
  disabled?: boolean
  external?: boolean
}

export interface Breadcrumb {
  label: string
  href?: string
  current?: boolean
}

// UI Component types
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

export interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: NotificationAction[]
  persistent?: boolean
}

export interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline'
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
}

// Table types
export interface TableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => ReactNode
}

export interface TableProps<T = unknown> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  emptyMessage?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T, index: number) => void
  selectedRows?: string[]
  onSelectionChange?: (selectedRows: string[]) => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
}

// Form types
export interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: SelectOption[]
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (value: unknown) => boolean
}

export interface FormError {
  field: string
  message: string
}

// Search types
export interface SearchResult<T = unknown> {
  items: T[]
  total: number
  query: string
  suggestions?: string[]
  facets?: SearchFacet[]
}

export interface SearchFacet {
  name: string
  values: Array<{
    value: string
    count: number
    selected?: boolean
  }>
}

export interface SearchFilters {
  [key: string]: string | string[] | number | boolean | undefined
}

// File types
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  url?: string
}

export interface UploadedFile extends FileInfo {
  id: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  userId?: string
  timestamp?: Date
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

// Error types
export interface AppError {
  id: string
  name: string
  message: string
  stack?: string
  code?: string | number
  timestamp: Date
  context?: Record<string, unknown>
  user?: {
    id: string
    email: string
  }
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: {
    componentStack: string
  }
}

// Dashboard types
export interface DashboardWidget {
  id: string
  title: string
  type: 'chart' | 'stat' | 'list' | 'calendar' | 'custom'
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config?: Record<string, unknown>
  data?: unknown
  loading?: boolean
  error?: string
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  readonly?: boolean
}

// Settings types
export interface UserPreferences {
  theme: Theme
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
    sound: boolean
  }
  dashboard: {
    defaultView: string
    widgetSettings: Record<string, unknown>
  }
  privacy: {
    analytics: boolean
    errorReporting: boolean
  }
}

export interface AppSettings {
  app: {
    name: string
    version: string
    environment: Environment
  }
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    [key: string]: boolean
  }
  limits: {
    maxFileSize: number
    maxFiles: number
    requestTimeout: number
  }
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  global?: boolean
  disabled?: boolean
}

// Context menu types
export interface ContextMenuItem {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
  onClick?: () => void
}

// Generic state types for providers
export interface ProviderState<T> {
  data: T
  loading: boolean
  error: string | null
  initialized: boolean
}

// Utility types for forms
export type FormValues = Record<string, unknown>
export type FormErrors = Record<string, string>
export type FormTouched = Record<string, boolean>

export interface FormState {
  values: FormValues
  errors: FormErrors
  touched: FormTouched
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

// Generic CRUD operations
export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  list: (params?: QueryParams) => Promise<T[]>
  get: (id: ID) => Promise<T>
  create: (data: CreateT) => Promise<T>
  update: (id: ID, data: UpdateT) => Promise<T>
  delete: (id: ID) => Promise<void>
}

// Color types
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type ColorIntensity = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

// Size types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

// Layout types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

// Component variant types
export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive'
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'
export type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

// Export utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

export default ID