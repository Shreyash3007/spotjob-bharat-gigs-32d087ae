import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Hardcoded values for development (will be replaced by environment variables in production)
const supabaseUrl = "https://xsvexumsfjoiifprzmpt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdmV4dW1zZmpvaWlmcHJ6bXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNDAyODIsImV4cCI6MjA2MTYxNjI4Mn0.9CPICZXi5Lwy5LJ9CVqbBom3BuOantApD9IHRGhEhA0"

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
) 