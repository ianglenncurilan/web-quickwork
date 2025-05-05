<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileHeader from '@/components/layout/commons/ProfileHeader.vue'
import ReviewView from '@/views/pages/ReviewView.vue'
import ApplyView from '@/views/pages/ApplyView.vue' // Added missing import
import NotificationComponent from '@/components/layout/commons/NotificationComponent.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, formActionDefault } from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'
import FormDialog from '@/views/pages/FormDialog.vue'

const emit = defineEmits(['application-submitted'])

const router = useRouter()

const notificationDialog = ref(false) // Controls the visibility of the notification dialog

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})

const formAction = ref({
  ...formActionDefault,
})

const notifications = ref([])

const onLogout = async () => {
  formAction.value = {
    ...formActionDefault,
  }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    return
  }
  formAction.value.formProcess = false
  router.replace('/')
}

const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching user:', error)
      return
    }

    if (data && data.user && data.user.user_metadata) {
      const metadata = data.user.user_metadata

      userData.value.email = metadata.email
      userData.value.fullname = metadata.firstname + ' ' + metadata.lastname
      userData.value.initials = getAvatarText(userData.value.fullname)
    }
  } catch (error) {
    console.error('Error in getUser function:', error)
  }
}

onMounted(() => {
  getUser()
  loadJobsFromStorage()
  loadRatingsFromStorage() // Load reviews/ratings when component mounts
  loadApplicationsFromStorage() // Load applications when component mounts
})

// Constants
const STORAGE_KEY = 'huntjobs-job-listings'
const RATINGS_STORAGE_KEY = 'huntjobs-job-ratings'
const STORAGE_KEY_APPLICATIONS = 'huntjobs-applications'

// Form state
const jobForm = ref({
  title: '',
  company: '',
  imageUrl: '',
  description: '',
  type: '',
  rate: '',
  link: '',
})

// Job list
const jobs = ref([])

// Ratings list
const jobRatings = ref({})

// Applications list
const applicationData = ref({}) // Stores applications for each job

// Handle application submission
async function handleApplicationSubmitted(application) {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    if (!userId) {
      alert('You must be logged in to submit an application')
      formAction.value.formProcess = false
      return
    }
    
    // Make sure jobId is a number
    const numericJobId = typeof application.jobId === 'string' ? parseInt(application.jobId, 10) : application.jobId
    console.log('Submitting application for job ID:', numericJobId)
    
    // Add a timestamp to the application data
    const applicationWithTimestamp = {
      ...application,
      timestamp: new Date().toISOString(),
      id: Date.now(), // Ensure each application has a unique ID
    }
    
    // Save application to Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          user_id: userId,
          job_id: numericJobId,
          name: application.name,
          email: application.email,
          phone: application.phone,
          resume: application.resume,
          coverletter: application.coverletter
        }
      ])
      .select()
    
    if (error) {
      console.error('Error saving application to Supabase:', error)
      alert(`Error saving application: ${error.message}`)
      return
    }
    
    console.log('Application saved to Supabase:', data)
    
    // Also update local state for immediate UI feedback
    // Ensure the jobId property exists in applicationData
    if (!applicationData.value[numericJobId]) {
      applicationData.value[numericJobId] = []
    }
    
    // Add the application to the job's applications
    applicationData.value[numericJobId].push({
      id: data[0]?.id || Date.now(),
      name: application.name,
      email: application.email,
      phone: application.phone,
      resume: application.resume,
      coverletter: application.coverletter,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
    
    // Emit the application-submitted event
    emit('application-submitted', applicationWithTimestamp)
    
    // Update the display mode to show "Applied Forms"
    selectedJob.value = jobs.value.find((job) => job.id === numericJobId)
    displayMode.value = 'appliedForms'
    
    // Close the dialog after submission
    dialog.value = false
  } catch (err) {
    console.error('Error in handleApplicationSubmitted:', err)
    alert('An error occurred while submitting your application. Please try again.')
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}



// Edit mode
const isEditing = ref(false)
const editingJobId = ref(null)
const isFormVisible = ref(false) // Track form visibility
const selectedJob = ref(null)
const searchQuery = ref('')

// Display mode for right panel
const displayMode = ref('details') // 'details', 'reviews', or 'appliedForms'

// Sidebar collapse state
const isSidebarCollapsed = ref(false)

// Dialog controls
const dialog = ref(false) // Controls the visibility of the application modal
const ratingDialog = ref(false) // Controls the visibility of the rating modal

// Dialog visibility for FormDialog
const formDialogVisible = ref(false) // Controls the visibility of the FormDialog
const selectedJobId = ref(null) // Tracks the job ID for the selected job

// Handle the "Applied Forms" button click
function showJobApplications(job) {
  selectedJob.value = job // Set the selected job
  selectedJobId.value = job.id // Set the selected job ID
  displayMode.value = 'appliedForms' // Switch to the "Applied Forms" view
}

// Handle the form-viewed event
function handleFormViewed(jobId) {
  console.log(`Form viewed for job ID: ${jobId}`)
  formDialogVisible.value = false // Close the dialog after viewing
}

// Function to open the job post form
function openJobPostForm() {
  isFormVisible.value = true // Show the job form
}

// Function to close the job post form
function closeJobPostForm() {
  isFormVisible.value = false // Hide the job form
}

// Load jobs from Supabase
async function loadJobsFromStorage() {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Fetch jobs from Supabase
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .order('posted_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching jobs from Supabase:', error)
      throw error
    }
    
    // Transform Supabase data to match the format used in the UI
    jobs.value = data.map(job => ({
      id: job.id,
      title: job.job_name || '',
      description: job.job_description || '',
      type: job.job_type || '',
      rate: job.monthly_rate !== null ? job.monthly_rate.toString() : '',
      link: job.job_link || '',
      imageUrl: job.imageurl || 'https://via.placeholder.com/300x200',
      company: job.company || 'Company Name', // Default if not available
      userId: job.user_id
    }))
    
    console.log('Loaded jobs from Supabase:', jobs.value)
  } catch (err) {
    console.error('Failed to load jobs from Supabase:', err)
    jobs.value = []
    
    // Fallback to localStorage if Supabase fails
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      jobs.value = Array.isArray(parsed) ? parsed : []
    } catch (localErr) {
      console.error('Failed to load jobs from localStorage fallback:', localErr)
    }
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}

// Load ratings from Supabase
async function loadRatingsFromStorage() {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Fetch ratings from Supabase
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('rated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching ratings from Supabase:', error)
      throw error
    }
    
    console.log('Ratings loaded from Supabase:', data)
    
    // Transform Supabase data to match the format used in the UI
    // Group ratings by job_id
    jobRatings.value = {}
    
    if (data && data.length > 0) {
      // Group ratings by job_id
      data.forEach(rating => {
        const jobId = rating.job_id
        
        if (!jobRatings.value[jobId]) {
          jobRatings.value[jobId] = []
        }
        
        jobRatings.value[jobId].push({
          id: rating.id,
          rating: rating.rating || 0,
          comment: rating.comment || '',
          username: 'User', // Will be updated with actual username if available
          date: new Date(rating.rated_at * 1000).toISOString(),
          userId: rating.user_id
        })
      })
    }
    
    console.log('Processed ratings:', jobRatings.value)
  } catch (err) {
    console.error('Failed to load ratings from Supabase:', err)
    
    // Fallback to localStorage if Supabase fails
    try {
      const stored = localStorage.getItem(RATINGS_STORAGE_KEY)
      jobRatings.value = stored ? JSON.parse(stored) : {}
    } catch (localErr) {
      console.error('Failed to load ratings from localStorage fallback:', localErr)
      jobRatings.value = {}
    }
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}

// Save ratings to localStorage
function saveRatingsToStorage() {
  localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(jobRatings.value))
}

// Load applications from Supabase
async function loadApplicationsFromStorage() {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    if (!userId) {
      console.log('User not logged in, cannot load applications')
      applicationData.value = {}
      return
    }
    
    // Fetch applications from Supabase
    const { data, error } = await supabase
      .from('applications')
      .select('*')
    
    if (error) {
      console.error('Error fetching applications from Supabase:', error)
      throw error
    }
    
    console.log('Applications loaded from Supabase:', data)
    
    // Transform Supabase data to match the format used in the UI
    applicationData.value = {}
    
    if (data && data.length > 0) {
      // Group applications by job_id
      data.forEach(app => {
        // Use job_id as key if available, otherwise use a default key
        const key = app.job_id || 'default'
        
        if (!applicationData.value[key]) {
          applicationData.value[key] = []
        }
        
        applicationData.value[key].push({
          id: app.id,
          name: app.name || '',
          email: app.email || '',
          phone: app.phone || '',
          resume: app.resume || '',
          coverletter: app.coverletter || '',
          user_id: app.user_id
        })
      })
    }
    
    console.log('Processed applications:', applicationData.value)
  } catch (err) {
    console.error('Failed to load applications from Supabase:', err)
    
    // Fallback to localStorage if Supabase fails
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS)
      applicationData.value = stored ? JSON.parse(stored) : {}
    } catch (localErr) {
      console.error('Failed to load applications from localStorage fallback:', localErr)
      applicationData.value = {}
    }
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}

// Save applications to localStorage
function saveApplicationsToStorage() {
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applicationData.value))
}

// Watch jobs and update localStorage
watch(
  jobs,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  },
  { deep: true },
)

// Watch ratings and update localStorage
watch(
  jobRatings,
  () => {
    saveRatingsToStorage()
  },
  { deep: true },
)

// Watch applications and update localStorage
watch(
  applicationData,
  () => {
    saveApplicationsToStorage()
  },
  { deep: true },
)

// Upload image to Supabase Storage
async function handleImageUpload(event) {
  const file = event.target?.files?.[0] || event
  if (!file) return
  
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Create a unique filename with timestamp and original extension
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `job_images/${fileName}`
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('job-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Error uploading image:', error)
      alert(`Error uploading image: ${error.message}`)
      return
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('job-images')
      .getPublicUrl(filePath)
    
    // Set the image URL in the form
    jobForm.value.imageUrl = publicUrlData.publicUrl
    console.log('Image uploaded successfully:', publicUrlData.publicUrl)
  } catch (err) {
    console.error('Error in handleImageUpload:', err)
    alert('An error occurred while uploading the image. Please try again.')
    
    // Fallback to local preview if Supabase upload fails
    const reader = new FileReader()
    reader.onload = (e) => {
      jobForm.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}

// Post or update job
async function postJob() {
  // Validate form fields
  if (
    !jobForm.value.title.trim() ||
    !jobForm.value.description.trim() ||
    !jobForm.value.type.trim() ||
    !jobForm.value.rate.trim() ||
    !jobForm.value.link.trim() ||
    !jobForm.value.imageUrl
  ) {
    alert('Please complete all fields.')
    return
  }

  formAction.value.formProcess = true // Show loading state

  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (!userId) {
      alert('You must be logged in to post a job')
      formAction.value.formProcess = false
      return
    }

    if (isEditing.value && editingJobId.value !== null) {
      // Update existing job in Supabase
      const { data, error } = await supabase
        .from('job_posts')
        .update({
          job_name: jobForm.value.title,
          job_description: jobForm.value.description,
          job_type: jobForm.value.type,
          monthly_rate: parseInt(jobForm.value.rate),
          job_link: jobForm.value.link,
          imageurl: jobForm.value.imageUrl,
          posted_at: new Date().toISOString()
        })
        .eq('id', editingJobId.value)
        .select()

      if (error) {
        console.error('Error updating job:', error)
        alert(`Error updating job: ${error.message}`)
      } else if (data) {
        // Update local state
        const index = jobs.value.findIndex((job) => job.id === editingJobId.value)
        if (index !== -1) {
          jobs.value[index] = {
            ...jobs.value[index],
            ...jobForm.value,
          }
        }
      }
      
      isEditing.value = false // Exit editing mode
      editingJobId.value = null // Clear the editing job ID
    } else {
      // Add new job to Supabase
      const { data, error } = await supabase
        .from('job_posts')
        .insert([
          {
            job_name: jobForm.value.title,
            job_description: jobForm.value.description,
            job_type: jobForm.value.type,
            monthly_rate: parseInt(jobForm.value.rate),
            job_link: jobForm.value.link,
            imageurl: jobForm.value.imageUrl,
            user_id: userId,
            posted_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error creating job:', error)
        alert(`Error creating job: ${error.message}`)
      } else if (data && data.length > 0) {
        // Add to local state with the correct ID from Supabase
        const newJob = {
          id: data[0].id,
          title: jobForm.value.title,
          company: jobForm.value.company,
          imageUrl: jobForm.value.imageUrl,
          description: jobForm.value.description,
          type: jobForm.value.type,
          rate: jobForm.value.rate,
          link: jobForm.value.link,
        }
        jobs.value.unshift(newJob)
        console.log('Job created successfully:', data[0])
      }
    }
  } catch (err) {
    console.error('Error in postJob function:', err)
    alert('An unexpected error occurred. Please try again.')
  } finally {
    formAction.value.formProcess = false // Hide loading state
    
    // Reset form
    jobForm.value = {
      title: '',
      company: '',
      imageUrl: '',
      description: '',
      type: '',
      rate: '',
      link: '',
    }

    closeJobPostForm() // Close the job form
  }
}

// Delete job
function deleteJob(id) {
  if (confirm('Are you sure you want to delete this job?')) {
    jobs.value = jobs.value.filter((job) => job.id !== id)
  }
}

// Edit job
function editJob(job) {
  jobForm.value = { ...job } // Populate the form with the selected job's data
  editingJobId.value = job.id // Set the ID of the job being edited
  isEditing.value = true // Enable editing mode
  isFormVisible.value = true // Show the job form
}

// Show job details
function showJobDetails(job) {
  selectedJob.value = job
  displayMode.value = 'details' // Show details by default when clicking a job
}

// Show job reviews
function showJobReviews(job) {
  selectedJob.value = job
  displayMode.value = 'reviews' // Show reviews when this function is called
}

// Added missing function that was referenced in the template
function handleJobTitleClick(jobId) {
  const job = jobs.value.find((j) => j.id === jobId)
  if (job) {
    showJobDetails(job)
  }
}

// Toggle between details and reviews
function toggleDisplayMode(mode) {
  if (['details', 'reviews', 'appliedForms'].includes(mode)) {
    displayMode.value = mode // Set the display mode explicitly
  } else {
    // Toggle between 'details' and 'reviews' if no mode is provided
    displayMode.value = displayMode.value === 'details' ? 'reviews' : 'details'
  }
}

// Get average rating for a job
const getAverageRating = (jobId) => {
  const ratings = jobRatings.value[jobId] || []
  if (ratings.length === 0) return 0

  const sum = ratings.reduce((total, rating) => total + rating.rating, 0)
  return (sum / ratings.length).toFixed(1)
}

// Get reviews count for a job
const getReviewsCount = (jobId) => {
  return (jobRatings.value[jobId] || []).length
}

// Submit a new review/rating
async function submitReview(jobId, review) {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    if (!userId) {
      alert('You must be logged in to submit a rating')
      formAction.value.formProcess = false
      return
    }
    
    console.log('Submitting rating for job ID:', jobId)
    console.log('Rating data:', review)
    
    // Make sure jobId is a number
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId
    
    // Save rating to Supabase
    const { data, error } = await supabase
      .from('ratings')
      .insert([
        {
          user_id: userId,
          job_id: numericJobId,
          rating: review.rating,
          comment: review.comment,
          rated_at: Math.floor(Date.now() / 1000) // Unix timestamp in seconds
        }
      ])
      .select()
    
    if (error) {
      console.error('Error saving rating to Supabase:', error)
      alert(`Error saving rating: ${error.message}`)
      return
    }
    
    console.log('Rating saved to Supabase:', data)
    
    // Also update local state for immediate UI feedback
    if (!jobRatings.value[jobId]) {
      jobRatings.value[jobId] = []
    }
    
    jobRatings.value[jobId].push({
      id: data[0].id || Date.now(),
      rating: review.rating,
      comment: review.comment,
      username: userData.value.fullname || 'Anonymous',
      date: new Date().toISOString(),
    })
    
    // Save to localStorage as backup
    saveRatingsToStorage()
    
    // Close the rating dialog
    ratingDialog.value = false
    
    // Switch to reviews mode to show the newly added review
    displayMode.value = 'reviews'
  } catch (err) {
    console.error('Error in submitReview:', err)
    alert('An error occurred while submitting your review. Please try again.')
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
  saveRatingsToStorage()
}

// Method to receive rating data from the ReviewView component
async function handleReviewSubmitted(reviewData) {
  try {
    formAction.value.formProcess = true // Show loading state
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    if (!userId) {
      alert('You must be logged in to submit a rating')
      formAction.value.formProcess = false
      return
    }
    
    // Make sure we have a selected job ID
    if (selectedJobId.value) {
      // Make sure jobId is a number
      const numericJobId = typeof selectedJobId.value === 'string' ? 
        parseInt(selectedJobId.value, 10) : selectedJobId.value
      
      console.log('Submitting rating for job ID:', numericJobId)
      console.log('Rating data:', reviewData)
      
      // Save rating to Supabase
      const { data, error } = await supabase
        .from('ratings')
        .insert([
          {
            user_id: userId,
            job_id: numericJobId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            rated_at: Math.floor(Date.now() / 1000) // Unix timestamp in seconds
          }
        ])
        .select()
      
      if (error) {
        console.error('Error saving rating to Supabase:', error)
        alert(`Error saving rating: ${error.message}`)
        return
      }
      
      console.log('Rating saved to Supabase:', data)
      
      // Also update local state for immediate UI feedback
      submitReview(numericJobId, reviewData)
    }
  } catch (err) {
    console.error('Error in handleReviewSubmitted:', err)
    alert('An error occurred while submitting your review. Please try again.')
  } finally {
    formAction.value.formProcess = false // Hide loading state
  }
}

// Filtered jobs based on search
const filteredJobs = computed(() => {
  const searchText = searchQuery.value.toLowerCase()
  return jobs.value.filter((job) =>
    [job.title, job.company, job.description].some((field) =>
      field.toLowerCase().includes(searchText),
    ),
  )
})

// Format date helper function
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid class="page-background">
        <v-row class="fill-screen" dense>
          <!-- Left Column: Navigation -->

          <v-col cols="3" class="left-column my-5">
            <v-card class="pa-6 rounded-xl" elevation="3" style="height: 575px">
              <!-- Profile Header -->
              <ProfileHeader />

              <!-- Navigation Menu -->

              <nav class="navigation-menu">
                <ul>
                  <li>
                    <v-btn
                      rounded
                      @click="openJobPostForm"
                      class="d-flex align-center"
                      variant="text"
                    >
                      <i class="icon mdi mdi-plus-circle-outline" style="margin-right: 10px"></i>
                      <span v-if="!isSidebarCollapsed">Add Job</span>
                    </v-btn>
                  </li>

                  <li>
                    <v-btn
                      rounded
                      @click="
                        () => {
                          isFormVisible = false
                        }
                      "
                      class="d-flex align-center"
                      variant="text"
                    >
                      <i class="icon mdi mdi-briefcase-outline" style="margin-right: 10px"></i>
                      <span v-if="!isSidebarCollapsed">Job Posted</span>
                    </v-btn>
                  </li>

                  <li>
                    <v-btn
                      rounded
                      @click="onLogout"
                      :loading="formAction.formProcess"
                      :disabled="formAction.formProcess"
                      class="d-flex align-center"
                      variant="text"
                    >
                      <i class="icon mdi mdi-logout" style="margin-right: 10px"></i>
                      <span v-if="!isSidebarCollapsed" class="text-red">Logout</span>
                    </v-btn>
                  </li>
                </ul>
              </nav>
            </v-card>
          </v-col>

          <!-- Middle Column: Search + Jobs + Form -->
          <v-col cols="5" class="scrollable-column">
            <div class="search-container">
              <div class="search-box">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search for jobs..."
                  class="search-input"
                />
                <button class="search-button">
                  <v-icon>mdi-magnify</v-icon>
                </button>
              </div>
            </div>

            <!-- Job Form (Middle) -->
            <v-card v-if="isFormVisible" class="pa-4 mb-6 rounded-xl" elevation="1" flat>
              <div class="ribbon-container">
                <h4 class="ribbon-text">Add a Job</h4>
              </div>
              <v-btn class="close-btn margin-left" elevation="2" @click="closeJobPostForm">
                <v-icon color="white">mdi-close</v-icon>
              </v-btn>
              <v-divider class="my-4"></v-divider>

              <v-text-field
                v-model="jobForm.title"
                clearable
                label="Job Name"
                variant="solo-filled"
                class="mb-4"
                required
              />
              <v-textarea
                v-model="jobForm.description"
                clearable
                label="Job Description"
                variant="solo-filled"
                auto-grow
                rows="3"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="jobForm.type"
                clearable
                label="Job Type"
                variant="solo-filled"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="jobForm.rate"
                clearable
                label="Monthly rate"
                variant="solo-filled"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="jobForm.link"
                clearable
                label="Job link"
                variant="solo-filled"
                class="mb-6"
                required
              />
              <v-file-input
                label="Upload Job Image"
                variant="solo-filled"
                class="mb-4"
                @change="handleImageUpload"
                accept="image/*"
                prepend-icon="mdi-camera"
              />

              <v-btn
                color="teal-darken-2"
                class="rounded-pill px-6 py-3 text-white text-capitalize"
                elevation="2"
                block
                @click="postJob"
              >
                Submit Job
              </v-btn>
            </v-card>

            <!-- Job Listings -->
            <v-container fluid>
              <v-row dense>
                <v-col
                  v-for="job in filteredJobs"
                  :key="job.id"
                  cols="12"
                  class="d-flex"
                  @click="showJobDetails(job)"
                >
                  <v-card class="pa-5 rounded-xl w-100 zoom-hover" col="12" md="7" elevation="3">
                    <v-row no-gutters align="center">
                      <v-col cols="auto">
                        <v-img
                          :src="job.imageUrl"
                          class="rounded-lg"
                          width="80"
                          height="80"
                          cover
                        />
                      </v-col>
                      <v-col class="pl-4">
                        <h4
                          class="mb-1 font-weight-medium"
                          @click.stop="handleJobTitleClick(job.id)"
                        >
                          {{ job.title }}
                        </h4>
                        <p class="text-body-2 mb-1 text-grey-darken-1">{{ job.company }}</p>
                        <p class="text-caption text-grey">{{ job.description }}</p>
                        <!-- Display rating information -->
                        <div class="d-flex align-center mt-1">
                          <v-rating
                            :model-value="Number(getAverageRating(job.id))"
                            color="amber"
                            density="compact"
                            size="small"
                            readonly
                            half-increments
                          ></v-rating>
                          <span class="ml-2 text-caption">
                            {{ getAverageRating(job.id) }} ({{ getReviewsCount(job.id) }} reviews)
                          </span>
                        </div>
                      </v-col>
                      <v-col cols="auto" class="d-flex align-center flex-column">
                        <!-- Admin actions -->
                        <div class="d-flex mb-2">
                          <v-btn class="mr-2" icon small @click.stop="editJob(job)">
                            <v-icon>mdi-pencil-outline</v-icon>
                          </v-btn>
                          <v-btn icon small @click.stop="deleteJob(job.id)">
                            <v-icon color="red">mdi-delete-outline</v-icon>
                          </v-btn>
                        </div>

                        <!-- Show Reviews Button -->
                        <v-btn
                          color="purple"
                          class="rounded-pill px-6 py-0 text-white text-capitalize mb-2 mt-2"
                          elevation="2"
                          @click.stop="showJobReviews(job)"
                        >
                          Reviews
                        </v-btn>
                        <!-- Applied Forms Button -->
                        <v-btn
                          color="green"
                          class="rounded-pill px-6 py-0 text-white text-capitalize mb-2 mt-2"
                          elevation="2"
                          @click.stop="showJobApplications(job)"
                        >
                          Applied Forms
                        </v-btn>
                        <!-- Apply Now Button -->

                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>

          <!-- Right Column: Job Details / Reviews / Applications -->
          <v-col cols="4" class="right-column">
            <!-- Toggle buttons for details/reviews -->
            <div v-if="selectedJob" class="top-right-col d-flex justify-space-between mb-4">
              <v-btn
                :color="displayMode === 'details' ? 'success' : 'grey'"
                class="flex-grow-1 mr-2"
                @click="toggleDisplayMode('details')"
              >
                Details
              </v-btn>
              <v-btn
                :color="displayMode === 'reviews' ? 'success' : 'grey'"
                class="flex-grow-1 ml-2"
                @click="toggleDisplayMode('reviews')"
              >
                Reviews
              </v-btn>
              <v-btn
                :color="displayMode === 'appliedForms' ? 'success' : 'grey'"
                class="flex-grow-1 ml-2"
                @click="toggleDisplayMode('appliedForms')"
              >
                Applied Forms
              </v-btn>
            </div>

            <v-card v-if="selectedJob" class="pa-6 rounded-xl" elevation="5">
              <!-- Job Details View -->
              <div v-if="displayMode === 'details'" class="pa-4">
                <v-img :src="selectedJob.imageUrl" height="220px" cover class="rounded-t-lg" />

                <v-card-text>
                  <div class="text-h6 font-weight-bold mb-2 text-center">
                    {{ selectedJob.title }}
                  </div>

                  <v-divider class="my-3" />

                  <div class="mb-3">
                    <div class="text-subtitle-2 text-grey-darken-1 font-weight-medium mb-1">
                      Description
                    </div>
                    <div class="text-body-2">{{ selectedJob.description }}</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-subtitle-2 text-grey-darken-1 font-weight-medium mb-1">
                      Job Type
                    </div>
                    <div class="text-body-2">{{ selectedJob.type }}</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-subtitle-2 text-grey-darken-1 font-weight-medium mb-1">
                      Monthly Rate
                    </div>
                    <div class="text-body-2">₱{{ selectedJob.rate }}</div>
                  </div>

                  <div>
                    <div class="text-subtitle-2 text-grey-darken-1 font-weight-medium mb-1">
                      Job Link
                    </div>
                    <v-btn
                      :href="selectedJob.link"
                      target="_blank"
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      View Link
                    </v-btn>
                  </div>
                </v-card-text>
              </div>

              <!-- Job Reviews View -->
              <div v-if="displayMode === 'reviews'" class="reviews-container pa-4">
                <div class="d-flex align-center mb-4">
                  <h5 class="text-h5" style="color: black">Reviews for {{ selectedJob.title }}</h5>
                  <v-div></v-div>
                  <v-chip
                    class="ml-3"
                    color="primary"
                    variant="outlined"
                    v-if="jobRatings[selectedJob.id]"
                  >
                    {{ jobRatings[selectedJob.id].length }}
                    {{ jobRatings[selectedJob.id].length === 1 ? 'Review' : 'Reviews' }}
                  </v-chip>
                </div>

                <div v-if="jobRatings[selectedJob.id] && jobRatings[selectedJob.id].length > 0">
                  <v-list>
                    <v-list-item
                      v-for="review in jobRatings[selectedJob.id]"
                      :key="review.id"
                      class="mb-3 pa-0"
                    >
                      <v-card variant="outlined" class="w-100">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-avatar color="grey-lighten-1" class="text-uppercase">
                              {{ review.username.charAt(0) }}
                            </v-avatar>
                          </template>
                          <v-card-title class="text-body-1 font-weight-bold">{{
                            review.username
                          }}</v-card-title>
                          <v-card-subtitle>{{
                            new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          }}</v-card-subtitle>

                          <template v-slot:append>
                            <v-rating
                              :model-value="review.rating"
                              readonly
                              color="amber-darken-2"
                              density="compact"
                              size="small"
                            >
                            </v-rating>
                          </template>
                        </v-card-item>

                        <v-card-text class="pt-2 text-body-1">
                          {{ review.comment }}
                        </v-card-text>
                      </v-card>
                    </v-list-item>
                  </v-list>
                </div>

                <v-card v-else variant="outlined" class="pa-6 text-center">
                  <v-icon
                    icon="mdi-star-outline"
                    size="large"
                    color="grey-lighten-1"
                    class="mb-2"
                  ></v-icon>
                  <p class="text-body-1 text-medium-emphasis mb-0">
                    No reviews available for this job yet.
                  </p>
                </v-card>
              </div>

              <!-- Job Applications Details -->
              <div v-if="displayMode === 'appliedForms'" class="applications-container pa-4">
                <h5 class="text-h5" style="color: black">
                  Applications for {{ selectedJob.title }}
                </h5>
                <v-chip
                  class="ml-3"
                  color="primary"
                  variant="outlined"
                  v-if="applicationData[selectedJob.id]"
                >
                  {{ applicationData[selectedJob.id] ? applicationData[selectedJob.id].length : 0 }}
                  {{
                    applicationData[selectedJob.id] && applicationData[selectedJob.id].length === 1
                      ? 'Application'
                      : 'Applications'
                  }}
                </v-chip>

                <div
                  v-if="
                    applicationData[selectedJob.id] && applicationData[selectedJob.id].length > 0
                  "
                >
                  <v-list>
                    <v-list-item
                      v-for="application in applicationData[selectedJob.id]"
                      :key="application.id || application.timestamp"
                      class="mb-3 pa-0"
                    >
                      <v-card variant="outlined" class="w-100">
                        <v-card-item>
                          <template v-slot:prepend>
                            <v-avatar color="grey-lighten-1" class="text-uppercase">
                              {{ application.firstName ? application.firstName.charAt(0) : 'A' }}
                            </v-avatar>
                          </template>
                          <v-card-title class="text-body-1 font-weight-bold">
                            {{ application.firstName }} {{ application.lastName }}
                          </v-card-title>
                          <v-card-subtitle>
                            {{ formatDate(application.timestamp || Date.now()) }}
                          </v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="pt-2">
                          <div class="d-flex flex-column">
                            <div class="mb-2">
                              <span class="font-weight-medium">Email: </span>
                              <span>{{ application.email }}</span>
                            </div>
                            <div class="mb-2" v-if="application.phone">
                              <span class="font-weight-medium">Phone: </span>
                              <span>{{ application.phone }}</span>
                            </div>
                            <div class="mb-2" v-if="application.address">
                              <span class="font-weight-medium">Address: </span>
                              <span>
                                {{ application.address }}
                                {{ application.city ? `, ${application.city}` : '' }}
                                {{ application.state ? `, ${application.state}` : '' }}
                                {{ application.zipCode ? ` ${application.zipCode}` : '' }}
                              </span>
                            </div>
                            <div class="mb-2" v-if="application.position">
                              <span class="font-weight-medium">Position: </span>
                              <span>{{ application.position }}</span>
                            </div>
                            <div class="mb-2" v-if="application.education">
                              <span class="font-weight-medium">Education: </span>
                              <span>{{ application.education }}</span>
                            </div>
                          </div>
                        </v-card-text>

                        <v-card-actions>
                          <v-btn
                            color="primary"
                            variant="text"
                            @click="contactApplicant(application)"
                          >
                            Contact Applicant
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-list-item>
                  </v-list>
                </div>

                <v-card v-else variant="outlined" class="pa-6 text-center">
                  <v-icon
                    icon="mdi-account-outline"
                    size="large"
                    color="grey-lighten-1"
                    class="mb-2"
                  ></v-icon>
                  <p class="text-body-1 text-medium-emphasis mb-0">
                    No applications available for this job yet.
                  </p>
                </v-card>
              </div>
            </v-card>

            <!-- Message when no job is selected -->
            <v-card
              v-else
              class="card-unclick pa-6 rounded-xl d-flex align-center justify-center"
              elevation="5"
            >
              <v-icon size="40" color="grey">mdi-cursor-pointer</v-icon>
              <p class="ml-2 text-grey-darken-1">Select a job to view details</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Application Dialog -->
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title class="headline text-center pt-5">Job Application</v-card-title>
          <v-card-text>
            <ApplyView
              v-if="selectedJobId"
              :jobId="selectedJobId"
              @application-submitted="handleApplicationSubmitted"
              @close-dialog="dialog = false"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Rating Dialog -->
      <v-dialog v-model="ratingDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline text-center pt-5">Rate This Job</v-card-title>
          <v-card-text>
            <!-- Pass the selected job ID to ReviewView and listen for submission event -->
            <ReviewView
              v-if="selectedJobId"
              :jobId="selectedJobId"
              @review-submitted="handleReviewSubmitted"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="ratingDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Notification Dialog -->
      <v-dialog v-model="notificationDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline text-center pt-5">Notifications</v-card-title>
          <v-card-text>
            <NotificationComponent :notifications="notifications" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="notificationDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- FormDialog Component -->
      <FormDialog
        v-model="formDialogVisible"
        :jobId="selectedJobId"
        @form-viewed="handleFormViewed"
      />
    </template>
  </AppLayout>
</template>

<style scoped>
.left-card {
  transition: transform 0.3s ease;
}

.left-card:hover {
  transform: scale(1.02);
  z-index: 1;
}

.fill-screen {
  height: 100vh;
}

.scrollable-column {
  max-height: 100vh;
  overflow-y: auto;
  padding-right: 12px;
}

.close-btn {
  width: 28px; /* Smaller width */
  height: 28px; /* Smaller height */
  border-radius: 4px; /* Keeps the button square */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #328e6e; /* Same as teal-darken-2 */
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.close-btn:hover {
  background-color: #328e6e; /* Slightly lighter teal on hover */
  transform: scale(1.1); /* Slight zoom effect on hover */
}

.close-btn:active {
  transform: scale(0.95); /* Slight shrink effect on click */
}

.margin-left {
  margin-right: 15px; /* Adjust the value as needed */
}

.custom-green-bg {
  background-color: #90c67c; /* Replace with your desired color */
  border: 1px solid #90c67c; /* Optional: Add a border for better visibility */
  border-radius: 8px; /* Keep the rounded corners */
  padding: 16px; /* Adjust padding if needed */
}

.ribbon-container {
  position: relative;
  background-color: #328e6e;
  color: white;
  padding: 0.5rem 2rem;
  text-align: center;
  font-weight: bold;
  border-radius: 5px 5px 0 0; /* Rounded top corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  margin-bottom: 1rem;
}

.title-qw {
  font-family: 'Roboto', sans-serif;
  font-size: 2rem; /* Adjust the size as needed */
  text-transform: uppercase;
  color: #00412e; /* Aesthetic green color */
  text-align: center;
  margin: 0;
  padding: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* Add a subtle shadow for depth */
}

.ribbon-text {
  margin: 0;
  font-size: 1.25rem;
}

/* Sidebar Styles */
.sidebar {
  width: 350px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px; /* Collapsed width */
  padding: 10px;
}

.toggle-btn {
  position: absolute;
  top: 350px;
  right: 10px; /* Adjusted to keep the button fully inside the sidebar */
  background-color: #00796b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.profile-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-picture {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.profile-role {
  font-size: 14px;
  color: #757575;
  margin: 0;
}

.navigation-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navigation-menu li {
  margin-bottom: 15px;
}

.navigation-menu a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000000;
  font-size: 16px;
  font-weight: 500;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.navigation-menu a:hover {
  background-color: #00796b;
}

.text-capitalize {
  text-transform: capitalize !important;
}

.icon {
  font-size: 20px;
  margin-right: 10px;
}

.text-red {
  color: red;
}

/* Search Container */
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

/* Search Box */
.search-box {
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 5px 15px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.search-box:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* Search Input */
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  padding: 10px;
}

/* Search Button */
.search-button {
  background-color: #00796b;
  border: none;
  border-radius: 50%;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.search-button:hover {
  background-color: #005a4c;
  transform: scale(1.1);
}

.search-button:active {
  transform: scale(0.95);
}

.job-card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

.job-card-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.zoom-hover {
  transition: transform 0.3s ease;
}

.zoom-hover:hover {
  transform: scale(1.02);
  z-index: 1;
}

.card-unclick {
  width: 100%; /* Make it take the full width of the column */
  height: 575px; /* Increase the height */
  padding: 20px; /* Add more padding for better spacing */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px; /* Increase font size for better readability */
  background-color: #f5f5f5; /* Optional: Add a subtle background color */
  border-radius: 10px; /* Keep the rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease; /* Add hover effects */
}

.card-unclick:hover {
  transform: scale(1.05); /* Slightly enlarge on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Add a stronger shadow on hover */
}

.right-column {
  max-height: 100vh; /* Set the maximum height to the viewport height */
  overflow-y: auto; /* Enable vertical scrolling */
  padding-right: 12px; /* Optional: Add padding for better spacing */
}

.top-right-col{
  padding-right: 12px;
}
</style>
