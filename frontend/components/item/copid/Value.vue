<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <span class="text-subtitle-2 red--text mb-0">
            ID no. of additional copy of edition {{ index + 1 }}
          </span>
          <NuxtLink class="ml-1 black--text" :to="url">
            <span>{{ pbid }}</span>
          </NuxtLink>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div class="d-flex">
          <span class="text-subtitle-2 title">Title(s)</span>
          <span class="grey--text content">{{ title }}</span>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    index: {
      type: Number,
      default: null
    },
    table: {
      type: String,
      default: null
    },
    value: {
      type: Object,
      default: null
    }
  },
  computed: {
    pbid () {
      return this.value?.pbid
    },
    url () {
      return this.localePath(`/item/${this.value?.item}`)
    },
    title () {
      return this.value?.label
    }
  }
}
</script>

<style scoped>
.title {
  width: 80px !important;
  display: block;
}
.content {
  font-size: 14px;
}
</style>
