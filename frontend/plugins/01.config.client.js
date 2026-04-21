export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const publicConfig = config.public

  if (publicConfig.apiBaseUrl) {
    try {
      const response = await fetch(`${publicConfig.apiBaseUrl}/api/config`)
      const data = await response.json()
      Object.entries(data).forEach(([key, value]) => {
        // replace internal host, only for local development
        publicConfig[key] = value.replace('host.docker.internal', 'localhost')
      })
    } catch (err) {
       
      console.error(`Server error ${err}`)
    }
  } else {
     
    console.error('No API url server configured.')
     
    console.error(publicConfig)
  }
})
