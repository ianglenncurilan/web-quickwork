
<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'
import { requiredValidator,  emailValidator, passwordValidator} from '@/utils/validators'
import { useRouter } from 'vue-router'

const router = useRouter()
const showPassword = ref(false)

const formDataDefault = ref({
  email: '',
  password: '',
})

const formData = ref({ 
  ...formDataDefault.value
})

const refVform = ref()

const onFormSubmit = () => {
  refVform.value?.validate().then (({valid: isValid}) => {
    //if (isValid) onSubmit()
  })
}


// Define roles and selectedRole for the dropdown
const roles = ref(['Student', 'Businessman'])
const selectedRole = ref('')

// Handle form submission
function handleLogin() {
  if (!selectedRole.value) {
    alert('Please select a role before logging in.')
    return
  }

  // Navigate to a specific route based on the selected role
  if (selectedRole.value === 'Student') {
    router.push('/student') // Navigate to StudentView
  } else if (selectedRole.value === 'Businessman') {
    router.push('/post') // Navigate to PostView
  } else {
    alert('Invalid role selected.')
  }
}
</script>


<template>
  <AppLayout>
    <template #content>
      <v-container class="d-flex align-center justify-center" style="min-height: 80vh">
        <v-card class="rounded-lg overflow-hidden" elevation="10" max-width="900">
          <v-row no-gutters>
            <!-- Left Section - Sign Up Prompt -->
            <v-col
              cols="12"
              md="5"
              class="d-flex flex-column align-center justify-center new-here-section"
            >
              <img
                src="@/assets/quickie.png"
                alt="Quickie Logo"
                class="logo"
                width="200px"
                height="200px"
              />
              <h3 class="font-weight-bold text-center">New Here?</h3>
              <p class="text-center">Sign up and discover a great amount of new opportunities!</p>
              <v-btn color="white" outlined class="mt-2" to="/register">SIGN UP</v-btn>
            </v-col>

            <!-- Right Section - Login Form -->
            <v-col cols="12" md="7" class="pa-5">
              <div class="ribbon-container">
                <h3 class="ribbon-text">Welcome to Quickwork!</h3>
              </div>
              <br />
              <p class="text-center my-2">Log in to your account to continue</p>
              <v-form ref="refVform" fast-fail @submit.prevent="onFormSubmit">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  variant="outlined"
                  required
                  :rules="[emailValidator]"
                ></v-text-field>
                <v-text-field
                  v-model="formData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  required
                  :rules="[requiredValidator, passwordValidator]"
                  append-inner-icon="mdi-eye"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="[requiredValidator]"
                ></v-text-field>

                <!-- Dropdown for selecting role -->
                <div class="dropdown-container">
                  <label for="role-select" class="dropdown-label">Select Role</label>
                  <div class="custom-dropdown">
                    <select id="role-select" v-model="selectedRole" class="dropdown-select">
                      <option value="" disabled>Select Role</option>
                      <option v-for="role in roles" :key="role" :value="role">
                        {{ role }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="d-flex justify-center">
                  <v-btn class="mt-3 btn-fixed-width" color="#00412E" type="submit" to="/post">LOGIN</v-btn>
                </div>
                <div class="text-center mt-2">
                  <Router-link to="/forgot-password" class="forgot-password-link">
                    Forgot Password?
                  </Router-link>
                </div>
              </v-form>
              <div class="text-center mt-4">
                <p class="my-4">Or</p>
                <v-btn icon class="mx-2"><v-icon color="red">mdi-google</v-icon></v-btn>
                <v-btn icon class="mx-2"><v-icon color="blue">mdi-facebook</v-icon></v-btn>
                <v-btn icon class="mx-2"><v-icon color="light-blue">mdi-twitter</v-icon></v-btn>
              </div>
              <v-divider class="my-4"></v-divider>
              <h5 class="text-center">
                Don't have an account?
                <Router-link to="/register">Click to Register</Router-link>
              </h5>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.btn-fixed-width {
  width: 200px;
}

.new-here-section {
  background-color: #328E6E;
  color: white;
  padding: 2rem;
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  background-image: url('@/assets/background-pattern.png'); /* Background image */
  background-size: cover;
  background-position: center;
  text-align: center;
}

.new-here-section h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.new-here-section p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.new-here-section .v-btn {
  font-weight: bold;
  border: 2px solid white;
  transition: all 0.2s ease;
}

.new-here-section .v-btn:hover {
  background-color: white;
  color: #00412e;
}

.ribbon-container {
  position: relative;
  display: flex; /* Use flexbox for centering */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #328E6E; /* Ribbon background color */
  color: white;
  padding: 0.5rem 2rem;
  border-radius: 5px 5px 0 0; /* Rounded top corners */
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  margin: 0 auto; /* Center the ribbon horizontally */
  width: fit-content; /* Adjust width to fit content */
}

.ribbon-container::before,
.ribbon-container::after {
  content: '';
  position: absolute;
  top: 100%; /* Position below the ribbon */
  width: 0;
  height: 0;
  border-style: solid;
}

.ribbon-container::before {
  left: 0;
  border-width: 10px 10px 0 0;
  border-color: #328E6E transparent transparent transparent;
}

.ribbon-container::after {
  right: 0;
  border-width: 10px 0 0 10px;
  border-color: #328E6E transparent transparent transparent;
}

.forgot-password-link {
  color: #00412e;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #007bff; /* Change color on hover */
  text-decoration: underline;
}

/* Dropdown Container */
.dropdown-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Dropdown Label */
.dropdown-label {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

/* Custom Dropdown */
.custom-dropdown {
  position: relative;
  width: 100%;
  max-width: 300px;
}

/* Dropdown Select */
.dropdown-select {
  width: 100%;
  padding: 10px 15px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 8px;
  appearance: none; /* Remove default dropdown arrow */
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Dropdown Select Hover/Focus */
.dropdown-select:hover,
.dropdown-select:focus {
  border-color: #00796b;
  box-shadow: 0 0 5px rgba(0, 121, 107, 0.5);
}

/* Add a custom arrow */
.custom-dropdown::after {
  content: '▼';
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #333;
  pointer-events: none;
}
</style>
