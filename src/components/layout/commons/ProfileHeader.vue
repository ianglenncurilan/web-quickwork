<script setup>

import { onMounted, ref } from 'vue'
import { supabase} from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})


const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error fetching user:', error)
      return
    }

    if (data && data.user && data.user.user_metadata) {
      const metadata = data.user.user_metadata

      userData.value.email = metadata.email
      userData.value.fullname = metadata.firstname + ' ' + metadata.lastname
      userData.value.initials = getAvatarText(userData.value.fullname)
    }
  } catch (error) {
    console.error('Error in getUser function:', error)
  }
}

onMounted(() => {
  getUser()
})
</script>

<template>
  <v-container style="height: auto" fluid>
    <v-row justify="center">
      <div class="mx-auto text-center">
        <v-avatar color="brown" size="90" class="mb-0">
          <span class="text-h5">{{ userData.initials }}</span>
        </v-avatar>
        <h3>{{ userData.fullname }}</h3>
        <p class="text-caption mt-1">
          {{ userData.email }}
        </p>
      </div>
    </v-row>
  </v-container>
</template>
