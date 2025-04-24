<script setup>
import AppLayout from '@/components/layout/AppLayout.vue';
import { ref, onMounted, watch, computed } from 'vue';

// Constants
const STORAGE_KEY = 'huntjobs-job-listings';

// Form state
const jobForm = ref({
  title: '',
  company: '',
  imageUrl: '',
  description: '',
  type: '',
  rate: '',
  link: '',
});

// Job list
const jobs = ref([]);

// Edit mode
const isEditing = ref(false);
const editingJobId = ref(null);
const isFormVisible = ref(false); // Track form visibility
const selectedJob = ref(null);
const searchQuery = ref('');

// Sidebar collapse state
const isSidebarCollapsed = ref(false);

// Function to toggle sidebar collapse
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// Function to open the job post form
function openJobPostForm() {
  isFormVisible.value = true; // Show the job form
}

// Function to close the job post form
function closeJobPostForm() {
  isFormVisible.value = false; // Hide the job form
}

// Load jobs from localStorage
function loadJobsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    jobs.value = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load jobs from localStorage:', err);
    jobs.value = [];
  }
}

onMounted(() => {
  loadJobsFromStorage();
});

// Watch jobs and update localStorage
watch(
  jobs,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true },
);

// Upload image
function handleImageUpload(event) {
  const file = event.target?.files?.[0] || event;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      jobForm.value.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
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
    alert('Please complete all fields.');
    return;
  }

  if (isEditing.value && editingJobId.value !== null) {
    // Update existing job
    const index = jobs.value.findIndex((job) => job.id === editingJobId.value);
    if (index !== -1) {
      jobs.value[index] = {
        ...jobs.value[index],
        ...jobForm.value,
      };
    }
    isEditing.value = false;
    editingJobId.value = null;
  } else {
    // Add new job
    const newJob = {
      id: Date.now(),
      ...jobForm.value,
    };
    jobs.value.unshift(newJob);
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
  };

  closeJobPostForm();
}

// Delete job
function deleteJob(id) {
  if (confirm('Are you sure you want to delete this job?')) {
    jobs.value = jobs.value.filter((job) => job.id !== id);
  }
}

// Edit job
function editJob(job) {
  jobForm.value = { ...job };
  editingJobId.value = job.id;
  isEditing.value = true;
  isFormVisible.value = true;
}

// Show job details
function showJobDetails(job) {
  selectedJob.value = job;
}

// Filtered jobs based on search
const filteredJobs = computed(() => {
  const searchText = searchQuery.value.toLowerCase();
  return jobs.value.filter((job) =>
    [job.title, job.company, job.description].some((field) =>
      field.toLowerCase().includes(searchText),
    ),
  );
});
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid class="page-background">
        <v-row class="fill-screen" dense>
          <!-- Left Column: Navigation -->
          <v-col cols="3" class="left-column my-5">
            <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
              <!-- Arrow Button -->
              <button class="toggle-btn" @click="toggleSidebar">
                <v-icon>{{ isSidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
              </button>

              <!-- Profile Section -->
              <div class="profile-section" v-if="!isSidebarCollapsed">
                <img src="@/assets/malupiton.png" alt="Profile Picture" class="profile-picture" />
                <h4 class="profile-name">Malupiton official</h4>
                <p class="profile-role">Businessman</p>
              </div>

              <!-- Navigation Menu -->
              <nav class="navigation-menu">
                <ul>
                  <li>
                    <a href="#" @click="openJobPostForm">
                      <i class="icon mdi mdi-bell-outline"></i>
                      <span v-if="!isSidebarCollapsed">Notification</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" @click="openJobPostForm">
                      <i class="icon mdi mdi-plus-circle-outline"></i>
                      <span v-if="!isSidebarCollapsed">Add Job</span>
                    </a>
                  </li>
                  <li>
                    <a href="/home">
                      <i class="icon mdi mdi-star-outline"></i>
                      <span v-if="!isSidebarCollapsed">Review</span>
                    </a>
                  </li>
                  <li>
                    <a href="/home">
                      <i class="icon mdi mdi-briefcase-outline"></i>
                      <span v-if="!isSidebarCollapsed">Job Posted</span>
                    </a>
                  </li>
                  
                  <li>
                    <a href="/">
                      <i class="icon mdi mdi-logout" style="color: red;"></i>
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

            <!-- Job Form (Middle) -->
            <v-card
              v-if="isFormVisible"
              class="pa-4 mb-6 rounded-xl custom-green-bg"
              elevation="1"
              flat
            >
              <div class="ribbon-container">
                <h4 class="ribbon-text">Add a Job</h4>
              </div>
              <v-btn
                class="close-btn margin-left"
                elevation="2"
                @click="closeJobPostForm"
              >
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
              <v-text-field
                v-model="jobForm.description"
                clearable
                label="Job Description"
                variant="solo-filled"
              
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
                color="#328E6E"
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
                  <v-card class="pa-4 rounded-xl w-100" elevation="3">
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
                        <h4 class="mb-1 font-weight-medium" @click.stop="handleJobTitleClick(job.id)">{{ job.title }}</h4>
                        <p class="text-body-2 mb-1 text-grey-darken-1">{{ job.company }}</p>
                        <p class="text-caption text-grey">{{ job.description }}</p>
                      </v-col>
                      <v-col cols="auto" class="d-flex align-center">
                        <v-btn class="mx-2" icon @click.stop="editJob(job)">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn icon @click.stop="deleteJob(job.id)">
                          <v-icon color="red">mdi-delete-outline</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>

          <!-- Right Column: Job Details -->
          <v-col cols="3" class="sticky-card ">
            <v-card v-if="selectedJob" class="pa-6 rounded-xl" elevation="3">
              <v-img :src="selectedJob.imageUrl" height="200px" cover class="mb-4" />
              <h4 class="mb-2 font-weight-medium">Job name: {{ selectedJob.title }}</h4>
              <p class="text-body-2 mb-2 text-grey-darken-1">Job description: {{ selectedJob.description }}</p>
              <p class="text-caption text-grey mb-2">Job Type: {{ selectedJob.type }}</p>
              <p class="text-caption text-grey-darken-1">Monthly rate: {{ selectedJob.rate }}</p>
              <p class="text-caption text-grey-darken-1">Job link: {{ selectedJob.link }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.fill-screen {
  height: 150vh;
  
}

.sticky-card {
  position: sticky;
  top: 0;
  background-color: #E1EEBC; /* Replace with your desired color */
  padding: 10px; /* Optional: Add padding for better spacing */
  border-radius: 10px; /* Optional: Add rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Add a shadow effect */
  margin-top: 25px;
  
}

.close-btn {
  width: 15px; /* Smaller width */
  height: 25px; /* Smaller height */
  border-radius: 4px; /* Keeps the button square */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #328E6E; /* Same as teal-darken-2 */
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.close-btn:hover {
  background-color: #328E6E; /* Slightly lighter teal on hover */
  transform: scale(1.1); /* Slight zoom effect on hover */
}

.close-btn:active {
  transform: scale(0.95); /* Slight shrink effect on click */
}

.margin-left {
  margin-right: 15px; /* Adjust the value as needed */
}

.custom-green-bg {
  background-color: #E1EEBC; /* Replace with your desired color */
  border: 1px solid #F2E7C4; /* Optional: Add a border for better visibility */
  border-radius: 8px; /* Keep the rounded corners */
  padding: 16px; /* Adjust padding if needed */
}

.ribbon-container {
  position: relative;
  background-color: #328E6E; /* Ribbon background color */
  color: white;
  padding: 0.5rem 2rem;
  text-align: center;
  font-weight: bold;
  border-radius: 5px 5px 0 0; /* Rounded top corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  margin-bottom: 1rem;
}

.ribbon-text {
  margin: 0;
  font-size: 1.25rem;
}

/* Sidebar Styles */
.sidebar {
  width: 350px;
  background-color: #F2E7C4;
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
  background-color: #328E6E;
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
  color: #333;
  font-size: 16px;
  font-weight: 500;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.navigation-menu a:hover {
  background-color: #fff;
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
}

/* Search Button */
.search-button {
  background-color: #328E6E;
  border: none;
  border-radius: 50%;
  color: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.search-button:hover {
  background-color: #005a4c;
  transform: scale(1.1);
}

.search-button:active {
  transform: scale(0.95);
}
</style>