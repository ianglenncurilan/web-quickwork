import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

export const useJobPostStore = defineStore('jobPosts', () => {
  const jobPosts = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get all job posts
  async function fetchJobPosts() {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      jobPosts.value = data
    } catch (err) {
      console.error('Error fetching job posts:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Get job posts by user_id (for employers)
  async function fetchUserJobPosts(userId) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      return data
    } catch (err) {
      console.error('Error fetching user job posts:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Get job post by ID
  async function fetchJobPostById(id) {
    isLoading.value = true
    error.value = null
    
    try {
      // Convert string ID to number if needed
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // First try to get the job post from the local state
      const localJobPost = jobPosts.value.find(post => post.id === numericId);
      if (localJobPost) {
        return localJobPost;
      }
      
      // If not found locally, fetch from Supabase
      const { data, error: supabaseError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', numericId)
      
      if (supabaseError) throw supabaseError
      
      // If we got data back but it's an array, take the first item
      if (data && Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      
      return data
    } catch (err) {
      console.error(`Error fetching job post with ID ${id}:`, err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Create a new job post
  async function createJobPost(jobData) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('job_posts')
        .insert([{
          job_name: jobData.jobName,
          job_description: jobData.jobDescription,
          user_id: jobData.userId,
          monthly_rate: jobData.monthlyRate,
          job_link: jobData.jobLink || null,
          job_type: jobData.jobType,
          imageurl: jobData.imageUrl || null,
          posted_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
      
      if (supabaseError) throw supabaseError
      
      // Add the new job post to the local state
      if (data && data.length > 0) {
        jobPosts.value.unshift(data[0])
      }
      
      return data[0]
    } catch (err) {
      console.error('Error creating job post:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update a job post
  async function updateJobPost(id, jobData) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('job_posts')
        .update({
          job_name: jobData.jobName,
          job_description: jobData.jobDescription,
          monthly_rate: jobData.monthlyRate,
          job_link: jobData.jobLink || null,
          job_type: jobData.jobType,
          imageurl: jobData.imageUrl || null,
        })
        .eq('id', id)
        .select()
      
      if (supabaseError) throw supabaseError
      
      // Update the job post in the local state
      const index = jobPosts.value.findIndex(post => post.id === id)
      if (index !== -1 && data && data.length > 0) {
        jobPosts.value[index] = data[0]
      }
      
      return data[0]
    } catch (err) {
      console.error(`Error updating job post with ID ${id}:`, err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Delete a job post
  async function deleteJobPost(id) {
    isLoading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', id)
      
      if (supabaseError) throw supabaseError
      
      // Remove the job post from the local state
      jobPosts.value = jobPosts.value.filter(post => post.id !== id)
      
      return true
    } catch (err) {
      console.error(`Error deleting job post with ID ${id}:`, err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Get job post by ID (computed)
  const getJobPostById = computed(() => {
    return (id) => jobPosts.value.find(post => post.id === id)
  })

  return {
    jobPosts,
    isLoading,
    error,
    fetchJobPosts,
    fetchUserJobPosts,
    fetchJobPostById,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    getJobPostById
  }
})
