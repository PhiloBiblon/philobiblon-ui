<template>
  <div v-if="value">
    <span v-if="value.type==='text'">
      {{ value.value }}
    </span>
    <span v-else-if="value.type==='text-lang'">
      {{ value.value }} <sup>{{ value.language }}</sup>
    </span>
    <span v-else-if="value.type==='time'">
      {{ value.value }} <sup>{{ value.calendar }}</sup>
    </span>
    <span v-else-if="value.type==='url'">
      <a :href="value.value" target="_blank">{{ value.value }}</a> <v-icon>mdi-link</v-icon>
    </span>
    <span v-else-if="value.type==='item'">
      <NuxtLink :to="getUrlFromPBID(value.item)">{{ value.value }}</NuxtLink>
    </span>
    <span v-else-if="value.type==='external-id'">
      <a :href="value.url" target="_blank">{{ value.value }}</a>
    </span>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-else-if="value.type==='html'" v-html="value.value" />
    <span v-else-if="value.type==='image'">
      <a :href="value.descriptionurl" target="_blank"><v-img width="300" :src="value.url" /></a>
    </span>
    <span v-else>
      {{ value }}
    </span>
  </div>
</template>

<script>
export default {

  props: {
    value: {
      type: Object,
      default: null
    }
  },

  methods: {
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    }
  }
}
</script>
