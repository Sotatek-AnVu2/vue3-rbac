<script setup lang="ts">
import { ref, computed, type Component, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoleStore } from '@/stores/role'
import * as Icons from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const store = useRoleStore()

const mobileOpen = defineModel<boolean>('mobileOpen', { default: false })

const isCollapsed = ref(false)
const expandedIds = ref<Set<string>>(new Set())

function getIcon(name?: string): Component {
  const map = Icons as Record<string, Component>
  return markRaw(name && map[name] ? map[name] : Icons.Bars3Icon)
}

function toggleItem(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function goTo(path: string) {
  router.push(path)
}

function isCurrentRoute(path: string) {
  return route.path === path
}

function isGroupActive(item: any): boolean {
  if (isCurrentRoute(item.path)) return true
  for (const child of item.children ?? []) {
    if (isCurrentRoute(child.path)) return true
    if ((child.children ?? []).some((gc: any) => isCurrentRoute(gc.path))) return true
  }
  return false
}


const visibleItems = computed(() => {
  const result: any[] = []

  function collect(items: any[], depth: number, parentOpen: boolean) {
    for (const item of items) {
      const hasChildren = !!item.children?.length
      if (parentOpen) result.push({ ...item, depth, hasChildren })
      if (hasChildren) collect(item.children, depth + 1, parentOpen && expandedIds.value.has(item.id))
    }
  }

  collect(store.listPermission, 0, true)
  return result
})

const topLevelItems = computed(() =>
  store.listPermission.map((item: any) => ({
    ...item,
    hasChildren: !!item.children?.length,
  })),
)

function getPaddingLeft(depth: number) {
  return `${1.25 + depth * 1.5}rem`
}
</script>

<template>
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    @click="mobileOpen = false"
  />

  <aside
    class="h-[calc(100vh-64px)] overflow-y-auto bg-primary-dark text-text-muted transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] max-md:fixed max-md:left-0 max-md:top-16 max-md:z-50 max-md:w-[260px]"
    :class="[
      isCollapsed ? 'md:min-w-16 md:w-16 md:overflow-visible' : 'overflow-x-hidden md:min-w-[260px] md:w-[260px]',
      mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
    ]"
  >
    <div
      class="hidden cursor-pointer select-none items-center gap-3 whitespace-nowrap border-b border-white/8 py-3 transition-colors duration-200 hover:bg-white/10 hover:text-text-inverse md:flex"
      :class="isCollapsed ? 'justify-center px-3' : 'px-5'"
      @click="isCollapsed = !isCollapsed"
    >
      <component :is="isCollapsed ? Icons.ChevronDoubleRightIcon : Icons.ChevronDoubleLeftIcon" class="h-5 w-5" />
    </div>

    <!-- expanded: full tree -->
    <nav v-if="!isCollapsed" class="py-2">
      <ul class="m-0 list-none p-0">
        <li v-for="item in visibleItems" :key="item.id">
          <div
            class="flex cursor-pointer items-center gap-3 py-2.5 whitespace-nowrap transition-all duration-200 hover:bg-white/10 hover:text-text-inverse"
            :class="[
              item.depth === 0 ? 'text-sm font-medium' : 'text-[13px] text-text-light',
              isCurrentRoute(item.path) ? 'bg-white/8 text-text-inverse' : '',
            ]"
            :style="{ paddingLeft: getPaddingLeft(item.depth), paddingRight: '1.25rem' }"
            @click="item.hasChildren ? toggleItem(item.id) : goTo(item.path)"
          >
            <component v-if="item.depth === 0" :is="getIcon(item.icon)" class="h-5 w-5" />
            <span class="flex-1 truncate">{{ item.title }}</span>
            <Icons.ChevronDownIcon
              v-if="item.hasChildren"
              class="h-4 w-4 opacity-60 transition-transform duration-200"
              :class="{ 'rotate-180': expandedIds.has(item.id) }"
            />
          </div>
        </li>
      </ul>
    </nav>

    <nav v-else class="py-2">
      <ul class="m-0 list-none p-0">
        <li v-for="item in topLevelItems" :key="item.id" class="group relative">
          <div
            class="flex cursor-pointer items-center gap-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:bg-white/10 hover:text-text-inverse md:justify-center md:!px-0"
            :class="isGroupActive(item) ? 'bg-white/8 text-text-inverse' : ''"
            @click="!item.hasChildren && goTo(item.path)"
          >
            <component :is="getIcon(item.icon)" class="h-5 w-5" />
            <span class="flex-1 truncate md:hidden">{{ item.title }}</span>
          </div>

          <div
            class="absolute left-full top-0 z-[100] ml-1 hidden min-w-[180px] -translate-x-1.5 rounded-lg bg-[#1e293b] py-1.5 opacity-0 shadow-[0_8px_24px_rgb(0_0_0/35%)] transition-all duration-200 pointer-events-none md:block group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto"
          >
            <div
              class="cursor-pointer px-4 py-2 text-[13px] font-semibold text-text-inverse"
              @click="goTo(item.path)"
            >
              {{ item.title }}
            </div>

            <template v-if="item.hasChildren">
              <template v-for="child in item.children" :key="child.id">
                <div
                  class="cursor-pointer whitespace-nowrap px-4 py-[7px] text-[13px] text-text-light transition-colors duration-150 hover:bg-white/8 hover:text-text-inverse"
                  :class="{ 'bg-white/8 !text-text-inverse font-semibold': isCurrentRoute(child.path) }"
                  @click="goTo(child.path)"
                >
                  {{ child.title }}
                </div>
                <div
                  v-for="grandchild in child.children ?? []"
                  :key="grandchild.id"
                  class="cursor-pointer whitespace-nowrap py-[7px] pl-7 pr-4 text-xs text-text-light transition-colors duration-150 hover:bg-white/8 hover:text-text-inverse"
                  :class="{ 'bg-white/8 !text-text-inverse font-semibold': isCurrentRoute(grandchild.path) }"
                  @click="goTo(grandchild.path)"
                >
                  {{ grandchild.title }}
                </div>
              </template>
            </template>
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>
