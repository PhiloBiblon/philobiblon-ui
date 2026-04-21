<template>
  <div class="item">
    <item-base v-if="itemId" :id="itemId" :database="database" :table="table" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const route = useRoute()

const database = ref(null)
const table = ref(null)
const itemId = ref(null)

const paramId = route.params.id
if ($wikibase.getQItemPattern().test(paramId.toUpperCase())) {
  await setParametersFromQItem(paramId)
} else if ($wikibase.getPBIDPattern().test(paramId)) {
  await setParametersFromPBID(paramId)
} else {
  $notification.error(t('item.messages.invalid_id'))
}

async function setParametersFromQItem (qItem) {
  database.value = route.query.database
  table.value = route.query.table

  const entity = await $wikibase.getEntity(qItem, locale.value)
  const pbid = $wikibase.getPBID(entity, database.value, table.value)
  if (!pbid) {
    $notification.error(t('item.messages.not_found'))
  } else {
    const parsedPBID = $wikibase.parsePBID(pbid)
    if (!database.value || database.value === 'ALL') {
      database.value = parsedPBID.group
    }
    if (!table.value) {
      table.value = parsedPBID.tableid
    }
    itemId.value = qItem.toUpperCase()
  }
}

async function setParametersFromPBID (pbid) {
  const qItem = await $wikibase.getEntityFromPBID(pbid)
  if (qItem === null) {
    $notification.error(t('item.messages.not_found'))
  } else {
    const parsedPBID = $wikibase.parsePBID(pbid)
    database.value = parsedPBID.group
    table.value = parsedPBID.tableid
    itemId.value = qItem
  }
}
</script>

<style scoped>
.item {
  width: 100% !important
}
</style>
