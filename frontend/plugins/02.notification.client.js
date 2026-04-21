import Notifications, { useNotification } from '@kyvg/vue3-notification'
import { NotificationService } from '~/service/notification.service'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Notifications)
  const { notify } = useNotification()
  const service = new NotificationService(notify)

  return {
    provide: {
      notification: service
    }
  }
})
