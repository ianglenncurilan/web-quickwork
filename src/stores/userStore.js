import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const session = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Initialize user data from session
  async function initializeUser() {
    isLoading.value = true
    error.value = null
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      session.value = sessionData.session
      
      if (sessionData.session) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        
        user.value = userData.user
      }
    } catch (err) {
      console.error('Error initializing user:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with email and password
  async function signIn(email, password) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      session.value = data.session
      user.value = data.user
      
      return data
    } catch (err) {
      console.error('Error signing in:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Sign up with email and password
  async function signUp(email, password, userData = {}) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      session.value = data.session
      user.value = data.user
      
      return data
    } catch (err) {
      console.error('Error signing up:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  async function signOut() {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      session.value = null
      user.value = null
      
      return true
    } catch (err) {
      console.error('Error signing out:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Update user profile
  async function updateProfile(profileData) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          ...profileData
        }
      })
      
      if (updateError) throw updateError
      
      user.value = data.user
      
      return data
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)
  const userEmail = computed(() => user.value?.email || null)
  const userMetadata = computed(() => user.value?.user_metadata || {})

  return {
    user,
    session,
    isLoading,
    error,
    initializeUser,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated,
    userId,
    userEmail,
    userMetadata
  }
})
