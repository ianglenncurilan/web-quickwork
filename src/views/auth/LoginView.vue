<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
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
              class="d-flex flex-column align-center justify-center"
              style="background-color: #007bff; color: white; padding: 2rem"
            >
              <h3 class="font-weight-bold text-center">New Here?</h3>
              <p class="text-center">Sign up and discover a great amount of new opportunities!</p>
              <v-btn color="white" outlined class="mt-2" to="/register">SIGN UP</v-btn>
            </v-col>

            <!-- Right Section - Login Form -->
            <v-col cols="12" md="7" class="pa-5">
              <h3 class="font-weight-bold text-center my-2">Welcome to Quickwork!</h3>
              <p class="text-center my-2">Log in to your account to continue</p>
              <v-form fast-fail @submit.prevent>
                <v-text-field label="Email" variant="outlined" required></v-text-field>
                <v-text-field
                  label="Password"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-btn class="mt-3" color="primary" type="submit" block>LOGIN</v-btn>
              </v-form>
              <div class="text-center mt-4">
                <p class="my-4">Or Log In Using</p>
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
