<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <p class="text-subtitle-2 red--text">
          {{valueToView.title}}
          <a class="link" @click="goToItem(valueToView.item)">
            {{ valueToView.pbid }}
          </a>
        </p>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <p v-if="valueToView.work" class="text-subtitle-2">
          {{ valueToView.work.title }}
          <a class="link" @click="goToItem(valueToView.work.item)">
            {{ valueToView.work.pbid }}
          </a>
        </p>
        <p>
          {{ valueToView.label }}
        </p>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
  },
  data() {
    return {
      imageLink: null,
      valueToView_: {...this.valueToView}
    }
  },
  methods: {
    goToItem(id) {
      this.$router.push(this.localePath('/item/' + id))
    }
  }
}
</script>

<style scoped>
.link {
  color: black;
  text-decoration: underline;
}
</style>
