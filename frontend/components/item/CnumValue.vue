<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <span class="text-subtitle-2 red--text mb-0">ID no. of Witness</span>
          <span class="red--text mb-0 ml-3">{{ index + 1 }}</span>
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
      return this.value.item_cnum_pbid
    },
    url () {
      return this.localePath(`/item/${this.value.item_cnum.value}`)
    },
    title () {
      return this.value?.item_cnum?.label
    }
  }
}
</script>
