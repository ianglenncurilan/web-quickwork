<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { useApplicationStore } from '@/stores/applicationStore'
import { useJobPostStore } from '@/stores/jobPostStore'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/utils/supabase'

const props = defineProps({
  jobId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['application-submitted', 'close-dialog'])

// Initialize stores
const applicationStore = useApplicationStore()
const jobPostStore = useJobPostStore()
const userStore = useUserStore()

// Load job applications on mount
onMounted(async () => {
  // Initialize user authentication
  await userStore.initializeUser()
  
  console.log('User authenticated:', userStore.isAuthenticated)
  console.log('User ID:', userStore.userId)
  
  if (props.jobId) {
    await applicationStore.fetchJobApplications(props.jobId)
    await jobPostStore.fetchJobPostById(props.jobId)
  }
})

// Computed property to get applications for this specific job
const jobApplications = computed(() => {
  return applicationStore.applications.filter((app) => app.job_id === props.jobId)
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
  position: '',
  education: '',
  resume: null,
  // coverLetter field removed
  references: [],
  agreement: false,
})

const isSubmitting = ref(false)
const submissionSuccess = ref(false) // Tracks if the submission was successful

// Submit application
async function submitApplication() {
  if (!formState.agreement) {
    alert('You must agree to the terms and conditions.')
    return
  }

  // Check if user is authenticated
  if (!userStore.isAuthenticated) {
    alert('You must be logged in to submit an application.')
    return
  }

  isSubmitting.value = true

  try {
    // Check if the user already has an application in the system
    const { data: existingApplications, error: checkError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userStore.userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing applications:', checkError)
      throw checkError
    }

    // If user already has an application, ask if they want to replace it
    if (existingApplications) {
      const confirmReplace = confirm(
        'You already have an application in the system. Submitting a new application will replace your existing one. Do you want to continue?'
      )
      
      if (!confirmReplace) {
        isSubmitting.value = false
        return
      }
      
      // Delete the existing application before submitting a new one
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('user_id', userStore.userId)
        
      if (deleteError) {
        console.error('Error deleting existing application:', deleteError)
        throw deleteError
      }
    }
    // Log the job ID to debug
    console.log('Original job ID:', props.jobId);
    
    // Convert job ID to a number if it's a string
    const numericJobId = typeof props.jobId === 'string' ? parseInt(props.jobId, 10) : props.jobId;
    console.log('Numeric job ID:', numericJobId);
    
    // Verify job exists before submission
    const jobPost = await jobPostStore.fetchJobPostById(numericJobId);
    
    if (!jobPost) {
      throw new Error(`Job with ID ${numericJobId} not found. Please select a valid job.`);
    }
    
    console.log('Found job post:', jobPost);
    
    const applicationData = {
      jobId: jobPost.id, // Use the actual job ID from the database
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone,
      address: formState.address,
      city: formState.city,
      state: formState.state,
      position: formState.position,
      education: formState.education,
      resume: formState.resume,
      // coverLetter field removed
      references: formState.references,
      userId: userStore.userId,
    }

    // Submit to Supabase via the store
    const result = await applicationStore.submitApplication(applicationData)

    if (result) {
      // Emit the data to parent component
      emit('application-submitted', result)

      // Reset form and show success message
      resetForm()
      submissionSuccess.value = true

      // Automatically hide the success message after a few seconds
      setTimeout(() => {
        submissionSuccess.value = false

        // Close the dialog after submission
        emit('close-dialog')
      }, 2000)
    }
  } catch (error) {
    console.error('Error submitting application:', error)
    alert('There was an error submitting your application. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
function resetForm() {
  Object.keys(formState).forEach((key) => {
    if (typeof formState[key] === 'boolean') {
      formState[key] = false
    } else if (Array.isArray(formState[key])) {
      formState[key] = []
    } else {
      formState[key] = ''
    }
  })
}

// Handle resume file upload
function handleResumeUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // In a real implementation, you would upload this file to Supabase storage
    // and then store the URL in formState.resume
    // For now, we'll just store the file name
    formState.resume = file.name
  }
}
</script>

<template>
  <div class="applications-container">
    <h2 class="form-title">Job Applications</h2>

    <div v-if="hasApplications" class="applications-list">
      <div v-for="application in jobApplications" :key="application.id" class="application-card">
        <div class="application-header">
          <div class="applicant-name">{{ application.first_name }} {{ application.last_name }}</div>
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

          <div v-if="application.resume" class="detail-row">
            <span class="detail-label">Resume:</span>
            <span class="detail-value">
              <a :href="application.resume" target="_blank">View Resume</a>
            </span>
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

    <!-- Success Message -->
    <div v-if="submissionSuccess" class="success-message">
      <v-alert type="success" dismissible>
        Your application has been submitted successfully!
      </v-alert>
    </div>

    <!-- Application Form -->
    <form v-else @submit.prevent="submitApplication">
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
        <input v-model="formState.position" type="text" id="position" required />
      </div>
      <div class="form-group">
        <label for="education">Education</label>
        <input v-model="formState.education" type="text" id="education" />
      </div>

      <!-- New fields for resume and cover letter -->
      <div class="form-group">
        <label for="resume">Resume</label>
        <input type="file" id="resume" @change="handleResumeUpload" accept=".pdf,.doc,.docx" />
        <small>Upload your resume (PDF, DOC, or DOCX)</small>
      </div>

      <!-- Cover letter field has been removed -->

      <div class="form-group checkbox-group">
        <input v-model="formState.agreement" type="checkbox" id="agreement" required />
        <label for="agreement">I agree to the terms and conditions</label>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
        </button>
      </div>
    </form>
  </div>

  <!-- We've removed the recursive dialog component that was causing issues -->
  <!-- This component should be used by a parent component instead of trying to include itself -->
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
  margin-top: 1.5rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 400px; /* Limit the width of the form */
  margin-left: auto; /* Center the form horizontally */
  margin-right: auto; /* Center the form horizontally */
}

.application-form h2 {
  font-size: 1.25rem; /* Reduce the font size */
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-align: center;
}

.form-group {
  margin-bottom: 0.75rem; /* Reduce spacing between form groups */
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem; /* Reduce spacing between label and input */
  font-size: 0.9rem; /* Reduce label font size */
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='tel'] {
  width: 100%;
  padding: 0.4rem; /* Reduce padding inside inputs */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem; /* Reduce input font size */
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

button[type='submit'] {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.4rem 0.75rem; /* Reduce button padding */
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem; /* Reduce button font size */
  transition: background-color 0.2s;
}

button[type='submit']:hover {
  background-color: #0056b3;
}

button[type='submit']:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem; /* Reduce success message font size */
}
</style>
