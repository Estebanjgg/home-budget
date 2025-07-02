export interface Budget {
  id: string
  user_id: string
  name: string
  month: number
  year: number
  gross_income: number
  tithe_percentage: number
  tithe_enabled: boolean
  savings_amount: number
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface BudgetItem {
  id: string
  budget_id: string
  category_id: string | null
  type: 'income' | 'expense'
  description: string
  estimated_amount: number
  actual_amount: number | null
  due_date: string | null
  is_paid: boolean
  notes?: string | null  // Nuevo campo opcional
  created_at: string
  updated_at: string
  category?: ExpenseCategory
}

export interface BudgetSummary {
  totalIncome: number
  totalExpenses: number
  titheAmount: number
  savingsAmount: number
  remainingBalance: number
  netIncome: number // gross_income - tithe - savings
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface EducationalContent {
  id: string
  title: string
  summary: string
  content?: string
  type: 'article' | 'video'
  category: string
  duration: string
  image_emoji: string
  url?: string
  is_featured: boolean
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}