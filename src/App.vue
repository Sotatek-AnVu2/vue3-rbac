<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoleStore } from '@/stores/role'

const roleStore = useRoleStore()

onMounted(() => {
  roleStore.fetchAccounts()
})
</script>

<template>
  <router-view />
</template>


