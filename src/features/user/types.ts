export interface UserProfile {
  id: string
  email: string
  full_name?: string
  displayName?: string
  avatar_url?: string
  avatarUrl?: string
  preferred_categories?: string[]
  preferredCategories?: string[]
  subscriptionTier: string
  trialStatus: TrialStatus
  isNewsletterSubscribed?: boolean
  isAdmin?: boolean
  created_at: string
  updated_at: string
}

export interface TrialStatus {
  isTrial: boolean
  hasTrial: boolean
  trialStart?: string
  trialEnd?: string
  daysRemaining: number
  expired: boolean
}

export interface SignUpInput {
  email: string
  password: string
  recaptchaToken?: string
}

export interface SignInInput {
  email: string
  password: string
  recaptchaToken?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    profile: UserProfile
  }
}

export interface UserPreference {
  id: string
  user_id: string
  category_slug: string
  is_selected: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  slug: string
  name: string
  count: number
}

export interface PersonalizedNewsResponse {
  stiri: Array<{
    id: string
    title: string
    publicationDate: string
    content: unknown
    filename?: string
    viewCount?: number
    category?: string
  }>
  pagination: {
    totalCount: number
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
