export default async ({ app }) => {
  // if api url defined, get config parameters from api server
  if (app.$config.apiBaseUrl) {
    await fetch(`${app.$config.apiBaseUrl}/api/config`)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        Object.entries(data).forEach(([key, value]) => {
          // replace internal host, only for local development
          app.$config[key] = value.replace('host.docker.internal', 'localhost')
        })
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Server error ${err}`)
      })
  } else {
    // eslint-disable-next-line no-console
    console.error('No API url server configured.')
    // eslint-disable-next-line no-console
    console.error(app.$config)
  }
}
