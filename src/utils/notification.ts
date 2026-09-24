import { openNotification, type OpenNotificationOptions } from '@minitwiks/nsmp-vue-components/utils'

type NotificationOptions = Omit<OpenNotificationOptions, 'placement' | 'duration'>
type SuccessOptions = Omit<NotificationOptions, 'title' | 'type'>

export const notify = (options: NotificationOptions) => openNotification({
  placement: 'topRight',
  duration: 5,
  ...options,
})

export const notifySuccess = (title: string, options: SuccessOptions = {}) =>
  notify({ title, type: 'success', ...options })

export const notifyError = (title: string, error: unknown, options: SuccessOptions = {}) =>
  notify({
    title,
    description: error instanceof Error ? error.message : String(error),
    type: 'error',
    ...options
  })

export const notifyWarning = (title: string, error: unknown, options: SuccessOptions = {}) =>
  notify({
    title,
    description: error instanceof Error ? error.message : String(error),
    type: 'warning',
    ...options
  })