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
  loadApplicationsFromStorage() // Add this line
})

// Constants
const STORAGE_KEY = 'huntjobs-job-listings'
const RATINGS_STORAGE_KEY = 'huntjobs-job-ratings'
const APPLICATIONS_STORAGE_KEY = 'huntjobs-job-applications'

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
const applicationData = ref({})

// Handle application submission
function handleApplicationSubmitted(newApplication) {
  // Ensure jobId exists in application data
  if (!applicationData.value[newApplication.jobId]) {
    applicationData.value[newApplication.jobId] = []
  }

  // Add timestamp if not present
  if (!newApplication.timestamp) {
    newApplication.timestamp = new Date().toISOString()
  }

  // Add a unique ID for the application if not present
  if (!newApplication.id) {
    newApplication.id = Date.now()
  }

  // Add the application to the job's applications
  applicationData.value[newApplication.jobId].push(newApplication)

  // Close the application dialog
  dialog.value = false

  // If we're viewing the job that just received an application, update display
  if (selectedJob.value && selectedJob.value.id === newApplication.jobId) {
    displayMode.value = 'appliedForms'
  }

  console.log('Application submitted:', newApplication)
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
  selectedJobId.value = job.id // Set the selected job ID
  formDialogVisible.value = true // Open the FormDialog
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

// Load jobs from localStorage
function loadJobsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    jobs.value = Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load jobs from localStorage:', err)
    jobs.value = []
  }
}

// Load ratings from localStorage
function loadRatingsFromStorage() {
  try {
    const stored = localStorage.getItem(RATINGS_STORAGE_KEY)
    jobRatings.value = stored ? JSON.parse(stored) : {}
  } catch (err) {
    console.error('Failed to load ratings from localStorage:', err)
    jobRatings.value = {}
  }
}

// Save ratings to localStorage
function saveRatingsToStorage() {
  localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(jobRatings.value))
}

// Load applications from localStorage
function loadApplicationsFromStorage() {
  try {
    const stored = localStorage.getItem(APPLICATIONS_STORAGE_KEY)
    applicationData.value = stored ? JSON.parse(stored) : {}
  } catch (err) {
    console.error('Failed to load applications from localStorage:', err)
    applicationData.value = {}
  }
}

// Save applications to localStorage
function saveApplicationsToStorage() {
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applicationData.value))
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

// Upload image
function handleImageUpload(event) {
  const file = event.target?.files?.[0] || event
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      jobForm.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Post or update job
function postJob() {
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

  if (isEditing.value && editingJobId.value !== null) {
    // Update existing job
    const index = jobs.value.findIndex((job) => job.id === editingJobId.value)
    if (index !== -1) {
      jobs.value[index] = {
        ...jobs.value[index],
        ...jobForm.value,
      }
    }
    isEditing.value = false // Exit editing mode
    editingJobId.value = null // Clear the editing job ID
  } else {
    // Add new job
    const newJob = {
      id: Date.now(),
      ...jobForm.value,
    }
    jobs.value.unshift(newJob)
  }

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
function submitReview(jobId, review) {
  if (!jobRatings.value[jobId]) {
    jobRatings.value[jobId] = []
  }

  jobRatings.value[jobId].push({
    id: Date.now(),
    rating: review.rating,
    comment: review.comment,
    username: userData.value.fullname || 'Anonymous',
    date: new Date().toISOString(),
  })

  // Close the rating dialog
  ratingDialog.value = false

  // Update the selected job to show the reviews
  if (selectedJob.value && selectedJob.value.id === jobId) {
    // Force the UI to update by explicitly changing display mode to reviews
    displayMode.value = 'reviews'
  }

  // Save the updated ratings
  saveRatingsToStorage()
}

// Method to receive rating data from the ReviewView component
function handleReviewSubmitted(reviewData) {
  // Make sure we have a selected job ID
  if (selectedJobId.value) {
    submitReview(selectedJobId.value, reviewData)
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
            <v-card class="pa-6 rounded-xl" elevation="3">
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
          <v-col cols="6" class="scrollable-column">
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
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>

          <!-- Right Column: Job Details / Reviews / Applications -->
          <v-col cols="3" class="right-column">
            <!-- Toggle buttons for details/reviews -->
            <div v-if="selectedJob" class="d-flex justify-space-between mb-4">
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

              <!-- Reviews View -->
              <div v-if="displayMode === 'reviews'" class="reviews-container">
                <h4 class="text-h5 font-weight-medium mb-4">Reviews for {{ selectedJob.title }}</h4>

                <div v-if="jobRatings[selectedJob.id] && jobRatings[selectedJob.id].length > 0">
                  <v-list lines="one">
                    <v-list-item
                      v-for="review in jobRatings[selectedJob.id]"
                      :key="review.id"
                      class="pa-0 mb-3"
                    >
                      <v-card class="pa-4" elevation="2">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <span class="font-weight-medium">{{ review.username }}</span>
                          <span class="text-caption text-grey-darken-1">{{
                            new Date(review.date).toLocaleDateString()
                          }}</span>
                        </div>
                        <v-rating
                          :model-value="review.rating"
                          readonly
                          color="amber"
                          size="small"
                          class="mb-2"
                        ></v-rating>
                        <p class="text-body-2 text-grey-darken-2">{{ review.comment }}</p>
                      </v-card>
                    </v-list-item>
                  </v-list>
                </div>
                <div v-else>
                  <p class="text-body-2 text-grey">No reviews yet.</p>
                </div>
              </div>

              <!-- Job Applications Details -->
              <div v-if="displayMode === 'appliedForms'" class="applications-container">
                <h2 class="form-title">Job Applications</h2>

                <div
                  v-if="
                    applicationData[selectedJob.id] && applicationData[selectedJob.id].length > 0
                  "
                  class="applications-list"
                >
                  <div
                    v-for="application in applicationData[selectedJob.id]"
                    :key="application.id"
                    class="application-card"
                  >
                    <div class="application-header">
                      <div class="applicant-name">
                        {{ application.firstName }} {{ application.lastName }}
                      </div>
                      <div class="application-date">{{ formatDate(application.timestamp) }}</div>
                    </div>

                    <div class="application-details">
                      <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">{{ application.email }}</span>
                      </div>

                      <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">{{ application.phone || 'Not provided' }}</span>
                      </div>

                      <div v-if="application.address" class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">
                          {{ application.address }}
                          {{ application.city ? `, ${application.city}` : '' }}
                          {{ application.state ? `, ${application.state}` : '' }}
                          {{ application.zipCode ? ` ${application.zipCode}` : '' }}
                        </span>
                      </div>

                      <div v-if="application.position" class="detail-row">
                        <span class="detail-label">Position:</span>
                        <span class="detail-value">{{ application.position }}</span>
                      </div>

                      <div v-if="application.education" class="detail-row">
                        <span class="detail-label">Education:</span>
                        <span class="detail-value">{{ application.education }}</span>
                      </div>
                    </div>

                    <div class="application-actions">
                      <button class="contact-button">Contact Applicant</button>
                    </div>
                  </div>
                </div>

                <div v-else class="no-applications">
                  <p>No applications have been submitted for this job yet.</p>
                </div>
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
              :applications="applicationData"
              @application-submitted="handleApplicationSubmitted"
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
</style>
