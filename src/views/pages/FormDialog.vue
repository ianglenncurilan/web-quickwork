<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  jobId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'form-viewed'])

// Store application data
const APPLICATIONS_STORAGE_KEY = 'huntjobs-applications'
const applicationData = ref({})

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

// Watch applications and update localStorage
watch(
  applicationData,
  () => {
    saveApplicationsToStorage()
  },
  { deep: true },
)

// Computed property to get applications for the current job
const jobApplications = computed(() => {
  return applicationData.value[props.jobId] || []
})

const hasApplications = computed(() => {
  return jobApplications.value.length > 0
})

// Format date helper function
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Close the dialog
function closeDialog() {
  emit('update:modelValue', false)
}

onMounted(() => {
  loadApplicationsFromStorage()
})

// Delete application
function deleteApplication(applicationId) {
  if (confirm('Are you sure you want to delete this application?')) {
    if (applicationData.value[props.jobId]) {
      applicationData.value[props.jobId] = applicationData.value[props.jobId].filter(
        (app) => app.id !== applicationId,
      )
    }
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="900px" persistent>
    <v-card>
      <v-card-title class="headline text-center pt-5">
        Job Applications
        <v-btn icon class="close-button" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div v-if="hasApplications" class="applications-container">
          <div
            v-for="application in jobApplications"
            :key="application.id"
            class="application-card"
            :class="{ 'new-application': !application.viewed }"
          >
            <div class="application-header">
              <div class="d-flex align-center">
                <v-avatar color="teal" size="36" class="mr-2">
                  {{ application.firstName ? application.firstName.charAt(0) : '' }}
                  {{ application.lastName ? application.lastName.charAt(0) : '' }}
                </v-avatar>
                <div>
                  <div class="applicant-name">
                    {{ application.firstName }} {{ application.lastName }}
                    <v-chip v-if="!application.viewed" size="small" color="red" class="ml-2"
                      >New</v-chip
                    >
                  </div>
                  <div class="application-date text-caption">
                    Applied on {{ formatDate(application.timestamp) }}
                  </div>
                </div>
              </div>

              <div class="application-actions">
                <v-btn icon small @click="deleteApplication(application.id)" color="red">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <div class="application-details">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ application.email }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{ application.phone || 'Not provided' }}</span>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>

        <div v-else class="no-applications">
          <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
          <p class="text-h6 mt-3">No applications have been submitted for this job yet.</p>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.applications-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.application-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.new-application {
  border-left: 4px solid #f44336;
  background-color: #fff8f8;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.applicant-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.application-date {
  color: #666;
  font-size: 0.85rem;
}

.application-details {
  margin-top: 10px;
}

.detail-row {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
}

.application-actions-footer {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}

.no-applications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.close-button {
  position: absolute !important;
  top: 10px;
  right: 10px;
}

@media (max-width: 600px) {
  .application-actions-footer {
    flex-direction: column;
  }

  .application-actions-footer .v-btn {
    margin-left: 0 !important;
    margin-top: 8px;
    width: 100%;
  }
}
</style>
