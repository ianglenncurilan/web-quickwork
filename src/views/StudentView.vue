<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref, onMounted, watch, computed } from 'vue'

// Constants
const STORAGE_KEY = 'huntjobs-job-listings'

// Job list
const jobs = ref([])

// Edit mode
const isEditing = ref(false)
const editingJobId = ref(null)
const isFormVisible = ref(false) // Track form visibility
const selectedJob = ref(null)
const searchQuery = ref('')

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

onMounted(() => {
  loadJobsFromStorage()
})

// Watch jobs and update localStorage
watch(
  jobs,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  },
  { deep: true },
)

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
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid class="page-background">
        <v-row class="fill-screen" dense>
          <!-- Left Column: Navigation -->
          <v-col cols="3" class="left-column my-5">
            <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
              <div class="profile-section">
                <v-avatar :size="isSidebarCollapsed ? 50 : 80" class="mb-2">
                  <v-img src="/images/profile.jpg" alt="Profile Picture" />
                </v-avatar>

                <!-- Hide name and role when collapsed -->
                <transition name="fade">
                  <div v-if="!isSidebarCollapsed">
                    <p class="profile-name">Jasmin</p>
                    <p class="profile-role">Business Owner</p>
                  </div>
                </transition>
              </div>
              <!-- Arrow Button -->

              <!-- Navigation Menu -->
              <nav class="navigation-menu">
                <h1 class="mx-3 my-3 title-qw">Quickwork</h1>
                <ul>
                  <li>
                    <a href="#" @click="openJobPostForm">
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
                    <a href="/">
                      <i class="icon mdi mdi-logout" style="color: red"></i>
                      <span v-if="!isSidebarCollapsed" class="text-red">Logout</span>
                    </a>
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

            <!-- Job Listings -->
            <v-container fluid>
              <v-row dense>
                <v-col v-for="job in filteredJobs" :key="job.id" cols="12" class="d-flex">
                  <v-card class="pa-5 w-100 zoom-hover" style="background-color: #D9D59A;" col="12" md="7" elevation="3">
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
                        <p class="text-caption text-white">{{ job.description }}</p>
                      </v-col>

                      <v-col cols="auto" class="d-flex align-center">
                        <v-btn color="teal-darken-2" class="me-2" @click.stop="applyToJob(job)">
                          Apply
                        </v-btn>
                        <v-btn color="teal-darken-2" @click.stop="showJobDetails(job)">
                          Review
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>

          <!-- Right Column: Job Details -->
          <v-col cols="3" >
            <v-card v-if="selectedJob" class="pa-6"  elevation="5" style="background-color: #D9D59A;">
              <!-- X Button sa Top-Right -->
              <div class="d-flex justify-end">
                <v-btn icon class="close-btn" @click="selectedJob = null">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <v-img :src="selectedJob.imageUrl" height="200px" cover class="mb-4 rounded-lg" />
              <div class="pa-4 elevation-2" style="background-color: #ffff;">
  <h4 class="mb-2 font-weight-medium text-black">Job name: {{ selectedJob.title }}</h4>

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
            <v-card v-else class="pa-10 text-center" elevation="3" color="#D9D59A">
              <v-container>
                <v-row align="center" justify="center">
                  <v-col cols="12">
                    <v-icon size="56" color="black">mdi-briefcase-search</v-icon>
                  </v-col>
                  <v-col cols="12">
                    <h4 class="text-grey-darken-1 font-weight-medium mb-2">No Job Selected</h4>
                    <p class="text-white text-body-2">
                      <p>
  Click <span style="color: teal; font-weight: bold;">"Review"</span> to see the full details here.
</p>

                    </p>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
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
  background-color: #d9d59a;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(206, 31, 31, 0.1);
  position: fixed;
  height: 100vh;
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
.close-btn {
  position: relative;
  top: -10px;
  right: -10px;
  color: #444;
}
.close-btn:hover {
  color: white;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
/* mao ni na dungag */
</style>
