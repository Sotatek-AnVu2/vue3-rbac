import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { mockAccounts, mockNavigationData } from '@/mocks/roleList'
import type { PermissionItem, UserAccount } from '@/types/User'
import { DEBOUNCE_TIME } from '@/constants/common'

export const useRoleStore = defineStore('role', () => {
  const accountList = ref<UserAccount[]>([])
  const currentUser = ref<UserAccount | null>(null)

  const rawData = ref<PermissionItem[]>([])
  const isFetching = ref(false)

  function buildTree(nodes: PermissionItem[], roleId: string): PermissionItem[] {
    return nodes
      .filter(node => node.roles.includes(roleId))
      .map(node => {
        if (node.children) {
          const validChilds = buildTree(node.children, roleId)
          return { ...node, children: validChilds.length > 0 ? validChilds : undefined }
        }
        return node
      })
  }

  const listPermission = computed(() => {
    if (!currentUser.value) return []
    return buildTree(rawData.value, currentUser.value.role)
  })

  async function fetchAccounts() {
    isFetching.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_TIME))
      accountList.value = mockAccounts
      rawData.value = mockNavigationData as PermissionItem[]
      if (accountList.value.length > 0) {
        currentUser.value = accountList.value[0] || null
      }
    } catch {
    } finally {
      isFetching.value = false
    }
  }

  function switchAccount(acc: UserAccount) {
    currentUser.value = acc
  }

  return { accountList, currentUser, isFetching, listPermission, fetchAccounts, switchAccount }
})

export default null
