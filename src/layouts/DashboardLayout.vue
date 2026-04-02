<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-bg-base">
    <AppHeader />

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar />

      <main class="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)]">
        <router-view />
      </main>
    </div>
  </div>
</template>
