<template>
  <div>
    <item-claim
      v-for="(claim, index) in claimsOrdered"
      :key="'c-' + index"
      :claim="claim"
    />
  </div>
</template>

<script>

export default {
  props: {
    table: {
      type: String,
      default: null
    },
    claims: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      claimsOrdered: []
    }
  },

  async mounted () {
    if (this.claims) {
      this.claimsOrdered = await this.getOrderedClaims(this.table, this.claims)
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
      return orderKeys.filter(key => Object.prototype.hasOwnProperty.call(claims, key)).map(key => ({ property: key, values: this.getOrderedValues(claims[key], order[key]) }))
    }
  }
}
</script>
