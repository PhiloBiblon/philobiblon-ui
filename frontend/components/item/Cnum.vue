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
          <span class="ml-3">
            <item-util-view-text-lang :value="label" />
          </span>
          <item-claims :table="tableid" :claims="item?.claims" />
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

  data () {
    return {
      item: null,
      tableid: null
    }
  },

  computed: {
    pbid () {
      return this.value.item_pbid
    },
    url () {
      return this.localePath(`/item/${this.value.item}`)
    }
  },

  async mounted () {
    if (this.value.item) {
      await this.getEntity()
    }
  },

  methods: {
    async getEntity () {
      try {
        await this.$wikibase
          .getEntity(this.value.item, this.$i18n.locale)
          .then((entity) => {
            this.tableid = this.$wikibase.getRelatedTable(entity)
            this.item = entity
            this.label = this.$wikibase.getValueByLang(this.item.labels, this.$i18n.locale)
          })
      } catch (err) {
        this.$notification.error(err)
      }
    }
  }
}
</script>

<style scoped>
.cnum {
  background-color: rgb(247, 245, 245);
}
</style>
