import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

export const useRatingStore = defineStore('ratings', () => {
  const ratings = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get all ratings
  async function fetchRatings() {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      ratings.value = data
    } catch (err) {
      console.error('Error fetching ratings:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Get ratings for a specific job post
  async function fetchJobRatings(jobId) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('ratings')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      return data
    } catch (err) {
      console.error(`Error fetching ratings for job ID ${jobId}:`, err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Get ratings by user
  async function fetchUserRatings(userId) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      return data
    } catch (err) {
      console.error(`Error fetching ratings for user ID ${userId}:`, err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Submit a new rating
  async function submitRating(ratingData) {
    isLoading.value = true
    error.value = null
    
    try {
      // Check if user has already rated this job
      const { data: existingRating, error: checkError } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', ratingData.userId)
        .eq('job_id', ratingData.jobId)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw checkError
      }
      
      let result
      
      if (existingRating) {
        // Update existing rating
        const { data, error: updateError } = await supabase
          .from('ratings')
          .update({
            rated_at: ratingData.rating,
            created_at: new Date().toISOString()
          })
          .eq('id', existingRating.id)
          .select()
        
        if (updateError) throw updateError
        result = data[0]
      } else {
        // Create new rating
        const { data, error: insertError } = await supabase
          .from('ratings')
          .insert([{
            user_id: ratingData.userId,
            job_id: ratingData.jobId,
            rated_at: ratingData.rating,
            created_at: new Date().toISOString()
          }])
          .select()
        
        if (insertError) throw insertError
        result = data[0]
      }
      
      // Update local state
      if (result) {
        const index = ratings.value.findIndex(r => 
          r.user_id === result.user_id && r.job_id === result.job_id
        )
        
        if (index !== -1) {
          ratings.value[index] = result
        } else {
          ratings.value.unshift(result)
        }
      }
      
      return result
    } catch (err) {
      console.error('Error submitting rating:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Calculate average rating for a job
  const getAverageRating = computed(() => {
    return (jobId) => {
      const jobRatings = ratings.value.filter(r => r.job_id === jobId)
      if (jobRatings.length === 0) return 0
      
      const sum = jobRatings.reduce((acc, curr) => acc + curr.rated_at, 0)
      return sum / jobRatings.length
    }
  })

  // Check if user has rated a job
  const hasUserRated = computed(() => {
    return (userId, jobId) => {
      return ratings.value.some(r => r.user_id === userId && r.job_id === jobId)
    }
  })

  return {
    ratings,
    isLoading,
    error,
    fetchRatings,
    fetchJobRatings,
    fetchUserRatings,
    submitRating,
    getAverageRating,
    hasUserRated
  }
})
