import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IUser } from '../utils/types'

export const useUserStore = defineStore('user', () => {
  const superUser = ref<IUser['superUser']>(false)
  const canUse = ref<IUser['canUse']>(false)
  const admin = ref<IUser['admin']>(false)
  const concurrentLicensed = ref<IUser['concurrentLicensed']>(false)
  const licensed = ref<IUser['licensed']>(false)

  const login = ref<IUser['login']>('')
  const operatorLogo = ref<IUser['operatorLogo']>('')
  const profiles = ref<IUser['profiles']>([])
  const roles = ref<IUser['roles']>([])
  const title = ref<IUser['title']>('')
  const uuid = ref<IUser['uuid']>('')

  const setUser = (user: IUser) => {
    superUser.value = user.superUser
    canUse.value = user.canUse
    admin.value = user.admin
    concurrentLicensed.value = user.concurrentLicensed
    licensed.value = user.licensed

    login.value = user.login
    operatorLogo.value = user.operatorLogo
    profiles.value = user.profiles
    roles.value = user.roles
    title.value = user.title
    uuid.value = user.uuid
  }

  const resetUser = () => {
    superUser.value = false
    canUse.value = false
    admin.value = false
    concurrentLicensed.value = false
    licensed.value = false

    login.value = ''
    operatorLogo.value = ''
    profiles.value = []
    roles.value = []
    title.value = ''
    uuid.value = ''
  }

  return {
    superUser,
    canUse,
    admin,
    concurrentLicensed,
    licensed,
    login,
    operatorLogo,
    profiles,
    roles,
    title,
    uuid,
    setUser,
    resetUser
  }
})