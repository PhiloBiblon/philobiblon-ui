<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel class="cnum">
      <v-expansion-panel-header class="cnum">
        <div>
          <span class="mb-0 ml-3">#{{ index + 1 }}</span>
          <NuxtLink class="ml-1 black--text" :to="url">
            <span>{{ pbid }}</span>
          </NuxtLink>
          <span class="ml-1">
            <item-util-view-text-lang :value="label" />
          </span>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div>
          <item-claims :table="tableid" :claims="claims" />
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    table: {
      type: String,
      default: null
    },
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
      label: null,
      item: null,
      tableid: null,
      claims: null
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
          .then(async (entity) => {
            this.tableid = this.$wikibase.getRelatedTable(entity)
            this.item = entity
            this.claims = await this.$wikibase.getOrderedClaims(this.tableid, entity.claims)
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
