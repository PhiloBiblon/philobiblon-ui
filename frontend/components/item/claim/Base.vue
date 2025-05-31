<template>
  <v-container class="claim">
    <v-row dense>
      <v-subheader class="claim-header grey--text">
        <item-util-view-text-lang :value="propertyLabel" :tooltip="claim.property" />
      </v-subheader>
    </v-row>
    <v-container class="claim-values">
      <item-claim-values :claim="claim" @delete-claim="$emit('delete-claim', $event)" />
      <item-claim-add-value
        v-if="isUserLogged && isAllowedAddValue"
        :key="claim.values.length"
        :item="item"
        :value="claim?.values[0]?.mainsnak"
        @create-claim="$emit('create-claim', $event)"
      />
    </v-container>
  </v-container>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null
    },
    claim: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      propertyLabel: null
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isAllowedAddValue () {
      return this.claim.property !== this.$wikibase.constructor.PROPERTY_NOTES
    }
  },

  async mounted () {
    const cachedValue = this.$store.state.itemCache.cache[this.getLabelCacheKey()]
    if (cachedValue) {
      this.propertyLabel = cachedValue
    } else {
      await this.$wikibase
        .getEntity(this.claim.property, this.$i18n.locale)
        .then((entity) => {
          this.propertyLabel = this.getLabelFromP34(entity)
          if (!this.propertyLabel) {
            this.propertyLabel = this.$wikibase.getValueByLang(
              entity.labels,
              this.$i18n.locale
            )
          }
          this.$store.commit('itemCache/addEntry', {
            key: this.getLabelCacheKey(),
            value: this.propertyLabel
          })
        })
    }
  },

  methods: {
    getLabelCacheKey () {
      return this.claim.property + '_' + this.$i18n.locale
    },
    getLabelFromP34 (entity) {
      if (entity.claims?.P34) {
        const customLabel = entity.claims.P34
          .map(claim => claim.mainsnak?.datavalue)
          .find(datavalue => datavalue?.value?.language === this.$i18n.locale)
          ?.value?.text
        if (customLabel) {
          return {
            item: this.claim.property,
            value: customLabel,
            language: this.$i18n.locale
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.claim {
  padding: 0;
}
.claim-header {
  font-size: 16px;
}
.claim-values {
  padding: 0;
  background-color: rgb(247, 245, 245);
}
</style>
