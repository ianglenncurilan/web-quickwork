<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container
        class="d-flex align-center justify-center"
      >
        <v-card class="rounded-lg overflow-hidden" elevation="10" max-width="900">
          <v-row no-gutters>
            <!-- Left Section - Login Prompt -->
            <v-col
              cols="12"
              md="5"
              class="d-flex flex-column align-center justify-center"
              style="background-color: #007bff; color: white; padding: 2rem"
            >
              <h3 class="font-weight-bold text-center">Already Signed up?</h3>
              <p class="text-center">
                Log in to your account so you can continue building and editing your onboarding
                flows.
              </p>
              <v-btn color="white" outlined class="mt-2" to="/">LOG IN</v-btn>
            </v-col>

            <!-- Right Section - Sign Up Form -->
            <v-col cols="12" md="7" class="pa-5">
              <h3 class="font-weight-bold text-center">Sign Up for an Account</h3>
              <p class="text-center my-4">
                Let's get you all set up so you can start creating your first onboarding experience.
              </p>
              <v-form fast-fail @submit.prevent>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field label="First Name" variant="outlined" required></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="Last Name" variant="outlined" required></v-text-field>
                  </v-col>
                </v-row>
                <v-text-field label="Email" variant="outlined" required></v-text-field>
                <v-text-field
                  label="Password"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-text-field
                  label="Password Confirmation"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>
                <v-checkbox label="I Accept Terms & Conditions" required></v-checkbox>
                <v-btn color="primary" type="submit" block>SIGN UP</v-btn>
              </v-form>
              <div class="text-center mt-4">
                <p>Or Sign up using</p>
                <v-btn icon class="mx-2"><v-icon color="red">mdi-google</v-icon></v-btn>
                <v-btn icon class="mx-2"><v-icon color="blue">mdi-facebook</v-icon></v-btn>
                <v-btn icon class="mx-2"><v-icon color="light-blue">mdi-twitter</v-icon></v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>
