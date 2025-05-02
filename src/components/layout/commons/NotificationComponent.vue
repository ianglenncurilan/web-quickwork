<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['dismiss', 'view-application'])

const notificationsList = ref([])

// Watch for changes in the notifications prop
watch(
  () => props.notifications,
  (newNotifications) => {
    notificationsList.value = newNotifications
  },
  { deep: true },
)

// Initialize notifications from props
onMounted(() => {
  notificationsList.value = props.notifications
})

// Helper function to format time since
const formatTimeSince = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'

  return Math.floor(seconds) + ' seconds ago'
}

// Dismiss a notification
const dismissNotification = (id) => {
  emit('dismiss', id)
}

// View application details
const viewApplication = (applicationId) => {
  emit('view-application', applicationId)
}
</script>

<template>
  <div class="notifications-list">
    <div v-if="notificationsList.length === 0" class="no-notifications">
      <p>No notifications</p>
    </div>

    <div v-else class="notification-items">
      <div
        v-for="notification in notificationsList"
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
      >
        <div class="notification-content">
          <div class="notification-header">
            <div class="notification-type">
              <v-icon v-if="notification.type === 'application'" size="small" color="primary">
                mdi-account-check
              </v-icon>
              <v-icon v-else size="small">mdi-bell</v-icon>
            </div>
            <div class="notification-time">{{ formatTimeSince(notification.timestamp) }}</div>
          </div>

          <div class="notification-body">
            <template v-if="notification.type === 'application'">
              <h4>New Application</h4>
              <p>
                <strong>{{ notification.applicant.fullname }}</strong> applied for
                <strong>{{ notification.jobTitle }}</strong>
              </p>
              <div class="notification-actions">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewApplication(notification.id)"
                >
                  View Application
                </v-btn>
              </div>
            </template>
            <template v-else>
              <p>{{ notification.message }}</p>
            </template>
          </div>
        </div>

        <div class="notification-actions">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="dismissNotification(notification.id)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-list {
  padding: 0;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.notification-item.unread {
  background-color: rgba(25, 118, 210, 0.05);
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.notification-time {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.notification-body h4 {
  margin: 0;
  margin-bottom: 0.5rem;
}

.notification-body p {
  margin: 0;
  margin-bottom: 0.5rem;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
