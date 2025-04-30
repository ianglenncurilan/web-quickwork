<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'
import { requiredValidator, emailValidator, passwordValidator } from '@/utils/validators'
import AlertNotification from '@/components/layout/commons/AlertNotification.vue'
import { useRouter } from 'vue-router'
import { supabase, formActionDefault } from '@/utils/supabase.js'

const router = useRouter()
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

function togglePasswordVisibility(field) {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else if (field === 'passwordConfirmation') {
    showPasswordConfirmation.value = !showPasswordConfirmation.value
  }
}

const formDataDefault = ref({
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const formData = ref({
  ...formDataDefault.value,
})

const formAction = ref({
  ...formActionDefault,
})

const refVform = ref(null) // Define the form reference

// Handle form submission
const handleRegister = async () => {
  if (
    !formData.value.firstname ||
    !formData.value.lastname ||
    !formData.value.email ||
    !formData.value.password ||
    !formData.value.password_confirmation
  ) {
    alert('Please fill in all fields.')
    return
  }

  if (formData.value.password !== formData.value.password_confirmation) {
    alert('Passwords do not match.')
    return
  }

  formAction.value = {
    ...formActionDefault,
  }
  formAction.value.formProcess = true

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          firstname: formData.value.firstname,
          lastname: formData.value.lastname,
        },
      },
    })

    if (error) {
      console.error(error)
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
    } else if (data) {
      console.log(data)
      formAction.value.formSuccessMessage = 'Registration successful!'
      router.replace('/login') // Redirect to the login page after successful registration

      Object.assign(formData.value, formDataDefault.value) // Reset formData to default values
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    formAction.value.formErrorMessage = 'An unexpected error occurred.'
  } finally {
    formAction.value.formProcess = false
  }
}
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container class="d-flex align-center justify-center" style="min-height: 80vh">
        <v-card class="rounded-lg overflow-hidden" elevation="10" max-width="900">
          <v-row no-gutters>
            <!-- Left Section - Sign Up Prompt -->
            <v-col

              cols="12"
              md="5"
              class="d-flex flex-column align-center justify-center new-here-section"
            >
              <img
                src="@/assets/qkwrk.png"
                alt="Quickie Logo"
                class="logo"
                width="200px"
                height="200px"
              />

              <h3 class="font-weight-bold text-center">Already Signed up?</h3>
              <p class="text-center">
                Log in to your account so you can continue building and editing your onboarding
                flows.
              </p>
              <v-btn color="white" outlined class="mt-2" to="/login">LOGIN</v-btn>
            </v-col>

            <!-- Right Section - Register Form -->
            <v-col cols="12" md="7" class="pa-5">
              <div class="ribbon-container">
                <h3 class="ribbon-text">Sign Up for an Account</h3>
              </div>
              <br />
              <v-col>
                <AlertNotification
                :formSuccessMessage="formAction.formSuccessMessage"
                :formErrorMessage="formAction.formErrorMessage"
              ></AlertNotification>
              </v-col>
              <v-form ref="refVform" fast-fail @submit.prevent="handleRegister">
                <v-row>
                  <v-col cols="12" md="6" class="mb-1">
                    <v-text-field
                      v-model="formData.firstname"
                      :rules="[requiredValidator]"
                      label="First Name"
                      placeholder="Enter your first name"
                      variant="outlined"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" class="mb-1">
                    <v-text-field
                      v-model="formData.lastname"
                      :rules="[requiredValidator]"
                      label="Last Name"
                      placeholder="Enter your last name"
                      variant="outlined"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-text-field class="mt-1"
                  v-model="formData.email"
                  label="Email"
                  variant="outlined"
                  required
                  :rules="[requiredValidator, emailValidator]"
                ></v-text-field>

                <v-text-field class="mt-2"
                  v-model="formData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  required
                  :rules="[requiredValidator, passwordValidator]"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="togglePasswordVisibility('password')"
                ></v-text-field>

                <v-text-field class="mt-4"
                  v-model="formData.password_confirmation"
                  label="Password Confirmation"
                  :type="showPasswordConfirmation ? 'text' : 'password'"
                  variant="outlined"
                  required
                  :rules="[requiredValidator]"
                  :append-inner-icon="showPasswordConfirmation ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="togglePasswordVisibility('passwordConfirmation')"
                ></v-text-field>

                <div class="d-flex justify-center">
                  <v-btn
                    class="mt-3 btn-fixed-width"
                    color="#00412E"
                    type="submit"
                    block
                    :disabled="formAction.formProcess"
                    :loading="formActionProcess"
                    >Register</v-btn
                  >
                </div>
              </v-form>

              <v-divider class="my-4"></v-divider>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.btn-fixed-width {
  width: 200px;
}

.new-here-section {
  background-color: #328e6e;
  color: white;
  padding: 2rem;
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  background-image: url('@/assets/background-pattern.png'); /* Background image */
  background-size: cover;
  background-position: center;
  text-align: center;
}

.new-here-section h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.new-here-section p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.new-here-section .v-btn {
  font-weight: bold;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.new-here-section .v-btn:hover {
  background-color: white;
  color: #00412e;
}

.ribbon-container {
  position: relative;
  display: flex; /* Use flexbox for centering */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #328e6e; /* Ribbon background color */
  color: white;
  padding: 0.5rem 2rem;
  border-radius: 5px 5px 0 0; /* Rounded top corners */
  text-align: center;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow effect */
  margin: 0 auto; /* Center the ribbon horizontally */
  width: fit-content; /* Adjust width to fit content */
}

.ribbon-container::before,
.ribbon-container::after {
  content: '';
  position: absolute;
  top: 100%; /* Position below the ribbon */
  width: 0;
  height: 0;
  border-style: solid;
}

.ribbon-container::before {
  left: 0;
  border-width: 10px 10px 0 0;
  border-color: #328e6e transparent transparent transparent;
}

.ribbon-container::after {
  right: 0;
  border-width: 10px 0 0 10px;
  border-color: #328e6e transparent transparent transparent;
}

/* Hover and click styles for buttons */
.v-btn {
  transition: all 0.3s ease; /* Smooth transition for hover and click effects */
}

.v-btn:hover {
  transform: scale(1.05); /* Slightly enlarge the button on hover */
  background-color: #00412e; /* Darken the background color */
  color: white; /* Change text color */
}

.v-btn:active {
  transform: scale(0.95); /* Slightly shrink the button on click */
  background-color: #002d1f; /* Darker background color on click */
}
</style>
