<script setup>
import { ref, onMounted, watch } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';

// Constants
const STORAGE_KEY = 'huntjobs-job-listings';

// States
const jobs = ref([]);
const jobForm = ref({
  title: '',
  company: '',
  imageUrl: '',
  description: '',
  type: '',
  rate: '',
  link: '',
});
const isEditing = ref(false);
const editingJobId = ref(null);
const isFormVisible = ref(false);
const selectedJob = ref(null);
const searchQuery = ref('');
const showPostedJobsOnly = ref(false);
const isSidebarCollapsed = ref(false);
const isNotificationVisible = ref(false);

// Notifications
const notificationMessages = ref([
  
]);

// Lifecycle Hook
onMounted(() => {
  loadJobsFromStorage();
});

// Watchers
watch(jobs, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

// =============================
// Sidebar
// =============================
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// =============================
// Notifications
// =============================
function toggleNotification() {
  isNotificationVisible.value = !isNotificationVisible.value;
  isFormVisible.value = false;
  selectedJob.value = null;
}

// =============================
// Job Form
// =============================
function openJobPostForm() {
  isNotificationVisible.value = false;
  selectedJob.value = null;
  isFormVisible.value = true;
}

function closeJobPostForm() {
  isFormVisible.value = false;
}

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

function postJob() {
  const form = jobForm.value;
  if (!form.title.trim() || !form.description.trim() || !form.type.trim() ||
      !form.rate.trim() || !form.link.trim() || !form.imageUrl) {
    alert('Please complete all fields.');
    return;
  }

  if (isEditing.value && editingJobId.value !== null) {
    const index = jobs.value.findIndex(job => job.id === editingJobId.value);
    if (index !== -1) {
      jobs.value[index] = { ...jobs.value[index], ...form };
    }
    isEditing.value = false;
    editingJobId.value = null;
  } else {
    const newJob = { id: Date.now(), ...form };
    jobs.value.unshift(newJob);
  }

  resetForm();
  closeJobPostForm();
}

function resetForm() {
  jobForm.value = {
    title: '',
    company: '',
    imageUrl: '',
    description: '',
    type: '',
    rate: '',
    link: '',
  };
}

// =============================
// Job Management
// =============================
function loadJobsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    jobs.value = stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load jobs:', err);
    jobs.value = [];
  }
}

function deleteJob(id) {
  if (confirm('Are you sure you want to delete this job?')) {
    jobs.value = jobs.value.filter(job => job.id !== id);
  }
}

function editJob(job) {
  jobForm.value = { ...job };
  editingJobId.value = job.id;
  isEditing.value = true;
  isFormVisible.value = true;
}

function showJobDetails(job) {
  selectedJob.value = job;
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
              <!-- Arrow Button -->
              <button class="toggle-btn" @click="toggleSidebar">
                <v-icon>{{ isSidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
              </button>

              <!-- Navigation Menu -->
              <nav class="navigation-menu">
                <ul>
                  <li><a href="#" @click.prevent="toggleNotification">
  <i class="icon mdi mdi-bell-outline"></i>
  <span v-if="!isSidebarCollapsed">Notification</span>
</a></li>

                  <li>
                    <a href="#" @click="openJobPostForm">
                      <i class="icon mdi mdi-plus-circle-outline"></i>
                      <span v-if="!isSidebarCollapsed">Add Job</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" @click="openJobPostForm">
                      <i class="icon mdi mdi-briefcase-outline"></i>
                      <span v-if="!isSidebarCollapsed">Job Posted</span>
                    </a>
                  </li>
                  <li>
                    <a href="/home">
                      <i class="icon mdi mdi-star-outline"></i>
                      <span v-if="!isSidebarCollapsed">Review</span>
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

            <v-card v-if="isNotificationVisible" class="pa-4 mb-4 rounded-xl" elevation="2">
  <div class="d-flex justify-space-between align-center mb-4">
    <div class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-bell-outline</v-icon>
      <h4 class="mb-0">Notifications</h4>
    </div>
    <v-btn icon @click="isNotificationVisible = false">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </div>

  <v-divider class="mb-4"></v-divider>

  <v-list dense nav>
    <v-list-item
      v-for="message in notificationMessages"
      :key="message.id"
      class="notification-item"
    >
      <v-list-item-avatar>
        <v-icon color="deep-purple">mdi-bell-ring</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title class="font-weight-bold">
          {{ message.text }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider v-if="notificationMessages.length" class="my-2" />
  </v-list>
</v-card>




            <!-- Job Form (Middle) -->
            <v-card
              v-if="isFormVisible"
              class="pa-4 mb-6 rounded-xl"
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
          <v-col cols="3" class="left-card">
            <v-card v-if="selectedJob" class="pa-6 rounded-xl" elevation="5">
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
  background-color: #90C67C; /* Replace with your desired color */
  border: 1px solid #90C67C; /* Optional: Add a border for better visibility */
  border-radius: 8px; /* Keep the rounded corners */
  padding: 16px; /* Adjust padding if needed */
}

.ribbon-container {
  position: relative;
  background-color: #328E6E;
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
  background-color: #E1EEBC;
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
  top: 330px;
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
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.search-button:hover {
  background-color: #0f1211;
  transform: scale(1.1);
}

.search-button:active {
  transform: scale(0.95);
}

.job-card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
.notification-item {
  transition: background-color 0.2s ease;
  border-radius: 10px;
}

.notification-item:hover {
  background-color: #f0f0f0;
}

</style>
