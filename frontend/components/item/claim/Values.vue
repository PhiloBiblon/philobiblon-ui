<template>
  <v-data-table
    v-if="claim"
    :headers="formattedHeaders"
    :hide-default-header="!headers.length"
    :items="claim.values"
    :items-per-page-options="perPageOptions"
    :items-per-page-text="`${t('common.properties')} ${t('common.per_page')}`"
    :hide-default-footer="shouldHideFooter"
    class="elevation-1"
  >
    <template #item="{ item, index }">
      <tr class="table-row">
        <td v-for="(header, key) in formattedHeaders" :key="header.key" class="table-cell">
          <item-value-base
            v-if="!key"
            :claim="item"
            :value="item.mainsnak"
            type="claim"
            :in-table="true"
            :column-width="header.width"
            @delete-claim="emit('delete-claim', $event)"
          />
          <item-qualifier-list
            v-if="item.qualifiers?.[header.key]"
            :key="item.qualifiers[header.key].length"
            :claim="item"
            :qualifiers="item.qualifiers[header.key]"
            @delete-qualifier="deleteQualifier($event, index)"
          />
        </td>
      </tr>
      <tr v-if="isUserLogged" class="table-row-edit">
        <td :colspan="formattedHeaders.length" class="table-cell-btn-edit">
          <item-qualifier-create
            :claim="item"
            @create-qualifier="createQualifier($event, index)"
          />
        </td>
      </tr>
      <tr v-if="isUserLogged || item.references" class="table-row-edit">
        <td :colspan="formattedHeaders.length">
          <item-reference-base :claim="item" />
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
  claim: { type: Object, default: () => ({ values: [] }) }
})

const emit = defineEmits(['delete-claim'])

const { $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const headers = ref([])

const perPageOptions = [
  { title: '20', value: 20 },
  { title: '40', value: 40 },
  { title: '60', value: 60 },
  { title: '80', value: 80 },
  { title: '100', value: 100 },
  { title: t('search.form.common.group_all.label'), value: -1 }
]

const isUserLogged = computed(() => authStore.isLogged)

const formattedHeaders = computed(() => [
  { title: '', key: '_value', sortable: false },
  ...headers.value.map(header => ({
    title: header.label.value,
    key: header.property,
    sortable: false
  }))
])

const shouldHideFooter = computed(() => props.claim?.values?.length <= perPageOptions[0].value)

onMounted(async () => {
  await getHeaders()
})

async function getHeaders () {
  const qualifierKeys = new Set()
  props.claim.values.forEach((item) => {
    Object.keys(item.qualifiers ?? {}).forEach(key => qualifierKeys.add(key))
  })
  const qualifiersKeysOrdered = Array.from(qualifierKeys).sort((a, b) => {
    return props.claim.qualifiersOrder ? props.claim.qualifiersOrder.indexOf(a) - props.claim.qualifiersOrder.indexOf(b) : -1
  })
  const headerPromises = qualifiersKeysOrdered.map(async (property) => {
    const entity = await $wikibase.getEntity(property, locale.value)
    return {
      property,
      label: $wikibase.getValueByLang(entity.labels, locale.value)
    }
  })
  headers.value = await Promise.all(headerPromises)
}

async function createQualifier (qualifiers, index) {
  const value = props.claim.values[index]
  if (!value.qualifiers) {
    value.qualifiers = {}
  }
  value.qualifiers[qualifiers[0].property] = qualifiers
  await getHeaders()
}

async function deleteQualifier (qualifier, index) {
  const value = props.claim.values[index]
  const qualifiers = value.qualifiers[qualifier.property]
  const findIndex = qualifiers.findIndex(item => item.hash === qualifier.hash)
  if (findIndex !== -1) {
    qualifiers.splice(findIndex, 1)
  }
  if (!qualifiers.length) {
    delete value.qualifiers[qualifier.property]
  }
  await getHeaders()
}
</script>

<style scoped>
:deep(.v-data-table thead th) {
  background-color: #e0e0e0;
  color: #424242 !important;
  font-weight: bold !important;
  border: none !important;
  font-size: 11px !important;
  height: 28px !important;
  text-align: right !important;
}

:deep(.v-data-table-header th:last-child) {
  border-right: none;
}

.table-row {
  border: none;
  background-color: rgb(247, 245, 245);
}

.table-row-edit {
  border: none;
  background-color: rgb(247, 245, 245);
}

.table-cell {
  border-bottom: none !important;
  padding-top: 8px !important;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.table-cell-btn-edit {
  border-top: none !important;
  border-bottom: none !important;
  height: 30px !important;
}

.table-cell:last-child {
  border-right: none;
}

.table-row:hover {
  background-color: #f0f0f0;
}

.table-row-edit:hover {
  background-color: rgb(247, 245, 245) !important;
}

:deep(.v-data-table-footer) {
  background-color: rgb(247, 245, 245);
  border-top: none;
  width: 100%;
  padding: 8px 16px;
}
</style>
