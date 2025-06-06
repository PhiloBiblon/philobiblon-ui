<template>
  <v-container class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="key"
      class="even-row"
      dense
    >
      <v-col class="p-0 pr-3 pt-3">
        <div class="d-flex">
          <v-autocomplete
            v-if="claim.datatype === 'wikibase-item'"
            class="ma-0 pa-0"
            :label="$t('item.label')"
            required
            return-object
            :items="items[key]"
            item-text="label"
            item-value="id"
            variant="outlined"
            @change="updateClaimValue($event, key,true)"
            @update:search-input="onInput($event, 'item', key)"
          />
          <item-value-base
            v-else
            :key="`${claim.value}-${key}`"
            class="full-width"
            :label="$t('common.value')"
            :value="claim"
            type="claim"
            mode="creation"
            @on-blur="updateClaimValue($event, key)"
          />
          <div class="d-flex ml-3 mt-1">
            <v-btn v-if="!forCreate" :disabled="!claim?.datavalue?.value" text icon @click.stop="createClaim(key)">
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-btn text icon @click.stop="removeClaim(key)">
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row class="back pr-5 mt-1 add-value" justify="end">
      <a role="button" class="link" @click.stop="addClaim">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ $t("common.add_value") }}</span>
        </div>
      </a>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null
    },
    value: {
      type: Object,
      default: null
    },
    forCreate: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: {},
      claims: {}
    }
  },
  methods: {
    addClaim () {
      const newKey = `P${Date.now()}`
      const { property, datatype } = this.value
      const newClaim = {
        property,
        datatype,
        datavalue: { value: null, default: false }
      }

      this.$set(this.claims, newKey, newClaim)

      if (this.forCreate) {
        this.$emit('update-claims-values', this.claims)
      }
    },
    removeClaim (key) {
      this.$delete(this.claims, key)
      this.$delete(this.items, key)

      if (this.forCreate) {
        this.$emit('update-claims-values', this.claims)
      }
    },
    async onInput (value, type, key) {
      if (value && typeof value === 'string') {
        const searchResults = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale, type)
        if (searchResults && searchResults.length) {
          this.$set(this.items, key, searchResults)
        }
      }
    },
    updateClaimValue (value, key, isObject = false) {
      this.claims[key].datavalue.value = isObject ? value?.id ?? null : value

      if (this.forCreate) {
        this.$emit('update-claims-values', this.claims)
      }
    },
    async createClaim (index) {
      const value = this.claims[index]?.datavalue?.value
      if (!value) {
        return
      }
      const res = await this.$wikibase.getWbEdit().claim.add({
        value,
        id: this.item.id,
        property: this.value.property
      }, this.$store.getters['auth/getRequestConfig'])
      res.success ? this.$notification.success(this.$i18n.t('messages.success.updated')) : this.$i18n.t('messages.error.modification.failed')
      this.updateClaims(res)
      return res
    },
    updateClaims (res) {
      const data = {
        claim: res.claim,
        property: this.value.property
      }
      this.$emit('create-claim', data)
    }
  }
}
</script>
<style scoped>
.full-width {
  width: 100%;
}
.add-value {
  background-color: white;
}
.claim {
  padding: 0;
}
.even-row {
  background-color: rgb(247, 245, 245);
  padding: 3px;
  margin: 5px;
  border-radius: 5px;
}
</style>
