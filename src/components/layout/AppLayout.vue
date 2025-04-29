<script setup>
import { onMounted, ref } from 'vue'
import { isAuthenticated} from '@/utils/supabase'

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
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <!-- App Bar -->
      <v-app-bar style="background-color: #328E6E;"
      >
        <template v-slot:image>
        </template>

        <v-app-bar-title class="pt-3">
         <img src="@/assets/qkwrk.png" alt="logo"
         width="75px" height="75px">


        </v-app-bar-title>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>

        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          slim
          @click="toggleTheme"
        ></v-btn>

        <ProfileHeader v-if="isLoggedIn"> </ProfileHeader>
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
  </v-responsive>
</template>
