<script setup>
import { ref } from 'vue'

const theme = ref('light')

function scrollToSection(id) {
  const element = document.getElementById(id)
  if (element) {
    const yOffset = -70 
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
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

        <v-btn class="text-white" @click="scrollToSection('home')"> Home </v-btn>
        <v-btn class="text-white" @click="scrollToSection('feature')"> Feature </v-btn>
        <v-btn class="text-white" @click="scrollToSection('about')"> About </v-btn>
        <v-btn class="text-white" @click="scrollToSection('faqs')"> FAQ </v-btn>

      </v-app-bar>


      <!-- Home Section -->
      <v-container fluid>
        <v-container>
          <v-row align="center" justify="center" id="home" style="height: 100vh">
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
              <p class="subtitle-1 white--text">
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

          <!-- Feature Section -->
          <v-row class="text-center mt-16" justify="center" id="feature">
            <v-col cols="12">
              <h2 class="white--text mb-4 my-5">Features</h2>
              <p class="subtitle-1 white--text mb-10 my-5">
                Discover powerful tools that help students find flexible, skill-matching jobs faster and easier.
              </p>
            </v-col>

            <!-- Card 1 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-account-search</v-icon>
                <h3 class="white--text mt-4 mb-2">Smart Job Matching</h3>
                <p class="white--text">
                  Automatically recommends jobs based on students’ skills, course, and availability.
                </p>
              </v-card>
            </v-col>

            <!-- Card 2 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-calendar-clock</v-icon>
                <h3 class="white--text mt-4 mb-2">Schedule-Based Filters</h3>
                <p class="white--text">
                  Lets students filter jobs that fit around their class schedules and preferred work hours.
                </p>
              </v-card>
            </v-col>

            <!-- Card 3 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-flash</v-icon>
                <h3 class="white--text mt-4 mb-2">Quick Application</h3>
                <p class="white--text">
                  Enables one-click apply using pre-filled profiles and resumes to save time.
                </p>
              </v-card>
            </v-col>

            <!-- Card 4 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-progress-check</v-icon>
                <h3 class="white--text mt-4 mb-2">Application Tracker</h3>
                <p class="white--text">
                  Monitors the status of each job application in a clean dashboard (e.g. “Pending,” “Viewed,” “Hired”).
                </p>
              </v-card>
            </v-col>

            <!-- Card 5 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-handshake</v-icon>
                <h3 class="white--text mt-4 mb-2">Student-Friendly Employers Only</h3>
                <p class="white--text">
                  Connects students only with verified employers who offer flexible, safe, and legal job options.
                </p>
              </v-card>
            </v-col>

            <!-- Card 6 -->
            <v-col cols="12" md="4">
              <v-card
                class="pa-6"
                elevation="4"
                style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
              >
              <v-icon size="40" color="white">mdi-bell-ring</v-icon>
                <h3 class="white--text mt-4 mb-2">Real-Time Job Alerts</h3>
                <p class="white--text">
                  Sends instant notifications when new job postings match a student’s profile, so they never miss an opportunity.
                </p>
              </v-card>
            </v-col>
            <!-- End Section Image -->
            <v-col cols="12" md="5" class="text-center">
              <img src="@/assets/about.jpg" alt="Intern Illustration" style="max-width: 120%; display: block; margin: 0 auto"/>
           </v-col>
          </v-row>

          <!-- About Section -->
          <v-row class="text-center mt-16" justify="center" id="about">
            <v-col cols="12">
              <h2 class="white--text mb-2 my-5">About</h2>
              <p class="subtitle-1 white--text mb-10 my-5">
                QuickWork helps students find flexible part-time jobs that match their skills and schedules, making job hunting fast and easy.
              </p>

    <!-- Card 1 -->
    <v-card
      class="pa-4 mb-4"
      elevation="4"
      style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
    >
      <v-icon size="30" color="white">mdi-target</v-icon>
      <h3 class="white--text mt-2 mb-1">System Purpose</h3>
      <p class="white--text">
        QuickWork is a student-centered job-finding system that connects learners to flexible part-time opportunities.
      </p>
    </v-card>

    <!-- Card 2 -->
    <v-card
      class="pa-4 mb-4"
      elevation="4"
      style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
    >
      <v-icon size="30" color="white">mdi-alert-circle</v-icon>
      <h3 class="white--text mt-2 mb-1">Why It Matters</h3>
      <p class="white--text">
        Many students struggle to find jobs that match their time and skills. QuickWork solves this with intelligent matching.
      </p>
    </v-card>

    <!-- Card 3 -->
    <v-card
      class="pa-4"
      elevation="4"
      style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px"
    >
      <v-icon size="30" color="white">mdi-star-circle</v-icon>
      <h3 class="white--text mt-2 mb-5">What It Offers</h3>
      <p class="white--text">
        Smart matching, schedule-based filters, and alerts—everything a student needs to find the right job quickly.
      </p>
    </v-card>
  </v-col>
</v-row>


           <!-- FAQ section -->
          <v-row class="mt-16" align="center" justify="center" id="faqs">
          <v-col cols="12" md="6">
            <h2 class="white--text my-5">FAQ's</h2>
            <p class="subtitle-1 white--text mb-5">
              The FAQ section helps users find quick answers to common questions, providing clear and concise information to enhance their understanding of the platform's features and benefits.
            </p>
          <v-expansion-panels>

           <!-- Panel 1 -->
          <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
            <v-expansion-panel-title class="white--text">How does QuickWork match jobs to my availability?</v-expansion-panel-title>
            <v-expansion-panel-text class="white--text">
              QuickWork offers schedule-based filters, allowing you to search for jobs that fit your class schedule or preferred work hours. This ensures flexibility in finding the right job.
            </v-expansion-panel-text>
            </v-expansion-panel>
      
      <!-- Panel 2 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text">How does QuickWork track my job applications?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          QuickWork has an application tracker that monitors the status of your job applications. You can easily view whether your application is pending, viewed, or hired.        </v-expansion-panel-text>
      </v-expansion-panel>
      
      <!-- Panel 3 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text">How do I sign up for QuickWork?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          You can sign up by clicking the "Sign up" button on the homepage and filling in your details to create an account.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Panel 4 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text"> Is QuickWork free to use?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          Yes, QuickWork is free for students to use to find and apply for jobs.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Panel 5 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text">How do I find jobs on QuickWork?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          Use the Smart Search feature to find jobs based on your skills, schedule, and preferences.        
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Panel 6 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text">Can I edit my profile after signing up?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          Yes, you can update your profile and resume at any time to reflect your latest skills and experience.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Panel 7 -->
      <v-expansion-panel style="background: linear-gradient(135deg, #328e6e, #a8dcc6); border-radius: 16px; margin-bottom: 10px;">
        <v-expansion-panel-title class="white--text">How do I contact support if I have issues?</v-expansion-panel-title>
        <v-expansion-panel-text class="white--text">
          You can contact support through the "Help" section on the website, where you'll find contact information or a support ticket system.        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-col>

  <!-- Image Column -->
  <v-col cols="12" md="6" class="text-center">
    <img src="@/assets/faq.jpg" alt="Intern Illustration" style="max-width: 100%; border-radius: 16px; margin-left: 10%;" />
  </v-col>
</v-row>
        </v-container>
      </v-container>

      <br /><br /><br /><br />

      <!-- Footer Section -->
      <v-footer color="#328e6e" padless>
        <v-row align="center" justify="center" class="white--text">
          <v-col class="text-center">
            <p>&copy; 2025 Quickwork. All rights reserved.</p>
          </v-col>
        </v-row>
      </v-footer>
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
