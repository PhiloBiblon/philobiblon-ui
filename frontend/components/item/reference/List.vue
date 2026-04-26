<template>
  <v-data-table
    v-if="valueToView && Object.keys(snaks).length"
    :key="valueToView.hash"
    :items="snaks"
    hide-default-header
    hide-default-footer
    :items-per-page="snaks.length"
    class="elevation-1 mt-1 mb-3 bg-gray"
  >
    <template #item="{ item, index }">
      <tr :key="valueToView.hash" class="table-row">
        <td :class="isUserLogged ? 'table-cell-value-edit' : 'table-cell'" class="col-4">
          <span>{{ item.propertyLabel.value }}</span>
        </td>
        <td :class="isUserLogged ? 'table-cell-value-edit' : 'table-cell'" class="col-8">
          <item-reference-values
            v-if="item.property"
            :key="`${valueToView.hash}-${index}`"
            :claim="claim"
            :values="item.data"
            :reference="valueToView"
            @create-reference="updateReference($event)"
            @delete-reference="emit('delete-reference', $event)"
          />
        </td>
      </tr>
    </template>
    <template v-if="isUserLogged" #[`body.append`]>
      <tr>
        <td :colspan="2" class="full-width">
          <item-reference-create
            :key="valueToView.hash"
            class="mt-5"
            :claim="claim"
            :value="valueToView"
            @create-reference="updateReference($event)"
          />
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  claim: { type: Object, required: true },
  value: { type: Object, required: true }
})

const emit = defineEmits(['delete-reference'])

const { $wikibase } = useNuxtApp()
const { locale } = useI18n()
const authStore = useAuthStore()

const properties = ref([])
const valueToView = ref(null)

const isUserLogged = computed(() => authStore.isLogged)

const snaks = computed(() => {
  if (!valueToView.value) { return [] }
  return Object.entries(valueToView.value.snaks).map(([key, value]) => ({
    property: key,
    propertyLabel: properties.value.find(item => item.property === key)?.label || key,
    data: value.map(item => ({
      ...item,
      reference_hash: valueToView.value.hash
    }))
  }))
})

onMounted(async () => {
  valueToView.value = props.value
  await getProperties()
})

async function getProperties () {
  const referenceKeys = Object.keys(valueToView.value.snaks ?? {})

  const referenceKeysOrdered = Array.from(referenceKeys).sort((a, b) => {
    return valueToView.value['snaks-order'] ? valueToView.value['snaks-order'].indexOf(a) - valueToView.value['snaks-order'].indexOf(b) : -1
  })
  const headerPromises = referenceKeysOrdered.map(async (property) => {
    const entity = await $wikibase.getEntity(property, locale.value)
    return {
      property,
      label: $wikibase.getValueByLang(entity.labels, locale.value)
    }
  })
  properties.value = await Promise.all(headerPromises)
}

async function updateReference (data) {
  valueToView.value = data.reference ?? data
  await getProperties()
}
</script>

<style scoped>
.bg-gray {
  background-color: rgb(247, 245, 245);
}

.table-row {
  background-color: rgb(247, 245, 245);
}
.table-cell {
  border: none;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.table-cell-value-edit {
  padding-top: 8px !important;
}

.table-cell:last-child {
  border-right: none;
}
</style>
