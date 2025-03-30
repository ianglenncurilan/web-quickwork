<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <!-- Inner Container (Transparent or Different Background) -->
        <v-container
          fluid
          style="
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            min-height: 100vh;
            padding: 0;
          "
        >
          <v-row class="d-flex justify-center align-center" style="height: 100%">
            <v-col cols="12" md="6">
              <!-- Transparent Login Form -->
              <v-card
                class="mx-auto rounded-lg"
                prepend-icon="mdi mdi-login"
                subtitle="Login"
                elevation="24"
              >
                <template v-slot:title>
                  <span class="font-weight-black">Welcome to QuickWork</span>
                </template>
                <v-divider></v-divider>
                <v-card-text class="pt-4 mt-4 ">
                  <v-form fast-fail @submit.prevent>
                    <v-text-field label="Email" variant="outlined"></v-text-field>
                    <v-text-field
                      label="Password"
                      type="password"
                      variant="outlined"
                    ></v-text-field>
                    <v-container
                      ><v-btn
                        class="mt-2 bg-info"
                        type="submit"
                        prepend-icon="mdi mdi-login-variant"
                        block
                      >
                        LOGIN
                      </v-btn></v-container
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
      </v-container>
    </template>
  </AppLayout>
</template>
