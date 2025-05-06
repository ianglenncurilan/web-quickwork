<script setup>
import { ref } from 'vue'
const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <v-app :theme="theme">
    <!-- App Bar -->
    <v-app-bar style="background-color: #328e6e">
      <v-app-bar-title class="pt-3">
        <img src="@/assets/qkwrk.png" alt="logo" width="75" height="75" />
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
      ></v-btn>
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
