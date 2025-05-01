<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase, formActionDefault } from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'

const router = useRouter()

const userData = ref({
  initials: '',
  email: '',
  fullname: '',
})

const formAction = ref({
  ...formActionDefault,
})

const onLogout = async () => {
  formAction.value = {
    ...formActionDefault,
  }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    return
  }
  formAction.value.formProcess = false
  router.replace('/')
}

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
  <v-container style="height: 300px" fluid>
    <v-row justify="center">
      <v-menu min-width="200px">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="brown" size="large">
              <span class="text-h5">{{ userData.initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="brown">
                <span class="text-h5">{{ userData.initials }}</span>
              </v-avatar>
              <h3>{{ userData.fullname }}</h3>
              <p class="text-caption mt-1">
                {{ userData.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn variant="text" rounded> Edit Account </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                variant="plain"
                rounded
                @click="onLogout"
                :loading="formAction.formProcess"
                :disabled="formAction.formProcess"
              >
                Logout
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-row>
  </v-container>
</template>
