<script setup>
import { ref, watch, onMounted } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss', 'viewApplication'])

const notificationsList = ref([])

// Watch for changes in the notifications prop
watch(() => props.notifications, (newNotifications) => {
  notificationsList.value = newNotifications
}, { deep: true })

// Initialize notifications from props
onMounted(() => {
  notificationsList.value = props.notifications
})

// Helper function to format time since
const formatTimeSince = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"

  return Math.floor(seconds) + " seconds ago"
}

// Dismiss a notification
const dismissNotification = (id) => {
  emit('dismiss', id)
}

// View application details
const viewApplication = (applicationId) => {
  emit('viewApplication', applicationId)
}
</script>

<template>
  <div class="notifications-container">
    <div v-if="notificationsList.length === 0" class="no-notifications">
      <div class="no-notifications-icon">
        <v-icon size="40" color="grey">mdi-bell-outline</v-icon>
      </div>
      <p>No new notifications</p>
    </div>

    <div v-else class="notifications-list">
      <div
        v-for="notification in notificationsList"
        :key="notification.id"
        class="notification-item"
        :class="{ 'notification-unread': !notification.read }"
      >
        <div class="notification-dot" v-if="!notification.read"></div>

        <div class="notification-avatar" v-if="notification.applicant && notification.applicant.fullname">
          <div class="avatar">{{ notification.applicant.fullname.substring(0, 2).toUpperCase() }}</div>
        </div>
        <div class="notification-avatar" v-else>
          <div class="avatar">AP</div>
        </div>

        <div class="notification-content">
          <div class="notification-header">
            <h4>New Application</h4>
            <span class="notification-time">{{ formatTimeSince(notification.timestamp) }}</span>
          </div>

          <p class="notification-text">
            <strong>{{ notification.applicant?.fullname || 'Someone' }}</strong>
            applied for <strong>{{ notification.jobTitle }}</strong>
          </p>

          <div class="notification-actions">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="viewApplication(notification.applicationId)"
            >
              View Details
            </v-btn>
            <v-btn
              variant="text"
              color="grey"
              size="small"
              @click="dismissNotification(notification.id)"
            >
              Dismiss
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-container {
  max-height: 500px;
  overflow-y: auto;
  width: 100%;
}

.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #95a5a6;
  text-align: center;
}

.no-notifications-icon {
  margin-bottom: 16px;
}

.notifications-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  transition: background-color 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-unread {
  background-color: #f0f7ff;
}

.notification-dot {
  position: absolute;
  top: 18px;
  left: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.notification-avatar {
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #95a5a6;
}

.notification-text {
  margin: 0 0 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
}
</style>
