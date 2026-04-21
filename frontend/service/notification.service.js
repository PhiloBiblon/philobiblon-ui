const DURATION = 5000

export class NotificationService {
  constructor (notifyFn) {
    this.$notify = notifyFn
  }

  success (message) {
    this.$notify({ title: message, type: 'success', duration: DURATION })
  }

  error (error) {
    if (error.response) {
      if (error.response.status === 401) {
        error = 'Authentication error'
      } else if (error.response.data) {
        if (error.response.data.message) {
          error = error.response.data.message
        } else if (error.response.data.error) {
          error = error.response.data.error
        }
      }
    }
    // eslint-disable-next-line no-console
    console.error(error)
    this.$notify({ title: String(error), type: 'error', duration: DURATION })
  }

  info (message) {
    this.$notify({ title: message, type: 'info', duration: DURATION })
  }

  notify (message) {
    this.$notify({ title: message, duration: DURATION })
  }
}
