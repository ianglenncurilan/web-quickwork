<script setup>
import AppLayout from '@/components/layout/AppLayout.vue';
import { ref, onMounted, computed } from 'vue';

// Constants
const STORAGE_KEY = 'huntjobs-job-listings';

// Job list
const jobs = ref([]);

// Search query
const searchQuery = ref('');

// Sidebar collapsed state
const isSidebarCollapsed = ref(false);

// Function to toggle the sidebar
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
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

// Filtered jobs based on search
const filteredJobs = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return jobs.value.filter((job) =>
    [job.title, job.company, job.description].some((field) =>
      field.toLowerCase().includes(query)
    )
  );
});

// Load jobs when the component is mounted
onMounted(() => {
  loadJobsFromStorage();
});
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid>
        <v-row class="fill-screen" dense>
          <!-- Left Column: Navigation -->
          <v-col
            :cols="isSidebarCollapsed ? 1 : 3"
            class="left-column my-5"
          >
            <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
              <!-- Arrow Button -->
              <button class="toggle-btn" @click="toggleSidebar">
                <v-icon>{{ isSidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
              </button>

              <!-- Profile Section -->
              <div class="profile-section" v-if="!isSidebarCollapsed">
                <img src="@/assets/perdyboy.png" alt="Profile Picture" class="profile-picture" />
                <h4 class="profile-name">Perd</h4>
                <p class="profile-role">Student</p>
              </div>

              <!-- Navigation Menu -->
              <nav class="navigation-menu">
                <ul>
                  <li>
                    <a href="#" @click="openJobPostForm">
                      <i class="icon mdi mdi-magnify"></i>
                      <span v-if="!isSidebarCollapsed">Find Job</span>
                    </a>
                  </li>
                  <li>
                    <a href="/home">
                      <i class="icon mdi mdi-bell-outline"></i>
                      <span v-if="!isSidebarCollapsed">Notification</span>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="icon mdi mdi-star-outline"></i>
                      <span v-if="!isSidebarCollapsed">Reviews</span>
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

          <!-- Middle Column: Search + Jobs -->
          <v-col
            :cols="isSidebarCollapsed ? 11 : 9"
            class="scrollable-column middle-column"
          >
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
                <v-col
                  v-for="job in filteredJobs"
                  :key="job.id"
                  cols="12"
                  sm="6"
                  md="4"
                  class="d-flex"
                >
                  <v-card
                    class="mx-auto my-4"
                    max-width="374"
                  >
                    <v-img
                      height="200px"
                      :src="job.imageUrl"
                      cover
                    ></v-img>

                    <v-card-title>{{ job.title }}</v-card-title>

                    <v-card-subtitle>{{ job.company }}</v-card-subtitle>

                    <v-card-text>
                      <p><strong>Description:</strong> {{ job.description }}</p>
                      <p><strong>Type:</strong> {{ job.type }}</p>
                      <p><strong>Rate:</strong> {{ job.rate }}</p>
                      <p><strong>Link:</strong> <a :href="job.link" target="_blank">{{ job.link }}</a></p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.fill-screen {
  height: 100vh;
  overflow: hidden;
}

.scrollable-column {
  max-height: 100vh;
  overflow-y: auto;
  padding-right: 12px;
  transition: margin-left 0.3s ease; /* Smooth transition for position */
}

.middle-column {
  background-color: #F2E7C4; /* Light gray background color */
  padding: 20px; /* Optional padding for better spacing */
}

.sticky-card {
  position: sticky;
  top: 0;
}

/* Sidebar Styles */
.sidebar {
  width: 350px;
  background-color: #F2E7C4;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 200vh;
  overflow-y: auto;
  transition: width 0.3s ease; /* Smooth transition for width */
}

.sidebar.collapsed {
  width: 60px; /* Collapsed width */
  padding: 10px;
}

/* Toggle Button */
.toggle-btn {
  position: absolute;
  top: 300px;
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
  transition: transform 0.3s ease; /* Smooth transition for hover effect */
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
  background-color: #005a4c;
  transform: scale(1.1);
}
.search-button:active {
  transform: scale(0.95);
}
</style>