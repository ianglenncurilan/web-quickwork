<script setup>
import { onMounted, ref } from 'vue'
import { isAuthenticated } from '@/utils/supabase'
import ProfileHeader from '@/components/layout/commons/ProfileHeader.vue'

const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const isLoggedIn = ref(false)

const getLoggedStatus = async () => {
    isLoggedIn.value = await isAuthenticated()

}

onMounted(() => {
  getLoggedStatus()
})
</script>

<template>
  <v-app :theme="theme">
    <!-- App Bar -->
    <v-app-bar style="background-color: #328e6e">
      <v-app-bar-title class="pt-3">
        <img src="@/assets/qkwrk.png" alt="logo" width="75" height="75" />
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
      ></v-btn>

      <!-- Profile Header - Only show when logged in -->

      <ProfileHeader v-if = "isLoggedIn"></ProfileHeader>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot name="content"></slot>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer border app>Quickwork 2025</v-footer>
  </v-app>
</template>
