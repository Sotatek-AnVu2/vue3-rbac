import { ref } from 'vue'
import { defineStore } from 'pinia'
import { mockUserData } from '@/mocks/roleList'
import type { User } from '@/types/User'
import { DEBOUNCE_TIME } from '@/constants/common'


export const useRoleStore = defineStore('role', () => {
  const userList = ref<User[]>([])
  const loading = ref(false)

  function handleGetUserSuccess(payload: User[]) {
    userList.value = payload
    loading.value = false
  }

  async function getUserList() {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_TIME))
      handleGetUserSuccess(mockUserData as User[])
    } catch {
      loading.value = false
    }
  }
  return { userList, loading, getUserList }
})

export default null
