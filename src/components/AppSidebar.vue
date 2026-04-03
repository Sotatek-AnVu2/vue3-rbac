<script setup lang="ts">
import { ref, computed, watch, type Component, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoleStore } from '@/stores/role'
import * as Icons from '@heroicons/vue/24/outline'

const enum DisplayMode {
  Nav = 'nav',
  Skeleton = 'skeleton',
}

const TIMING = {
  roleLeave: 200,
  roleEnter: 400,
  skeletonVisible: 500,
  accordionEnter: 300,
  accordionLeave: 250,
} as const

const DEPTH_PADDING = {
  level1: '1.25rem',
  level2: '2.75rem',
  level3: '4.25rem',
} as const

const route = useRoute()
const router = useRouter()
const store = useRoleStore()

const mobileOpen = defineModel<boolean>('mobileOpen', { default: false })
const isCollapsed = ref(false)
const openIds = ref<Set<string>>(new Set())
const displayMode = ref<DisplayMode>(DisplayMode.Nav)
let skeletonTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => store.currentUser?.id,
  (next, prev) => {
    if (prev === undefined || next === prev) return
    openIds.value = new Set()
    if (skeletonTimer) clearTimeout(skeletonTimer)
    displayMode.value = DisplayMode.Skeleton
    const firstPath = findFirstLeaf(store.listPermission)
    if (firstPath) goTo(firstPath)
    skeletonTimer = setTimeout(() => {
      displayMode.value = DisplayMode.Nav
      skeletonTimer = null
    }, TIMING.roleLeave + TIMING.roleEnter + TIMING.skeletonVisible)
  },
)

const navItems = computed(() =>
  store.listPermission.map((item: any) => ({
    ...item,
    hasChildren: !!item.children?.length,
  })),
)

function findFirstLeaf(items: any[]): string | null {
  for (const item of items) {
    if (!item.children?.length) return item.path
    const found = findFirstLeaf(item.children)
    if (found) return found
  }
  return null
}

function resolveIcon(name?: string): Component {
  const map = Icons as Record<string, Component>
  return markRaw(name && map[name] ? map[name] : Icons.Bars3Icon)
}

function toggle(id: string) {
  const ids = new Set(openIds.value)
  ids.has(id) ? ids.delete(id) : ids.add(id)
  openIds.value = ids
}

const goTo = (path: string) => router.push(path)
const isActive = (path: string) => route.path === path

function hasActiveDescendant(item: any): boolean {
  return (item.children ?? []).some(
    (child: any) => isActive(child.path) || (child.children ?? []).some((gc: any) => isActive(gc.path)),
  )
}

function isRowActive(item: any): boolean {
  if (item.children?.length) return !openIds.value.has(item.id) && hasActiveDescendant(item)
  return isActive(item.path)
}

function onEnter(el: Element, done: () => void) {
  const h = el as HTMLElement
  h.style.overflow = 'hidden'
  h.style.height = '0px'
  void h.offsetHeight
  h.style.transition = `height ${TIMING.accordionEnter}ms cubic-bezier(0.4,0,0.2,1)`
  h.style.height = `${h.scrollHeight}px`
  const finish = () => { h.style.cssText = ''; done() }
  h.addEventListener('transitionend', finish, { once: true })
  setTimeout(finish, TIMING.accordionEnter + 50)
}

function onLeave(el: Element, done: () => void) {
  const h = el as HTMLElement
  h.style.overflow = 'hidden'
  h.style.height = `${h.scrollHeight}px`
  void h.offsetHeight
  h.style.transition = `height ${TIMING.accordionLeave}ms cubic-bezier(0.4,0,0.2,1)`
  h.style.height = '0px'
  const finish = () => { h.style.cssText = ''; done() }
  h.addEventListener('transitionend', finish, { once: true })
  setTimeout(finish, TIMING.accordionLeave + 50)
}

function onSectionEnter(el: Element, done: () => void) {
  const h = el as HTMLElement
  h.style.opacity = '0'
  h.style.transform = 'translateX(-24px)'
  void h.offsetHeight
  h.style.transition = `opacity ${TIMING.roleEnter}ms ease-out, transform ${TIMING.roleEnter}ms ease-out`
  h.style.opacity = '1'
  h.style.transform = 'translateX(0)'
  setTimeout(() => { h.style.cssText = ''; done() }, TIMING.roleEnter)
}

function onSectionLeave(el: Element, done: () => void) {
  const h = el as HTMLElement
  void h.offsetHeight
  h.style.transition = `opacity ${TIMING.roleLeave}ms ease-in, transform ${TIMING.roleLeave}ms ease-in`
  h.style.opacity = '0'
  h.style.transform = 'translateX(-24px)'
  setTimeout(() => { h.style.cssText = ''; done() }, TIMING.roleLeave)
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 md:hidden" @click="mobileOpen = false" />

  <aside
    class="h-[calc(100vh-64px)] bg-primary-dark text-text-muted transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] max-md:fixed max-md:left-0 max-md:top-16 max-md:z-50 max-md:w-[260px]"
    :class="[
      isCollapsed && !mobileOpen
        ? 'md:min-w-16 md:w-16 md:overflow-visible'
        : 'overflow-y-auto overflow-x-hidden md:min-w-[260px] md:w-[260px]',
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

    <nav v-if="!isCollapsed || mobileOpen" class="py-2">
      <Transition :css="false" mode="out-in" @enter="onSectionEnter" @leave="onSectionLeave">

        <ul v-if="displayMode === DisplayMode.Skeleton" key="skeleton" class="animate-pulse m-0 list-none px-3">
          <li v-for="i in 5" :key="i" class="flex items-center gap-3 px-2 py-3">
            <span class="block h-5 w-5 shrink-0 rounded bg-white/10" />
            <span class="block h-3 w-[90%] rounded bg-white/10" />
          </li>
        </ul>

        <ul v-else key="nav" class="m-0 list-none p-0">
          <li v-for="item in navItems" :key="item.id">

            <div
              class="flex cursor-pointer items-center gap-3 py-2.5 pr-5 text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:bg-white/10 hover:text-text-inverse"
              :class="isRowActive(item) ? 'bg-white/8 text-text-inverse' : ''"
              :style="{ paddingLeft: DEPTH_PADDING.level1 }"
              @click="item.hasChildren ? toggle(item.id) : goTo(item.path)"
            >
              <component :is="resolveIcon(item.icon)" class="h-5 w-5 shrink-0" />
              <span class="flex-1 truncate">{{ item.title }}</span>
              <Icons.ChevronDownIcon
                v-if="item.hasChildren"
                class="h-4 w-4 shrink-0 opacity-60 transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="{ 'rotate-180': openIds.has(item.id) }"
              />
            </div>

            <Transition :css="false" @enter="onEnter" @leave="onLeave">
              <ul v-if="item.hasChildren && openIds.has(item.id)" class="m-0 list-none p-0">
                <li v-for="child in item.children" :key="child.id">

                  <div
                    class="flex cursor-pointer items-center gap-3 py-2.5 pr-5 text-[13px] text-text-light whitespace-nowrap transition-colors duration-150 hover:bg-white/10 hover:text-text-inverse"
                    :class="isRowActive(child) ? 'bg-white/8 text-text-inverse' : ''"
                    :style="{ paddingLeft: DEPTH_PADDING.level2 }"
                    @click="child.children?.length ? toggle(child.id) : goTo(child.path)"
                  >
                    <span class="flex-1 truncate">{{ child.title }}</span>
                    <Icons.ChevronDownIcon
                      v-if="child.children?.length"
                      class="h-4 w-4 shrink-0 opacity-60 transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                      :class="{ 'rotate-180': openIds.has(child.id) }"
                    />
                  </div>

                  <Transition :css="false" @enter="onEnter" @leave="onLeave">
                    <ul v-if="child.children?.length && openIds.has(child.id)" class="m-0 list-none p-0">
                      <li v-for="gc in child.children" :key="gc.id">

                        <div
                          class="flex cursor-pointer items-center py-2.5 pr-5 text-xs text-text-light whitespace-nowrap transition-colors duration-150 hover:bg-white/10 hover:text-text-inverse"
                          :class="isActive(gc.path) ? 'bg-white/8 text-text-inverse' : ''"
                          :style="{ paddingLeft: DEPTH_PADDING.level3 }"
                          @click="goTo(gc.path)"
                        >
                          <span class="truncate">{{ gc.title }}</span>
                        </div>

                      </li>
                    </ul>
                  </Transition>

                </li>
              </ul>
            </Transition>

          </li>
        </ul>

      </Transition>
    </nav>

    <nav v-else class="py-2">
      <ul v-if="displayMode === DisplayMode.Skeleton" class="animate-pulse m-0 list-none p-0">
        <li v-for="i in 4" :key="i" class="flex justify-center py-3">
          <span class="block h-5 w-5 rounded bg-white/10" />
        </li>
      </ul>

      <ul v-else class="m-0 list-none p-0">
        <li v-for="item in navItems" :key="item.id" class="group/nav relative">

          <div
            class="flex cursor-pointer justify-center py-2.5 transition-colors duration-200 hover:bg-white/10 hover:text-text-inverse"
            :class="isRowActive(item) ? 'bg-white/8 text-text-inverse' : ''"
            @click="!item.hasChildren && goTo(item.path)"
          >
            <component :is="resolveIcon(item.icon)" class="h-5 w-5" />
          </div>

          <div class="pointer-events-none absolute left-full top-0 z-[100] -mt-3 pt-3 pb-3 opacity-0 transition-opacity duration-200 ease-out group-hover/nav:pointer-events-auto group-hover/nav:opacity-100">
            <div class="ml-2 min-w-[200px] -translate-x-2 rounded-lg bg-[#1e293b] py-1 shadow-[0_8px_32px_rgb(0_0_0/40%)] transition-transform duration-200 ease-out group-hover/nav:translate-x-0">

              <template v-if="!item.hasChildren">
                <div
                  class="cursor-pointer px-4 py-2.5 text-[13px] font-semibold text-text-inverse transition-colors hover:bg-white/8"
                  @click="goTo(item.path)"
                >{{ item.title }}</div>
              </template>

              <template v-else>
                <div v-for="child in item.children" :key="child.id">

                  <div
                    v-if="!child.children?.length"
                    class="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/8 hover:text-text-inverse"
                    :class="isActive(child.path) ? 'text-text-inverse font-medium' : 'text-text-light'"
                    @click="goTo(child.path)"
                  >{{ child.title }}</div>

                  <div v-else class="group/child relative">
                    <div
                      class="flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/8 hover:text-text-inverse"
                      :class="(child.children ?? []).some((gc: any) => isActive(gc.path)) ? 'text-text-inverse font-medium' : 'text-text-light'"
                    >
                      {{ child.title }}
                      <Icons.ChevronRightIcon class="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </div>

                    <div class="pointer-events-none absolute left-full top-0 z-[110] -mt-3 pt-3 pb-3 opacity-0 transition-opacity duration-200 ease-out group-hover/child:pointer-events-auto group-hover/child:opacity-100">
                      <div class="ml-1 min-w-[160px] -translate-x-2 rounded-lg bg-[#1e293b] py-1 shadow-[0_8px_32px_rgb(0_0_0/40%)] transition-transform duration-200 ease-out group-hover/child:translate-x-0">
                        <div
                          v-for="gc in child.children"
                          :key="gc.id"
                          class="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/8 hover:text-text-inverse"
                          :class="isActive(gc.path) ? 'bg-white/10 text-text-inverse font-medium' : 'text-text-light'"
                          @click="goTo(gc.path)"
                        >{{ gc.title }}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </template>

            </div>
          </div>
        </li>
      </ul>
    </nav>

  </aside>
</template>

