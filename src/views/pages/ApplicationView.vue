<script setup>
import { ref, reactive } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  jobId: {
    type: String,
    required: true,
  },
  jobs: {
    type: Array,
    required: true, // Ensure the jobs array is passed as a prop
  },
})

const emit = defineEmits(['application-submitted'])

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
  education: '',
  position: '',
  resume: null,
  coverLetter: null,
  references: [{ name: '', relationship: '', contact: '' }],
  agreement: false,
})

// Form validation state
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  agreement: '',
  resume: '',
})

// UI state
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const formStep = ref(1)
const totalSteps = 3

// Available positions
const positions = [
  'Software Developer',
  'UX Designer',
  'Product Manager',
  'Marketing Specialist',
  'Customer Support Representative',
  'Sales Representative',
  'Data Analyst',
  'Other',
]

// Education options
const educationOptions = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Other',
]

// Handle file upload
const handleFileUpload = (event, field) => {
  const file = event.target.files[0]
  if (file) {
    formState[field] = file
    errors[field] = '' // Clear any previous errors
  }
}

// Add reference
const addReference = () => {
  formState.references.push({ name: '', relationship: '', contact: '' })
}

// Remove reference
const removeReference = (index) => {
  formState.references.splice(index, 1)
}

// Move to next step
const nextStep = () => {
  if (validateStep(formStep.value)) {
    formStep.value++
    clearErrors() // Clear errors when moving to the next step
  }
}

// Move to previous step
const prevStep = () => {
  formStep.value--
}

// Validate current step
const validateStep = (step) => {
  let isValid = true

  if (step === 1) {
    // Validate personal info
    if (!formState.firstName.trim()) {
      errors.firstName = 'First name is required'
      isValid = false
    } else {
      errors.firstName = ''
    }

    if (!formState.lastName.trim()) {
      errors.lastName = 'Last name is required'
      isValid = false
    } else {
      errors.lastName = ''
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
      errors.email = 'Please enter a valid email'
      isValid = false
    } else {
      errors.email = ''
    }

    if (formState.phone && !/^[0-9]{10}$/.test(formState.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
      isValid = false
    } else {
      errors.phone = ''
    }
  }

  if (step === 2) {
    // Validate resume upload
    if (!formState.resume) {
      errors.resume = 'Resume is required'
      isValid = false
    } else {
      errors.resume = ''
    }
  }

  return isValid
}

// Clear validation errors
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

// Submit form
const submitForm = async () => {
  const finalValidation = validateStep(formStep.value)

  if (!formState.agreement) {
    errors.agreement = 'You must agree to the terms'
    return
  } else {
    errors.agreement = ''
  }

  if (finalValidation) {
    isSubmitting.value = true

    // Generate application ID
    const applicationId = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create application data object
    const applicationData = {
      id: applicationId,
      jobId: props.jobId,
      timestamp: new Date().toISOString(),
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
    }

    // Emit event to parent for notification
    emit('application-submitted', applicationData)

    // Reset form and show success message
    resetForm()
    isSubmitting.value = false
    isSubmitted.value = true
  }
}

// Reset form
const resetForm = () => {
  Object.keys(formState).forEach((key) => {
    if (Array.isArray(formState[key])) {
      formState[key] = key === 'references' ? [{ name: '', relationship: '', contact: '' }] : []
    } else if (typeof formState[key] === 'boolean') {
      formState[key] = false
    } else {
      formState[key] = ''
    }
  })
  formStep.value = 1
}
</script>

<template>
  <div class="container">
    <div class="form-container">
      <ApplicationView
        v-if="selectedJobId"
        :jobId="selectedJobId"
        @application-submitted="handleApplicationSubmitted"
      />
      <div v-if="!isSubmitted">
        <h1>Job Application Form</h1>
        <p>Applying for Job ID: {{ jobId }}</p>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${(formStep / totalSteps) * 100}%` }"></div>
          </div>
          <div class="steps">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="step"
              :class="{ active: step === formStep, completed: step < formStep }"
            >
              {{ step }}
            </div>
          </div>
          <div class="step-labels">
            <span>Personal Info</span>
            <span>Professional Details</span>
            <span>Review & Submit</span>
          </div>
        </div>

        <!-- Step 1: Personal Information -->
        <div v-if="formStep === 1" class="form-step">
          <h2>Personal Information</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name <span class="required">*</span></label>
              <input
                type="text"
                id="firstName"
                v-model="formState.firstName"
                :class="{ 'error-input': errors.firstName }"
              />
              <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name <span class="required">*</span></label>
              <input
                type="text"
                id="lastName"
                v-model="formState.lastName"
                :class="{ 'error-input': errors.lastName }"
              />
              <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <input
                type="email"
                id="email"
                v-model="formState.email"
                :class="{ 'error-input': errors.email }"
              />
              <span v-if="errors.email" class="error">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                v-model="formState.phone"
                @input="formatPhone"
                :class="{ 'error-input': errors.phone }"
                placeholder="(XXX) XXX-XXXX"
              />
              <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="address">Street Address</label>
            <input type="text" id="address" v-model="formState.address" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input type="text" id="city" v-model="formState.city" />
            </div>

            <div class="form-group">
              <label for="state">State</label>
              <input type="text" id="state" v-model="formState.state" />
            </div>

            <div class="form-group">
              <label for="zipCode">Zip Code</label>
              <input type="text" id="zipCode" v-model="formState.zipCode" />
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-primary" @click="nextStep">Next</button>
          </div>
        </div>

        <!-- Step 2: Professional Details -->
        <div v-if="formStep === 2" class="form-step">
          <h2>Professional Details</h2>

          <div class="form-group">
            <label for="position">Position Applying For</label>
            <select id="position" v-model="formState.position">
              <option value="" disabled>Select a position</option>
              <option v-for="position in positions" :key="position" :value="position">
                {{ position }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="education">Highest Education Level</label>
            <select id="education" v-model="formState.education">
              <option value="" disabled>Select education level</option>
              <option v-for="education in educationOptions" :key="education" :value="education">
                {{ education }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="resume">Resume (PDF or DOC)</label>
            <input
              type="file"
              id="resume"
              @change="(e) => handleFileUpload(e, 'resume')"
              accept=".pdf,.doc,.docx"
              :class="{ 'error-input': errors.resume }"
            />
            <span v-if="errors.resume" class="error">{{ errors.resume }}</span>
          </div>

          <div class="form-group">
            <label for="coverLetter">Cover Letter (Optional)</label>
            <input
              type="file"
              id="coverLetter"
              @change="(e) => handleFileUpload(e, 'coverLetter')"
              accept=".pdf,.doc,.docx"
            />
          </div>

          <div class="references-section">
            <h3>References</h3>

            <div
              v-for="(reference, index) in formState.references"
              :key="index"
              class="reference-item"
            >
              <div class="reference-header">
                <h4>Reference {{ index + 1 }}</h4>
                <button
                  v-if="formState.references.length > 1"
                  type="button"
                  class="btn btn-icon"
                  @click="removeReference(index)"
                >
                  ✕
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label :for="`refName${index}`">Name</label>
                  <input type="text" :id="`refName${index}`" v-model="reference.name" />
                </div>

                <div class="form-group">
                  <label :for="`refRelationship${index}`">Relationship</label>
                  <input
                    type="text"
                    :id="`refRelationship${index}`"
                    v-model="reference.relationship"
                  />
                </div>

                <div class="form-group">
                  <label :for="`refContact${index}`">Contact</label>
                  <input type="text" :id="`refContact${index}`" v-model="reference.contact" />
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-secondary btn-add" @click="addReference">
              + Add Reference
            </button>
          </div>

          <div class="button-group">
            <button class="btn btn-outline" @click="prevStep">Back</button>
            <button class="btn btn-primary" @click="nextStep">Next</button>
          </div>
        </div>

        <!-- Step 3: Review & Submit -->
        <div v-if="formStep === 3" class="form-step">
          <h2>Review & Submit</h2>

          <div class="review-section">
            <h3>Personal Information</h3>
            <div class="review-row">
              <span class="review-label">Name:</span>
              <span class="review-value">{{ formState.firstName }} {{ formState.lastName }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Email:</span>
              <span class="review-value">{{ formState.email }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Phone:</span>
              <span class="review-value">{{ formState.phone || 'Not provided' }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Address:</span>
              <span class="review-value">
                {{ formState.address ? `${formState.address}, ` : '' }}
                {{ formState.city ? `${formState.city}, ` : '' }}
                {{ formState.state || '' }}
                {{ formState.zipCode || '' }}
              </span>
            </div>
          </div>

          <div class="review-section">
            <h3>Professional Details</h3>
            <div class="review-row">
              <span class="review-label">Position:</span>
              <span class="review-value">{{ formState.position || 'Not selected' }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Education:</span>
              <span class="review-value">{{ formState.education || 'Not selected' }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Resume:</span>
              <span class="review-value">{{
                formState.resume ? formState.resume.name : 'Not uploaded'
              }}</span>
            </div>
            <div class="review-row">
              <span class="review-label">Cover Letter:</span>
              <span class="review-value">{{
                formState.coverLetter ? formState.coverLetter.name : 'Not uploaded'
              }}</span>
            </div>
          </div>

          <div class="review-section">
            <h3>References</h3>
            <div
              v-for="(reference, index) in formState.references"
              :key="index"
              class="reference-review"
            >
              <h4>Reference {{ index + 1 }}</h4>
              <div class="review-row">
                <span class="review-label">Name:</span>
                <span class="review-value">{{ reference.name || 'Not provided' }}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Relationship:</span>
                <span class="review-value">{{ reference.relationship || 'Not provided' }}</span>
              </div>
              <div class="review-row">
                <span class="review-label">Contact:</span>
                <span class="review-value">{{ reference.contact || 'Not provided' }}</span>
              </div>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <input
              type="checkbox"
              id="agreement"
              v-model="formState.agreement"
              :class="{ 'error-input': errors.agreement }"
            />
            <label for="agreement">
              I certify that all information provided is true and complete to the best of my
              knowledge.
              <span class="required">*</span>
            </label>
            <span v-if="errors.agreement" class="error">{{ errors.agreement }}</span>
          </div>

          <div class="button-group">
            <button class="btn btn-outline" @click="prevStep">Back</button>
            <button class="btn btn-primary" @click="submitForm" :disabled="isSubmitting">
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Application</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="form-success">
        <div class="success-icon">
          <v-icon size="64" color="success">mdi-check-circle</v-icon>
        </div>
        <h2>Application Submitted Successfully!</h2>
        <p>
          Thank you for your application. We will review your information and get back to you soon.
        </p>
      </div>
    </div>
  </div>
</template>

<style>
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9fafb;
}

.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

.form-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #1a1a1a;
  text-align: center;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 16px;
  color: #444;
}

h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #555;
}

/* Progress bar styles */
.progress-container {
  margin-bottom: 40px;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step.active {
  background-color: #3b82f6;
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.step.completed {
  background-color: #4ade80;
  color: #fff;
}

.step-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

/* Form styles */
.form-step {
  animation: fadeIn 0.5s ease;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.form-group {
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #444;
}

.required {
  color: #e53e3e;
}

input[type='text'],
input[type='email'],
input[type='tel'],
select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

input[type='file'] {
  padding: 10px;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
}

.error {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 5px;
}

.error-input {
  border-color: #e53e3e !important;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
}

.checkbox-group input {
  margin-top: 6px;
  margin-right: 10px;
}

/* References section */
.references-section {
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.reference-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.reference-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reference-header h4 {
  margin-bottom: 0;
}

/* Review section */
.review-section {
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 8px;
}

.review-row {
  display: flex;
  margin-bottom: 10px;
}

.review-label {
  font-weight: 500;
  width: 30%;
  min-width: 120px;
  color: #666;
}

.review-value {
  color: #333;
  flex: 1;
}

.reference-review {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.reference-review:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

/* Buttons */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #cbd5e1;
  color: #64748b;
}

.btn-outline:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 500;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-add {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
}

.btn-icon:hover {
  color: #e53e3e;
}

/* Success page */
.success-container {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  background-color: #4ade80;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.success-container h2 {
  color: #1a1a1a;
  margin-bottom: 16px;
}

.success-container p {
  color: #666;
  margin-bottom: 12px;
  font-size: 16px;
}

.application-id {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  display: inline-block;
}

.application-id span:first-child {
  color: #64748b;
  margin-right: 10px;
}

.application-id span:last-child {
  font-weight: 600;
  color: #334155;
  letter-spacing: 1px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-container {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-group {
    min-width: 100%;
  }

  .button-group {
    flex-direction: column-reverse;
    gap: 15px;
  }

  .btn {
    width: 100%;
  }

  .step-labels {
    font-size: 12px;
  }
}
</style>
