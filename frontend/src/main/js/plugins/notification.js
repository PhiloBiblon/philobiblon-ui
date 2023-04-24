import { NotificationService } from '~/service/notification.service'

export default ({ app: { $toast } }, inject) => {
  const service = new NotificationService($toast)

  inject('notification', service)
}
