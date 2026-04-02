<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex flex-col min-h-screen bg-bg-base">
    <AppHeader v-model:sidebarOpen="sidebarOpen" />

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar v-model:mobileOpen="sidebarOpen" />

      <main class="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)]">
        <router-view />
      </main>
    </div>
  </div>
</template>
