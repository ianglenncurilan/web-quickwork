<script setup>
import { computed, ref, reactive } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  jobId: {
    type: [Number, String],
    required: true,
  },
  applications: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['application-submitted'])

// Computed property to get applications for this specific job
const jobApplications = computed(() => {
  return props.applications[props.jobId] || []
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

// Form state management
const formState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  position: '',
  education: '',
  agreement: false,
})

const isSubmitting = ref(false)

// Submit application
function submitApplication() {
  // Gather form data
  const applicationData = {
    jobId: props.jobId,
    firstName: formState.firstName,
    lastName: formState.lastName,
    email: formState.email,
    phone: formState.phone,
    address: formState.address,
    city: formState.city,
    state: formState.state,
    zipCode: formState.zipCode,
    position: formState.position,
    education: formState.education,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  }

  // Emit the data to parent component
  emit('application-submitted', applicationData)

  // Reset form
  resetForm()
}

// Reset form
function resetForm() {
  Object.keys(formState).forEach((key) => {
    if (typeof formState[key] === 'boolean') {
      formState[key] = false
    } else {
      formState[key] = ''
    }
  })
}
</script>

<template>
  <div class="applications-container">
    <h2 class="form-title">Job Applications</h2>

    <div v-if="hasApplications" class="applications-list">
      <div v-for="application in jobApplications" :key="application.id" class="application-card">
        <div class="application-header">
          <div class="applicant-name">{{ application.firstName }} {{ application.lastName }}</div>
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
  </div>

  <div class="application-form">
    <h2>Apply for Job</h2>
    <form @submit.prevent="submitApplication">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input v-model="formState.firstName" type="text" id="firstName" required />
      </div>
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input v-model="formState.lastName" type="text" id="lastName" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="formState.email" type="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input v-model="formState.phone" type="tel" id="phone" />
      </div>
      <div class="form-group">
        <label for="address">Address</label>
        <input v-model="formState.address" type="text" id="address" />
      </div>
      <div class="form-group">
        <label for="city">City</label>
        <input v-model="formState.city" type="text" id="city" />
      </div>
      <div class="form-group">
        <label for="state">State</label>
        <input v-model="formState.state" type="text" id="state" />
      </div>
      <div class="form-group">
        <label for="zipCode">Zip Code</label>
        <input v-model="formState.zipCode" type="text" id="zipCode" />
      </div>
      <div class="form-group">
        <label for="position">Position</label>
        <input v-model="formState.position" type="text" id="position" />
      </div>
      <div class="form-group">
        <label for="education">Education</label>
        <input v-model="formState.education" type="text" id="education" />
      </div>
      <div class="form-group">
        <label>
          <input v-model="formState.agreement" type="checkbox" />
          I agree to the terms and conditions
        </label>
      </div>
      <button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Submitting...</span>
        <span v-else>Submit Application</span>
      </button>
    </form>
  </div>

  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title class="headline text-center pt-5">Job Application</v-card-title>
      <v-card-text>
        <ApplyView
          v-if="selectedJobId"
          :jobId="selectedJobId"
          @application-submitted="handleApplicationSubmitted"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.applications-container {
  padding: 1rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.applicant-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.application-date {
  color: #666;
  font-size: 0.9rem;
}

.application-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  min-width: 80px;
}

.detail-value {
  color: #333;
}

.application-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.contact-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.contact-button:hover {
  background-color: #388e3c;
}

.no-applications {
  text-align: center;
  color: #666;
  padding: 2rem 0;
  font-style: italic;
}

.application-form {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.application-form h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='tel'] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

button[type='submit'] {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

button[type='submit']:hover {
  background-color: #0056b3;
}

button[type='submit']:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
