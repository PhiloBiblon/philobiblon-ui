<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel class="cnum">
      <v-expansion-panel-header class="cnum">
        <div>
          <span class="text-subtitle-2 mb-0">ID no. of Witness</span>
          <span class="mb-0 ml-3">{{ index + 1 }}</span>
          <NuxtLink class="ml-1 black--text" :to="url">
            <span>{{ pbid }}</span>
          </NuxtLink>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div>
          <span class="text-subtitle-2">Title(s)</span>
          <span class="ml-3">{{ title }}</span>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
      default: null
    }
  },
  computed: {
    pbid () {
      return this.value.item_pbid
    },
    url () {
      return this.localePath(`/item/${this.value.item}`)
    },
    title () {
      return this.value?.label
    }
  }
}
</script>

<style scoped>
.cnum {
  background-color: rgb(247, 245, 245);
}
</style>
