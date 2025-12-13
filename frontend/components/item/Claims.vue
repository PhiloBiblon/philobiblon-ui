<template>
  <div>
    <item-claim-base
      v-for="(claim, index) in claims"
      :key="`c-${claim.property}-${index}-${claim.values.length}`"
      :table="table"
      :item="item"
      :claim="claim"
      @delete-claim="deleteClaim"
      @create-claim="addValueToClaim"
    />
    <item-claim-create v-if="isUserLogged" :item="item" @update-claims="updateClaims" />
  </div>
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
    claims: {
      type: Array,
      default: null
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },

  methods: {
    deleteClaim (data) {
      const claims = this.claims
      claims.forEach((value, key) => {
        if (value.property === data.mainsnak.property) {
          if (claims[key].values.length === 1) {
            claims.splice(key, 1)
          } else {
            const index = claims[key].values.findIndex(item => item.id === data.id)
            if (index !== -1) {
              claims[key].values.splice(index, 1)
            }
          }
        }
      })
    },
    updateClaims (data) {
      const claims = this.claims
      const existingClaim = claims.find(claim => claim.property === data.property)

      if (existingClaim) {
        // Filter out duplicates before adding
        const newValues = data.values.filter(newVal =>
          !existingClaim.values.some(existingVal => existingVal.id === newVal.id)
        )
        if (newValues.length > 0) {
          existingClaim.values.push(...newValues)
        }
      } else {
        claims.push(data)
      }
    },
    addValueToClaim (data) {
      // Handle adding a new value to an existing claim
      const existingClaim = this.claims.find(claim => claim.property === data.property)
      if (existingClaim) {
        // Check if this claim already exists to prevent duplicates
        const claimExists = existingClaim.values.some(v => v.id === data.claim.id)
        if (!claimExists) {
          existingClaim.values.push(data.claim)
        }
      }
    }
  }
}
</script>
