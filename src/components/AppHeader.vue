<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Bars3Icon, UserCircleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useRoleStore } from '@/stores/role'

const sidebarOpen = defineModel<boolean>('sidebarOpen', { default: false })

const roleStore = useRoleStore()
const showUserMenu = ref(false)
const menuContainer = ref<HTMLElement | null>(null)

function toggleMenu() {
  showUserMenu.value = !showUserMenu.value
}

function hideMenu() {
  showUserMenu.value = false
}

function onOutsideClick(e: MouseEvent) {
  if (menuContainer.value && !menuContainer.value.contains(e.target as Node)) {
    hideMenu()
  }
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onUnmounted(() => document.removeEventListener('click', onOutsideClick))
</script>

<template>
  <header class="flex items-center justify-between h-16 px-6 bg-primary text-text-inverse z-50 shrink-0">
    <div class="flex items-center gap-3">
      <button
        class="hidden md:hidden max-md:grid place-items-center w-10 h-10 bg-white/10 text-text-inverse rounded-lg cursor-pointer"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>
      <span class="text-xl font-bold">Vue3 RBAC</span>
    </div>

    <div class="flex items-center">
      <div ref="menuContainer" class="relative">
        <button
          class="flex items-center gap-2 px-3 py-1.5 border-none rounded-lg bg-white/10 text-text-inverse cursor-pointer transition-colors hover:bg-white/20"
          @click="toggleMenu"
        >
          <span class="text-sm font-medium">{{ roleStore.currentUser?.name || 'Guest' }}</span>
          <ChevronDownIcon
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': showUserMenu }"
          />
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 -translate-y-2"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showUserMenu"
            class="absolute top-[calc(100%+8px)] right-0 w-64 max-h-80 overflow-y-auto bg-surface rounded-xl shadow-xl z-50"
          >
            <div v-if="roleStore.isFetching" class="p-4 text-center text-text-light text-sm">
              Loading...
            </div>
            <template v-else>
              <button
                v-for="user in roleStore.accountList"
                :key="user.id"
                class="flex items-center gap-2.5 w-full px-4 py-3 border-none bg-transparent cursor-pointer transition-colors text-left hover:bg-surface-hover last:rounded-b-xl"
                :class="{ 'bg-surface-hover!': roleStore.currentUser?.id === user.id }"
                @click="() => { roleStore.switchAccount(user); hideMenu(); }"
              >
                <UserCircleIcon 
                  class="w-8 h-8 shrink-0 transition-colors"
                  :class="roleStore.currentUser?.id === user.id ? 'text-accent' : 'text-text-muted'"
                />
                <div class="flex flex-col gap-0.5 min-w-0">
                  <span class="text-[0.8125rem] font-medium truncate text-text-main"
                        :class="{ 'text-accent-dark': roleStore.currentUser?.id === user.id }">
                    {{ user.name }}
                  </span>
                  <span class="text-[0.6875rem] text-text-light capitalize">{{ user.role }}</span>
                </div>
              </button>
            </template>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
