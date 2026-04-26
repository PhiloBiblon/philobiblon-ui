<script setup>
definePageMeta({
  middleware: () => navigateTo(useLocalePath()('/wiki/Welcome'))
})
</script>
