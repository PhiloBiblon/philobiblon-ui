
export default async ({ app }) => {
  // if api url defined, get config parameters from api server
  // otherwise, config parameters come from env variables
  if (app.$config.apiBaseUrl) {
    await fetch(`${app.$config.apiBaseUrl}/api/config`)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        Object.entries(data).forEach(([key, value]) => {
          app.$config[key] = value
        })
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(`Server error ${err}`)
      })
  } else {
    // eslint-disable-next-line no-console
    console.log('No API url server configured.')
  }
}
