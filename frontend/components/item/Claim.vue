<template>
  <v-container class="claim">
    <v-row dense>
      <v-subheader class="claim-header grey--text">
        <item-util-view-text-lang :value="propertyLabel" :tooltip="claim.property" />
      </v-subheader>
    </v-row>
    <v-container class="claim-values">
      <item-claim-value
        v-for="(value, index) in claim.values"
        :key="`c-${claim.property}-${index}-${claim.values.length}`"
        :index="index"
        :value="value"
        :key_value="'c-' + claim.property + '-' + index"
        @delete-claim="$emit('delete-claim', $event)"
      />
      <item-claim-create
        v-if="isUserLogged"
        :key="claim.values.length"
        :item="item"
        :claim="claim"
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
    }
  },
  async mounted () {
    await this.$wikibase
      .getEntity(this.claim.property, this.$i18n.locale)
      .then((entity) => {
        this.propertyLabel = this.$wikibase.getValueByLang(
          entity.labels,
          this.$i18n.locale
        )
      })
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
}
</style>
