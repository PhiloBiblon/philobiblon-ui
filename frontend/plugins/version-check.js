export default function ({$config}) {
  const currentVersion = localStorage.getItem('appVersion') || '';
  if (currentVersion !== $config.version) {
    localStorage.setItem('appVersion', $config.version);
    window.location.reload();
  }
}
