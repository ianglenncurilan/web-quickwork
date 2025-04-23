import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import PostView from '@/views/PostView.vue';
import StudentView from '@/views/StudentView.vue';

const routes = [
  {
    path: '/',
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
    name: 'PostView',
    component: PostView,
  },
  {
    path: '/student',
    name: 'StudentView',
    component: StudentView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Ensure the base URL is used
  routes,
});

export default router;
