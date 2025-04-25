import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Define and export formActionDefault
export const formActionDefault = {
  formProcessing: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: '',
}