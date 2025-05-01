<script setup>
import { ref, onMounted, watch } from 'vue'
import NotificationComponent from '@/components/layout/commons/NotificationComponent.vue'

// Storage key for notifications
const STORAGE_KEY = 'notifications'

// Notification state
const notifications = ref([])
const notificationCount = ref(0)
const isNotificationDrawerOpen = ref(false)

// Load notifications from localStorage
const loadNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    notifications.value = Array.isArray(parsed) ? parsed : []
    updateNotificationCount()
  } catch (err) {
    console.error('Failed to load notifications from localStorage:', err)
    notifications.value = []
  }
}

// Save notifications to localStorage
const saveNotificationsToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
}

// Add a new notification
const addNotification = (notification) => {
  // Add the notification to the beginning of the array
  notifications.value.unshift({
    id: Date.now(),
    read: false,
    timestamp: new Date().toISOString(),
    ...notification,
  })

  // Save to storage
  saveNotificationsToStorage()
  updateNotificationCount()
}

// Dismiss a notification
const dismissNotification = (id) => {
  const index = notifications.value.findIndex((notif) => notif.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    saveNotificationsToStorage()
    updateNotificationCount()
  }
}

// Mark a notification as read
const markAsRead = (id) => {
  const notification = notifications.value.find((notif) => notif.id === id)
  if (notification) {
    notification.read = true
    saveNotificationsToStorage()
    updateNotificationCount()
  }
}

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
  saveNotificationsToStorage()
  updateNotificationCount()
}

// View application details
const viewApplication = (applicationId) => {
  // Mark the notification as read
  const notification = notifications.value.find((notif) => notif.applicationId === applicationId)

  if (notification) {
    markAsRead(notification.id)
  }

  // Close the notification drawer
  isNotificationDrawerOpen.value = false

  // Here you would typically navigate to the application detail page
  // router.push(`/applications/${applicationId}`);

  // For now, just inform the user via console
  console.log(`Viewing application: ${applicationId}`)
}

// Update the notification count (unread notifications)
const updateNotificationCount = () => {
  notificationCount.value = notifications.value.filter((notif) => !notif.read).length
}

// Toggle notification drawer
const toggleNotificationDrawer = () => {
  isNotificationDrawerOpen.value = !isNotificationDrawerOpen.value
}

// Watch for changes in notifications and update count
watch(
  notifications,
  () => {
    updateNotificationCount()
  },
  { deep: true },
)

// Add application notification
const addApplicationNotification = (jobData, applicantData, applicationId) => {
  addNotification({
    type: 'application',
    jobId: jobData.id,
    jobTitle: jobData.title,
    applicant: {
      fullname: `${applicantData.firstName} ${applicantData.lastName}`,
      email: applicantData.email,
    },
    applicationId: applicationId,
  })
}

// Initialize on component mount
onMounted(() => {
  loadNotificationsFromStorage()
})

// Expose methods and data for parent components
defineExpose({
  addApplicationNotification,
  addNotification,
  dismissNotification,
  markAsRead,
  markAllAsRead,
  toggleNotificationDrawer,
  notifications,
  notificationCount,
})
</script>

<template>
  <div class="notification-manager">
    <!-- Notification Bell Button -->
    <v-badge
      :content="notificationCount"
      :value="notificationCount"
      color="error"
      position="top"
      offset-x="14"
      offset-y="12"
    >
      <v-btn icon variant="text" @click="toggleNotificationDrawer" class="notification-bell">
        <v-icon size="28">mdi-bell-outline</v-icon>
      </v-btn>
    </v-badge>

    <!-- Notification Drawer -->
    <v-navigation-drawer v-model="isNotificationDrawerOpen" location="right" temporary width="400">
      <div class="notification-drawer-header">
        <h3>Notifications</h3>
        <div class="notification-actions">
          <v-btn v-if="notificationCount > 0" variant="text" size="small" @click="markAllAsRead">
            Mark all as read
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <NotificationComponent
        :notifications="notifications"
        @dismiss="dismissNotification"
        @view-application="viewApplication"
      />
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.notification-bell {
  margin-right: 8px;
  position: relative;
}

.notification-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
}

.notification-drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
