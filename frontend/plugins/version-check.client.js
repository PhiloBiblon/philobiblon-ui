export default defineNuxtPlugin(() => {
  const { version } = useRuntimeConfig().public
  const currentVersion = localStorage.getItem('appVersion') || ''
  if (currentVersion !== version) {
    localStorage.setItem('appVersion', version)
    window.location.reload()
  }
})
