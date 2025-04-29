<script setup>
import { ref } from 'vue'

const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <!-- App Bar -->
      <v-app-bar style="background-color: #328e6e">
        <template v-slot:image> </template>

        <v-app-bar-title class="pt-3">
          <img src="@/assets/qkwrk.png" alt="logo" width="75px" height="75px" />
        </v-app-bar-title>

        <v-btn class="text-white" to="/register"> Feature </v-btn>
        <v-btn class="text-white" to="/login"> About </v-btn>
        <v-btn class="text-white" to="/register"> FAQ </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-app-bar>
      

      <!-- Main Content -->
      <v-container fluid>
        <v-container>
          <v-row align="center" justify="center" style="height: 100vh">
            <!-- Left Image -->
           <v-col cols="12" md="6" class="text-center">
             <img src="@/assets/homepic2.jpg" alt="Intern Illustration" style="max-width: 100%; display: block; margin: 0 auto"/>
            </v-col>
            <!-- Right Text Section -->
            <v-col cols="12" md="6" class="text-center">
              <h1 class="display-2 font-weight-bold welcome-section">
                Start Earning from Part-Time Jobs that Fit Your Skills & Time
              </h1>
              <br />
              <p class="subtitle-1 mt-2 white--text">
                Quickwork connects you with flexible job opportunities that match your unique
                abilities and availability. Whether you're a student, a freelancer, or just looking
                for side income, our platform makes job hunting smart, fast, and personalized.
              </p>
              <div class="d-flex justify-center mt-6" style="gap: 16px">
          <!-- Sign up (filled circle) -->
              <v-btn color="#328e6e" class="text-white" rounded style="height: 50px; width: 90px; min-width: 60px" to="/register"> Sign up </v-btn>
          <!-- Login (outlined circle) -->
              <v-btn variant="outlined" color="#328e6e" rounded style="height: 50px; width: 90px; min-width: 60px" to="/login"> Login </v-btn>
            </div>
            </v-col>
          </v-row>

          <!-- Why Choose Section -->
          <v-row class="text-center mt-16" justify="center">
            <v-col cols="12">
              <h2 class="white--text mb-4 my-5">Why Choose QuickWork?</h2>
              <p class="subtitle-1 white--text mb-10 my-5">
                We simplify the job search with intelligent tools designed to help you land the
                right opportunities quickly and efficiently.
              </p>
            </v-col>

            <!-- Card 1 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #67ae6e, #e1eebc); border-radius: 16px"
              >
                <v-icon size="40" color="white">mdi-magnify</v-icon>
                <h3 class="white--text mt-4 mb-2">Smart Search</h3>
                <p class="white--text">
                  Find the perfect workflow templates with our AI-powered search engine that
                  understands your specific needs.
                </p>
              </v-card>
            </v-col>

            <!-- Card 2 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #67ae6e, #e1eebc); border-radius: 16px"
              >
                <v-icon size="40" color="white">mdi-flash</v-icon>
                <h3 class="white--text mt-4 mb-2">Quick Apply</h3>
                <p class="white--text">
                  Implement workflows instantly with our one-click system. No more lengthy setup
                  processes or complicated configurations.
                </p>
              </v-card>
            </v-col>

            <!-- Card 3 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #67ae6e, #e1eebc); border-radius: 16px"
              >
                <v-icon size="40" color="white">mdi-robot</v-icon>
                <h3 class="white--text mt-4 mb-2">AI Personalization</h3>
                <p class="white--text">
                  Our AI learns your preferences and suggests optimizations to make your workflows
                  more efficient and tailored to your style.
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-container>

      <br /><br /><br /><br />
    </v-app>
  </v-responsive>
</template>


<style scoped>
.welcome-section {
  font-size: 3rem;
  font-weight: bold;
  color: #328e6e;
  margin-bottom: 1rem;
}

.v-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.v-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
