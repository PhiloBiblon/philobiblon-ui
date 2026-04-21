<template>
  <v-container v-if="items.length" class="mt-2">
    <div class="text-grey">
      {{ t(references.label) }} : {{ totalResults }} {{ t('common.items') }}
    </div>
    <item-related-ritem
      v-for="(value, index) in items"
      :key="`related-item-${index}-${value.item}`"
      :table="table"
      :index="index + ((currentPage - 1) * resultsPerPage)"
      :value="value"
      class="mt-2"
    />
    <div class="text-center">
      <v-pagination
        v-if="totalResults > resultsPerPage"
        v-model="currentPage"
        :length="Math.ceil(totalResults / resultsPerPage)"
        :total-visible="5"
        @update:model-value="changePage"
      />
    </div>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  itemId: { type: String, default: null },
  table: { type: String, required: true },
  references: { type: Object, default: null }
})

const emit = defineEmits(['has-related-table'])

const { $wikibase } = useNuxtApp()
const { t } = useI18n()

const items = ref([])
const currentPage = ref(1)
const totalResults = ref(0)
const resultsPerPage = 10

onMounted(async () => {
  if (props.itemId) {
    count()
    items.value = await $wikibase.getRelatedItems(props.itemId, props.references.refTables, currentPage.value, resultsPerPage)
    emit('has-related-table', items.value.length > 0)
  }
})

function count () {
  $wikibase.runSparqlQuery($wikibase.$query.getRelatedItemsCount(props.itemId, props.references.refTables), true)
    .then((results) => { totalResults.value = results[0] })
}

async function changePage () {
  items.value = await $wikibase.getRelatedItems(props.itemId, props.references.refTables, currentPage.value, resultsPerPage)
}
</script>
