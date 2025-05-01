<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileHeader from '@/components/layout/commons/ProfileHeader.vue'
import ApplicationView from '@/views/pages/ApplicationView.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, formActionDefault } from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'

const router = useRouter()

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})

const formAction = ref({
  ...formActionDefault,
})

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
})

// Constants
const STORAGE_KEY = 'huntjobs-job-listings'

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

// Edit mode
const isEditing = ref(false)
const editingJobId = ref(null)
const isFormVisible = ref(false) // Track form visibility
const selectedJob = ref(null)
const searchQuery = ref('')

// Sidebar collapse state
const isSidebarCollapsed = ref(false)

// Function to toggle sidebar collapse
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
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

// Watch jobs and update localStorage
watch(
  jobs,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
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

// Show job details
function showJobDetails(job) {
  selectedJob.value = job
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

// Apply for job
const dialog = ref(false) // Controls the visibility of the modal
const selectedJobId = ref(null) // Tracks the job ID for the application

function applyForJob(job) {
  selectedJobId.value = job.id // Set the selected job ID
  dialog.value = true // Open the modal
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid class="page-background">
        <v-row class="fill-screen" dense>
          <!-- Left Column: Navigation -->
          <v-col cols="3" class="left-column my-5">
            <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
              <!-- Profile Header -->
              <ProfileHeader :isSidebarCollapsed="isSidebarCollapsed" />

              <!-- Navigation Menu -->
              <nav class="navigation-menu">
                <h1 class="mx-3 my-3 title-qw">Quickwork</h1>
                <ul>
                  <li>
                    <a href="#" @click="">
                      <i class="icon mdi mdi-bell-outline"></i>
                      <span v-if="!isSidebarCollapsed">Notification</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href="#"
                      @click="
                        () => {
                          isFormVisible = false
                        }
                      "
                    >
                      <i class="icon mdi mdi-briefcase-outline"></i>
                      <span v-if="!isSidebarCollapsed">Job Posted</span>
                    </a>
                  </li>
                  <li>
                    <a href="/">
                      <i class="icon mdi mdi-star-outline"></i>
                      <span v-if="!isSidebarCollapsed">Review</span>
                    </a>
                  </li>

                  <li>
                    <v-btn
                      variant="plain"
                      rounded
                      @click="onLogout"
                      :loading="formAction.formProcess"
                      :disabled="formAction.formProcess"
                      class="d-flex align-center"
                    >
                      <i class="icon mdi mdi-logout" style="margin-right: 10px"></i>
                      <span v-if="!isSidebarCollapsed" class="text-red">Logout</span>
                    </v-btn>
                  </li>
                </ul>
              </nav>
            </aside>
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
                      </v-col>
                      <v-col cols="auto" class="d-flex align-center">
                        <v-btn
                          color="green"
                          class="rounded-pill px-4 py-2 text-white text-capitalize"
                          elevation="2"
                          @click.stop="applyForJob(job)"
                        >
                          Apply Now
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>

          <!-- Right Column: Job Details -->
          <v-col cols="3">
            <v-card v-if="selectedJob" class="pa-6" elevation="5" style="background-color: #f2e7c4">
              <!-- X Button sa Top-Right -->
              <div class="d-flex justify-end">
                <v-btn icon class="close-btn" @click="selectedJob = null">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <v-img :src="selectedJob.imageUrl" height="200px" cover class="mb-4 rounded-lg" />
              <div class="pa-4 elevation-2" style="background-color: #ffff">
                <h4 class="mb-2 font-weight-medium text-black">
                  Job name: {{ selectedJob.title }}
                </h4>

                <p class="text-body-2 mb-2 text-grey-darken-1">
                  <strong>Job description:</strong> {{ selectedJob.description }}
                </p>

                <p class="text-caption text-grey mb-2">
                  <strong>Job Type:</strong> {{ selectedJob.type }}
                </p>

                <p class="text-caption text-grey-darken-1 mb-2">
                  <strong>Monthly rate:</strong> {{ selectedJob.rate }}
                </p>

                <p class="text-caption text-grey-darken-1">
                  <strong>Job link:</strong> {{ selectedJob.link }}
                </p>
              </div>
            </v-card>

            <!-- Message when no job is selected -->
            <v-card v-else class="pa-10 text-center" elevation="3" color="#F2E7C4">
              <v-container>
                <v-row align="center" justify="center">
                  <v-col cols="12">
                    <v-icon size="56" color="black">mdi-briefcase-search</v-icon>
                  </v-col>
                  <v-col cols="12">
                    <h4 class="text-grey-darken-1 font-weight-medium mb-2">No Job Selected</h4>
                    <p class="text-black text-body-2">
                      Click <span style="color: #328e6e; font-weight: bold">"Image"</span> to see
                      the full details here.
                    </p>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Application Dialog -->
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">Application Form</v-card-title>
          <v-card-text>
            <!-- Pass the selected job ID to the ApplicationView -->
            <ApplicationView v-if="selectedJobId" :jobId="selectedJobId" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
  color: #328e6e; /* Aesthetic green color */
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
  background-color: #f2e7c4;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.profile-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-picture {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 40px;
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
  background-color: #ffff;
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
  background-color: #328e6e;
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
.close-btn {
  position: relative;
  top: -10px;
  right: -10px;
  color: #444;
}
.close-btn:hover {
  color: white;
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
