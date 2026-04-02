<script setup lang="ts">
import { ref, computed, type Component, markRaw } from 'vue'
import { useRoleStore } from '@/stores/role'
import * as OutlineIcons from '@heroicons/vue/24/outline'

const roleStore = useRoleStore()

const BASE_PADDING_REM = 1.25
const DEPTH_INDENT_REM = 1.5

function resolveIcon(iconName?: string): Component {
  if (!iconName) return markRaw(OutlineIcons.Bars3Icon)
  const icon = (OutlineIcons as Record<string, Component>)[iconName]
  return icon ? markRaw(icon) : markRaw(OutlineIcons.Bars3Icon)
}


const listPermissionFlat = computed(() => {
  const result: any[] = []
  function flatten(items: any[], depth = 0) {
    for (const item of items) {
      result.push({ ...item, depth })
      if (item.children) {
        flatten(item.children, depth + 1)
      }
    }
  }
  flatten(roleStore.listPermission)
  return result
})

</script>

<template>
  <aside class="min-w-[260px] h-[calc(100vh-64px)] bg-primary-dark text-text-muted overflow-y-auto">
    <nav class="py-3">
      <ul class="m-0 p-0 list-none">
        <li v-for="item in listPermissionFlat" :key="item.id">
          <div
            class="flex items-center gap-3 py-2.5 cursor-pointer transition-colors border-l-[3px] border-transparent select-none hover:bg-white/10 hover:text-text-inverse"
            :style="{ paddingLeft: `${BASE_PADDING_REM + item.depth * DEPTH_INDENT_REM}rem`, paddingRight: `${BASE_PADDING_REM}rem` }"
            :class="item.depth === 0 ? 'text-sm font-medium' : 'text-[13px] text-text-light'"
          >
            <component v-if="item.depth === 0" :is="resolveIcon(item.icon)" class="w-5 h-5 shrink-0" />
            <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ item.title }}</span>
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>
