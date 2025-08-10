<template>
  <div>
    <item-claim-base
      v-for="(claim, index) in claimsOrdered"
      :key="`c-${claim.property}-${index}-${claim.values.length}`"
      :item="item"
      :claim="claim"
      @delete-claim="deleteClaim"
    />
    <item-claim-create v-if="isUserLogged" :item="item" @update-claims="updateClaims" />
    <div class="text-h6 mt-6">
      {{ $t('item.identifiers') }}
    </div>
    <item-claim-base
      v-for="(claim, index) in externalIdClaims"
      :key="`c-${claim.property}-${index}-${claim.values.length}`"
      :item="item"
      :claim="claim"
      @delete-claim="deleteClaim"
    />
    <item-claim-create v-if="isUserLogged" :item="item" @update-claims="updateClaims" />
  </div>
</template>

<script>

export default {
  props: {
    table: {
      type: String,
      default: null
    },
    item: {
      type: Object,
      default: null
    },
    claims: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      claimsOrdered: [],
      externalIdClaims: []
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },

  async mounted () {
    if (this.claims) {
      const allClaims = await this.getOrderedClaims(this.table, this.claims)
      for (const claim of allClaims) {
        const entityProperty = await this.$wikibase.getEntity(claim.property, this.$i18n.locale)
        if (entityProperty.datatype === 'external-id') {
          this.externalIdClaims.push(claim)
        } else {
          this.claimsOrdered.push(claim)
        }
      }
    }
  },

  methods: {
    getOrderedQualifiers (qualifiers, qualifiersOrder) {
      if (qualifiersOrder) {
        const qualifiersKeys = Object.keys(qualifiers)
        const fullQualifiersOrder = [...new Set([...qualifiersOrder, ...qualifiersKeys])]
        return fullQualifiersOrder.reduce((result, key) => {
          if (Object.prototype.hasOwnProperty.call(qualifiers, key)) {
            result[key] = qualifiers[key]
          }
          return result
        }, {})
      } else {
        return qualifiers
      }
    },
    getOrderedValues (values, qualifiersOrder) {
      return values.map((value) => {
        if (value.qualifiers) {
          const clonedValue = { ...value }
          clonedValue.qualifiers = this.getOrderedQualifiers(clonedValue.qualifiers, qualifiersOrder)
          return clonedValue
        } else {
          return value
        }
      })
    },
    async getOrderedClaims (table, claims) {
      const claimsKeys = Object.keys(claims)
      let order = await this.$wikibase.getClaimsOrder(table)
      let orderKeys
      if (order) {
        orderKeys = Object.keys(order)
        // remove duplicated keys
        orderKeys = [...new Set([...orderKeys, ...claimsKeys])]
      } else {
        order = claims
        orderKeys = claimsKeys
      }
      return orderKeys.filter(key => Object.prototype.hasOwnProperty.call(claims, key)).map(key => ({
        property: key,
        values: this.getOrderedValues(claims[key], order[key]),
        hasQualifiers: claims[key].some(value => value.qualifiers && Object.keys(value.qualifiers).length),
        qualifiersOrder: order[key]
      }))
    },
    deleteClaim (data) {
      this.deleteClaimInGroup(data, this.claimsOrdered)
      this.deleteClaimInGroup(data, this.externalIdClaims)
    },
    deleteClaimInGroup (data, group) {
      group.forEach((value, key) => {
        if (value.property === data.mainsnak.property) {
          if (group[key].values.length === 1) {
            group.splice(key, 1)
          } else {
            const index = group[key].values.findIndex(item => item.id === data.id)
            if (index !== -1) {
              group[key].values.splice(index, 1)
            }
          }
        }
      })
    },
    updateClaims (data) {
      if (data.datatype === 'external-id') {
        this.updateClaimsInGroup(data, this.externalIdClaims)
      } else {
        this.updateClaimsInGroup(data, this.claimsOrdered)
      }
    },
    updateClaimsInGroup (data, group) {
      const existingClaim = group.find(claim => claim.property === data.property)
      if (existingClaim) {
        existingClaim.values.push(...data.values)
      } else {
        group.push(data)
      }
    }
  }
}
</script>
