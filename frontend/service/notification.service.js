const DURATION = 5000
const ERROR_DURATION = 8000

export class NotificationService {
  constructor (notifyFn) {
    this.$notify = notifyFn
  }

  success (message) {
    this.$notify({ title: message, type: 'success', duration: DURATION })
  }

  error (message) {
    this.$notify({ title: message, type: 'error', duration: ERROR_DURATION })
  }

  info (message) {
    this.$notify({ title: message, type: 'info', duration: DURATION })
  }

  notify (message) {
    this.$notify({ title: message, duration: DURATION })
  }
}
