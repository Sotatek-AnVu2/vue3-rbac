import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: 'content',
          name: 'Content',
          component: () => import('@/pages/content/ContentPage.vue'),
        },
        {
          path: 'content/articles',
          name: 'Articles',
          component: () => import('@/pages/content/ArticlesPage.vue'),
        },
        {
          path: 'content/articles/drafts',
          name: 'Drafts',
          component: () => import('@/pages/content/DraftsPage.vue'),
        },
        {
          path: 'content/articles/published',
          name: 'Published',
          component: () => import('@/pages/content/PublishedPage.vue'),
        },
        {
          path: 'content/media',
          name: 'MediaLibrary',
          component: () => import('@/pages/content/MediaPage.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/pages/settings/SettingsPage.vue'),
        },
        {
          path: 'settings/permissions',
          name: 'Permissions',
          component: () => import('@/pages/settings/PermissionsPage.vue'),
        },
        {
          path: 'settings/logs',
          name: 'AuditLogs',
          component: () => import('@/pages/settings/AuditLogsPage.vue'),
        },
      ],
    },
  ],
})

export default router
