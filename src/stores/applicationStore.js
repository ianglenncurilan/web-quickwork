import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

export const useApplicationStore = defineStore('applications', () => {
  const applications = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Get all applications
  async function fetchApplications() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select('*')
        .order('timestamp', { ascending: false })

      if (supabaseError) throw supabaseError

      applications.value = data
    } catch (err) {
      console.error('Error fetching applications:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Get applications by user_id
  async function fetchUserApplications(userId) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      console.error('Error fetching user applications:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Get applications by job_id
  async function fetchJobApplications(jobId) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('timestamp', { ascending: false })

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      console.error('Error fetching job applications:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Submit a new application
  async function submitApplication(applicationData) {
    isLoading.value = true
    error.value = null

    try {
      // First check if this user has already applied to this job
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', applicationData.userId)
        .eq('job_id', applicationData.jobId)
        .maybeSingle()
      
      if (checkError) {
        console.error('Error checking existing application:', checkError)
        throw checkError
      }
      
      let data
      let supabaseError
      
      if (existingApplication) {
        // Update the existing application instead of creating a new one
        console.log('Updating existing application:', existingApplication.id)
        
        const { data: updateData, error: updateError } = await supabase
          .from('applications')
          .update({
            first_name: applicationData.firstName,
            last_name: applicationData.lastName,
            email: applicationData.email,
            phone: applicationData.phone,
            address: applicationData.address,
            city: applicationData.city,
            state: applicationData.state,
            education: applicationData.education,
            position: applicationData.position,
            resume: applicationData.resume || null,
            cover_letter: applicationData.coverLetter || null,
            references: applicationData.references || null,
            timestamp: Math.floor(Date.now() / 1000), // Update timestamp
          })
          .eq('user_id', applicationData.userId)
          .eq('job_id', applicationData.jobId)
          .select()
        
        data = updateData
        supabaseError = updateError
      } else {
        // Insert a new application
        const { data: insertData, error: insertError } = await supabase
          .from('applications')
          .insert([
            {
              job_id: applicationData.jobId,
              first_name: applicationData.firstName,
              last_name: applicationData.lastName,
              email: applicationData.email,
              phone: applicationData.phone,
              address: applicationData.address,
              city: applicationData.city,
              state: applicationData.state,
              education: applicationData.education,
              position: applicationData.position,
              resume: applicationData.resume || null,
              cover_letter: applicationData.coverLetter || null,
              references: applicationData.references || null,
              user_id: applicationData.userId,
              timestamp: Math.floor(Date.now() / 1000), // Convert to Unix timestamp (seconds)
            },
          ])
          .select()
        
        data = insertData
        supabaseError = insertError
      }

      if (supabaseError) throw supabaseError

      // Add the new application to the local state
      if (data && data.length > 0) {
        applications.value.unshift(data[0])
      }

      return data[0]
    } catch (err) {
      console.error('Error submitting application:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get application by ID
  const getApplicationById = computed(() => {
    return (id) => applications.value.find((app) => app.job_id === id)
  })

  // Group applications by job ID
  const applicationsByJob = computed(() => {
    const grouped = {}
    applications.value.forEach((app) => {
      if (!grouped[app.job_id]) {
        grouped[app.job_id] = []
      }
      grouped[app.job_id].push(app)
    })
    return grouped
  })

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    fetchUserApplications,
    fetchJobApplications,
    submitApplication,
    getApplicationById,
    applicationsByJob,
  }
})
