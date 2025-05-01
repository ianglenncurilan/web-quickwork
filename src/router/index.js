import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/pages/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import PostView from '@/views/PostView.vue';
import StudentView from '@/views/StudentView.vue';
import AlertNotification from '@/components/layout/commons/AlertNotification.vue';
import ProfileHeader from '@/components/layout/commons/ProfileHeader.vue';
import ApplicationView from '@/views/pages/ApplicationView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/post',
    name: 'post',
    component: PostView,
  },
  {
    path: '/student',
    name: 'student',
    component: StudentView,
  },
  {
    path: '/alert',
    name: 'alert',
    component: AlertNotification,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileHeader,
  },
  {
    path: '/application/:jobID',
    name: 'application',
    component: ApplicationView,
    props: true,
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Ensure the base URL is used
  routes,
});

export default router;
