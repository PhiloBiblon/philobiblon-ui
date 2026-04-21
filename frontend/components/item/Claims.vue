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

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  table: { type: String, required: true },
  item: { type: Object, default: null },
  claims: { type: Array, default: null }
})

const authStore = useAuthStore()
const isUserLogged = computed(() => authStore.isLogged)

function deleteClaim (data) {
  const claims = props.claims
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
}

function updateClaims (data) {
  const claims = props.claims
  const existingClaim = claims.find(claim => claim.property === data.property)

  if (existingClaim) {
    const newValues = data.values.filter(newVal =>
      !existingClaim.values.some(existingVal => existingVal.id === newVal.id)
    )
    if (newValues.length > 0) {
      existingClaim.values.push(...newValues)
    }
  } else {
    claims.push(data)
  }
}

function addValueToClaim (data) {
  const existingClaim = props.claims.find(claim => claim.property === data.property)
  if (existingClaim) {
    const claimExists = existingClaim.values.some(v => v.id === data.claim.id)
    if (!claimExists) {
      existingClaim.values.push(data.claim)
    }
  }
}
</script>
