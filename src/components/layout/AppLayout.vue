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
      <v-app-bar
        color="teal-darken-4"
        image="https://plus.unsplash.com/premium_photo-1675362696408-19eb8ba38823?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      >
        <template v-slot:image>
          <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
        </template>

        <v-app-bar-title>Quickwork</v-app-bar-title>

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