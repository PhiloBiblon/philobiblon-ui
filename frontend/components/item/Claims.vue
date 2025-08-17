<template>
  <div>
    <item-claim-base
      v-for="(claim, index) in claims"
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
        existingClaim.values.push(...data.values)
      } else {
        claims.push(data)
      }
    }
  }
}
</script>
