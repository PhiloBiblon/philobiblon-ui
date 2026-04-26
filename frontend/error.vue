<template>
  <v-app theme="dark">
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <NuxtLink to="/" @click="handleError">
      Home page
    </NuxtLink>
  </v-app>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})

const pageNotFound = '404 Not Found'
const otherError = 'An error occurred'

useHead({
  title: props.error?.statusCode === 404 ? pageNotFound : otherError
})

function handleError () {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
