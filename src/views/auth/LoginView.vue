<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <br />
        <br />
        <br />
        <br />
        <v-row class="d-flex justify-center">
          <v-col cols="12" md="6">
            <v-card
              class="mx-auto rounded-lg"
              style="background: linear-gradient(180deg, #4facfe, #00f2fe)"
              prepend-icon="mdi mdi-login"
              subtitle="Login"
              elevation="24"
            >
              <template v-slot:title>
                <span class="font-weight-black">Welcome to QuickWork</span>
              </template>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-form fast-fail @submit.prevent>
                  <v-text-field label="Email" variant="outlined"></v-text-field>

                  <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

                  <v-btn class="mt-2" type="submit" prepend-icon="mdi mdi-login-variant" block
                    >LOGIN</v-btn
                  >
                </v-form>
                <v-divider class="my-5"></v-divider>

                <h5 class="text-center">
                  Don't have an account?
                  <Router-link to="/register">Click Here to Register</Router-link>
                </h5>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
