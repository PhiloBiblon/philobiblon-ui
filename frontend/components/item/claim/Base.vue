<template>
  <v-container class="claim">
    <v-row dense>
      <div class="claim-header section-header">
        <item-util-view-text-lang :value="propertyLabel" :tooltip="claim.property" />
      </div>
    </v-row>
    <v-container class="claim-values">
      <item-claim-values :claim="claim" @delete-claim="emit('delete-claim', $event)" />
      <item-claim-add-value
        v-if="isUserLogged && isAllowedAddValue"
        :key="claim.values.length"
        :item="item"
        :value="claim?.values[0]?.mainsnak"
        @create-claim="emit('create-claim', $event)"
      />
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { WikibaseService } from '~/service/wikibase.service'

const props = defineProps({
  table: { type: String, required: true },
  item: { type: Object, default: null },
  claim: { type: Object, default: null }
})

const emit = defineEmits(['delete-claim', 'create-claim'])

const { $wikibase } = useNuxtApp()
const { locale } = useI18n()
const authStore = useAuthStore()

const propertyLabel = ref(null)

const isUserLogged = computed(() => authStore.isLogged)
const isAllowedAddValue = computed(() => props.claim.property !== WikibaseService.PROPERTY_NOTES)

onMounted(async () => {
  propertyLabel.value = await $wikibase.getEntityLabel(props.table, props.claim.property, locale.value)
})
</script>

<style scoped>
.claim {
  padding: 0;
}
.claim-header {
  font-size: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  min-height: 48px;
  color: #616161 !important;
  font-weight: bold !important;
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
