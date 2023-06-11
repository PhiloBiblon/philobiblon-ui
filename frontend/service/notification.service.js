const DURATION = 5000
const TOAST_COMMON_PARAMS = {
  duration: DURATION,
  keepOnHover: true,
  className: 'toasted-font'
}

export class NotificationService {
  constructor (toast) {
    this.$toast = toast
  }

  success (message) {
    this.$toast.success(message, { ...TOAST_COMMON_PARAMS, icon: 'check_circle' })
  }

  error (error) {
    if (error.response) {
      // handling error response from server
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
    this.$toast.error(error, { ...TOAST_COMMON_PARAMS, icon: 'error' })
  }

  info (message) {
    this.$toast.info(message, { ...TOAST_COMMON_PARAMS, icon: 'info' })
  }

  notify (message) {
    this.$toast.show(message, TOAST_COMMON_PARAMS)
  }
}
