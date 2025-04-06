<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'

const showPassword = ref(false)
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container
        class="d-flex align-center justify-center"
        style=" min-height: 80vh"
      >
        <v-card class="rounded-lg overflow-hidden" elevation="10" max-width="900">
          <v-row no-gutters>
            <!-- Left Section - Sign Up Prompt -->
            <v-col
              cols="12"
              md="5"
              class="d-flex flex-column align-center justify-center new-here-section"
            >
              <h3 class="font-weight-bold text-center">New Here?</h3>
              <p class="text-center">Sign up and discover a great amount of new opportunities!</p>
              <v-btn color="white" outlined class="mt-2" to="/register">SIGN UP</v-btn>
            </v-col>

            <!-- Right Section - Login Form -->
            <v-col cols="12" md="7" class="pa-5">
              <div class="ribbon-container">
                <h3 class="ribbon-text">Welcome to Quickwork!</h3>
              </div><br>
              <p class="text-center my-2">Log in to your account to continue</p>
              <v-form fast-fail @submit.prevent>
                <v-text-field label="Email" variant="outlined" required></v-text-field>
                <v-text-field
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  required
                  append-inner-icon="mdi-eye"
                  @click:append-inner="showPassword = !showPassword"
                ></v-text-field>
                <div class="d-flex justify-center">
                  <v-btn class="mt-3 btn-fixed-width" color="#00412E" type="submit">LOGIN</v-btn>
                </div>
                <div class="text-center mt-2">
                  <Router-link to="/forgot-password" class="forgot-password-link">Forgot Password?</Router-link>
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
                <Router-link to="/register">Click Here to Register</Router-link>
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
  background-color: #00412E;
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
  transition: all 0.3s ease;
}

.new-here-section .v-btn:hover {
  background-color: white;
  color: #00412E;
}

.ribbon-container {
  position: relative;
  display: flex; /* Use flexbox for centering */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #00412E; /* Ribbon background color */
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
  border-color: #00412E transparent transparent transparent;
}

.ribbon-container::after {
  right: 0;
  border-width: 10px 0 0 10px;
  border-color: #00412E transparent transparent transparent;
}

.forgot-password-link {
  color: #00412E;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #007bff; /* Change color on hover */
  text-decoration: underline;
}
</style>

