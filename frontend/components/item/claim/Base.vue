<template>
  <v-container class="claim">
    <v-row dense>
      <v-subheader class="claim-header section-header">
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
    table: {
      type: String,
      required: true
    },
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
    this.propertyLabel = await this.$wikibase.getEntityLabel(this.table, this.claim.property, this.$i18n.locale)
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
.section-header {
  color: #616161 !important;
  font-weight: bold !important;
}
.claim-values {
  padding: 0;
  background-color: rgb(247, 245, 245);
}
</style>
