<template>
  <v-expansion-panels class="ma-2 pa-2 bg-gray none-z-index">
    <v-expansion-panel class="bg-gray">
      <v-expansion-panel-title class="bg-gray header">
        <p class="text-subtitle-2 mb-0 reference-header">
          {{ header }}
        </p>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="bg-gray">
        <item-reference-list
          v-for="reference in references"
          :key="`${reference.hash}-${references.length}`"
          :claim="claim"
          :value="reference"
          @delete-reference="deleteReference($event)"
        />
        <item-reference-create
          v-if="isUserLogged"
          class="mt-5"
          :claim="claim"
          @create-reference="createReference($event)"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  claim: { type: Object, required: true }
})

const authStore = useAuthStore()

const references = ref([])

const isUserLogged = computed(() => authStore.isLogged)
const referenceCount = computed(() => Object.keys(references.value || {}).length)
const header = computed(() => `${referenceCount.value} reference${referenceCount.value === 1 ? '' : 's'}`)

onMounted(() => {
  references.value = props.claim.references ?? []
})

function createReference (reference) {
  references.value.push(reference)
}

function deleteReference (data) {
  const findIndex = references.value.findIndex(item => item.hash === data.hash)
  if (findIndex !== -1) {
    references.value.splice(findIndex, 1)
  }
}
</script>

<style scoped>
.bg-gray {
  background-color: #ECEFF1;
}

.none-z-index {
  z-index: unset;
}

.header {
  padding: 0;
  align-items: center;
}

.reference-header {
  font-weight: normal !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 8px 0 8px;
}
</style>
