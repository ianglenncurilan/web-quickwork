    <script setup>
    import AppLayout from '@/components/layout/AppLayout.vue'
    import { ref, onMounted, watch, computed } from 'vue'

    // Constants
    const STORAGE_KEY = 'huntjobs-job-listings'

    // Form state
    const jobForm = ref({
      title: '',
      company: '',
      imageUrl: '',
      description: '',
      contact: '',
    })

    // Job list
    const jobs = ref([])

    // Edit mode
    const isEditing = ref(false)
    const editingJobId = ref(null)
    const isFormVisible = ref(false) // Track form visibility
    const selectedJob = ref(null)
    const searchQuery = ref('')

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
      if (
        !jobForm.value.title.trim() ||
        !jobForm.value.company.trim() ||
        !jobForm.value.imageUrl ||
        !jobForm.value.description.trim() ||
        !jobForm.value.contact.trim()
      ) {
        alert('Please complete all fields.')
        return
      }

      if (isEditing.value && editingJobId.value !== null) {
        const index = jobs.value.findIndex((job) => job.id === editingJobId.value)
        if (index !== -1) {
          jobs.value[index] = {
            ...jobs.value[index],
            ...jobForm.value,
          }
        }
        isEditing.value = false
        editingJobId.value = null
      } else {
        const newJob = {
          id: Date.now(),
          ...jobForm.value,
        }
        jobs.value.unshift(newJob)
      }

      jobForm.value = {
        title: '',
        company: '',
        imageUrl: '',
        description: '',
        contact: '',
      }

      closeJobPostForm()
    }

    // Delete job
    function deleteJob(id) {
      if (confirm('Are you sure you want to delete this job?')) {
        jobs.value = jobs.value.filter((job) => job.id !== id)
      }
    }

    // Edit job
    function editJob(job) {
      jobForm.value = { ...job }
      editingJobId.value = job.id
      isEditing.value = true
      isFormVisible.value = true
    }

    // Toggle form
    function openJobPostForm() {
      isFormVisible.value = true
    }

    function closeJobPostForm() {
      isFormVisible.value = false
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
    </script>

    <template>
      <AppLayout>
        <template #content>
          <v-container fluid>
            <v-row class="fill-screen" dense>
              <!-- Left Column: Navigation -->
              <v-col cols="3" class="left-column my-5">
                <v-card class="pa-6 rounded-2xl" elevation="3" color="#f4f4f6">
                  <v-list nav dense class="bg-transparent">
                    <v-list-item link @click="openJobPostForm" class="rounded-lg mb-2">
                      <v-list-item-icon
                        ><v-icon color="primary">mdi-plus-circle-outline</v-icon></v-list-item-icon
                      >
                      <v-list-item-title class="font-weight-medium text-primary"
                        >Add Job</v-list-item-title
                      >
                    </v-list-item>

                    <v-list-item link class="rounded-lg mb-2" to="/post">
                      <v-list-item-icon><v-icon>mdi-briefcase-search</v-icon></v-list-item-icon>
                      <v-list-item-title class="font-weight-medium">Find Job</v-list-item-title>
                    </v-list-item>

                    <v-list-item link class="rounded-lg mb-2">
                      <v-list-item-icon><v-icon>mdi-briefcase-account</v-icon></v-list-item-icon>
                      <v-list-item-title class="font-weight-medium">My Job</v-list-item-title>
                    </v-list-item>

                    <v-list-item link class="rounded-lg mt-4" to="/">
                      <v-list-item-icon><v-icon color="red">mdi-logout</v-icon></v-list-item-icon>
                      <v-list-item-title class="font-weight-medium text-red">Logout</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <!-- Middle Column: Search + Jobs + Form -->
              <v-col cols="6" class="scrollable-column">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Jobs"
                  variant="outlined"
                  dense
                  class="mx-4 mt-5"
                  clearable
                  append-icon="mdi-magnify"
                />

                <v-btn
                  color="primary"
                  class="mx-4 text-white text-capitalize"
                  prepend-icon="mdi-plus"
                  @click="openJobPostForm"
                >
                  Add Job
                </v-btn>

                <!-- Job Form (Middle) -->
                <v-card
                  v-if="isFormVisible"
                  class="pa-4 mb-6 rounded-xl my-5"
                  elevation="1"
                  color="white"
                  flat
                >
                  <v-row align="center" justify="space-between">
                    <v-card-title class="text-h6 font-weight-medium">Add a Job</v-card-title>
                    <v-btn icon @click="closeJobPostForm"><v-icon color="red">mdi-close</v-icon></v-btn>
                  </v-row>

                  <v-divider class="my-5"></v-divider>

                  <v-text-field
                    v-model="jobForm.title"
                    label="Job Title"
                    variant="outlined"
                    class="mb-4"
                    required
                  />
                  <v-text-field
                    v-model="jobForm.company"
                    label="Company"
                    variant="outlined"
                    class="mb-4"
                    required
                  />
                  <v-file-input
                    label="Upload Job Image"
                    variant="outlined"
                    class="mb-4"
                    @change="handleImageUpload"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                  />
                  <v-textarea
                    v-model="jobForm.description"
                    label="Job Description"
                    variant="outlined"
                    auto-grow
                    rows="3"
                    class="mb-4"
                    required
                  />
                  <v-text-field
                    v-model="jobForm.contact"
                    label="Contact or Socials"
                    variant="outlined"
                    class="mb-6"
                    required
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
                            <h4 class="mb-1 font-weight-medium">{{ job.title }}</h4>
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
              <v-col cols="3" class="sticky-card my -5">
                <v-card v-if="selectedJob" class="pa-6 rounded-xl" elevation="3">
                  <v-img :src="selectedJob.imageUrl" height="200px" cover class="mb-4" />
                  <h4 class="mb-2 font-weight-medium">{{ selectedJob.title }}</h4>
                  <p class="text-body-2 mb-2 text-grey-darken-1">{{ selectedJob.company }}</p>
                  <p class="text-caption text-grey mb-2">{{ selectedJob.description }}</p>
                  <p class="text-caption text-grey-darken-1">Contact: {{ selectedJob.contact }}</p>
                </v-card>
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
    }

    .sticky-card {
      position: sticky;
      top: 0;
    }
    </style>
