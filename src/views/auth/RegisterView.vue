<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row class="d-flex justify-center f">
        <v-col cols="12" md="6">
          <v-card
            style="background: linear-gradient(180deg, #4facfe, #00f2fe)"
            class="mx-auto rounded-lg"
            prepend-icon="mdi mdi-account-box-plus-outline"
            subtitle="Sign up"
            elevation="24"
          >
            <template v-slot:title>
              <span class="font-weight-black font-Montserrat">Register to QuickWork</span>
            </template>

            <v-divider></v-divider>
            <v-card-text class="pt-4">
              <v-form fast-fail @submit.prevent>
                <v-text-field label="First Name" variant="outlined"></v-text-field>
                <v-text-field label="Last Name" variant="outlined"></v-text-field>
                <v-text-field label="Email" variant="outlined"></v-text-field>
                <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

                <v-text-field
                  label="Password Confirmation"
                  helper-text="Please re-enter your password"
                  type="password"
                  variant="outlined"
                ></v-text-field>

                <v-btn class="mt-2" type="submit" prepend-icon="mdi mdi-account-plus-outline" block>Submit</v-btn>

                <v-divider class="my-5"></v-divider>

                <h5 class="text-center">
                  Already have an account?
                  <Router-link to="/login">Click Here to Login</Router-link>
                </h5>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
