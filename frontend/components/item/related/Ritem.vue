<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel class="cnum">
      <v-expansion-panel-title class="cnum">
        <div class="ritem-header">
          <div>
            <span class="mb-0 ml-3">#{{ index + 1 }}</span>
            <NuxtLink class="ml-1 text-black" :to="url">
              <span>{{ pbid }}</span>
            </NuxtLink>
            <span class="ml-1">
              <item-util-view-text-lang :value="label" />
            </span>
          </div>
          <div v-if="linkingQualifiers.length" class="ritem-qualifiers text-caption text-grey mt-1">
            <span v-for="(q, i) in linkingQualifiers" :key="q.property">
              <span class="font-weight-medium">{{ q.propLabel }}</span>:
              {{ q.valueDisplay }}<span v-if="i < linkingQualifiers.length - 1"> · </span>
            </span>
          </div>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div>
          <item-claims :table="table" :item="item" :claims="claims" />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  table: { type: String, required: true },
  value: { type: Object, default: null },
  index: { type: Number, default: null },
  itemId: { type: String, default: null }
})

const { $wikibase } = useNuxtApp()
const { locale } = useI18n()
const { notifyError } = useNotifyError()
const localePath = useLocalePath()

const label = ref(null)
const item = ref(null)
const claims = ref(null)
const linkingQualifiers = ref([])

let entityRequestId = 0

const pbid = computed(() => props.value.item_pbid)
const url = computed(() => localePath(`/item/${props.value.item}`))

onMounted(async () => {
  if (props.value.item) {
    await getEntity()
  }
})

watch(() => props.value.item, (newItem) => {
  if (newItem) {
    getEntity()
  } else {
    label.value = null
    item.value = null
    claims.value = null
    linkingQualifiers.value = []
  }
})

async function getEntity () {
  const requestId = ++entityRequestId
  try {
    const entity = await $wikibase.getEntity(props.value.item, locale.value)
    if (requestId !== entityRequestId) return
    item.value = entity
    claims.value = await $wikibase.getOrderedClaims(props.table, entity.claims)
    if (requestId !== entityRequestId) return
    label.value = $wikibase.getValueByLang(entity.labels, locale.value)
    linkingQualifiers.value = []
    if (props.itemId && props.table === 'bioid') {
      await extractLinkingQualifiers(entity.claims, requestId)
    }
  } catch (err) {
    notifyError(err)
  }
}

async function extractLinkingQualifiers (entityClaims, requestId) {
  for (const statements of Object.values(entityClaims || {})) {
    for (const stmt of statements) {
      if (stmt.mainsnak?.datavalue?.value?.id === props.itemId && stmt.qualifiers) {
        const order = stmt['qualifiers-order'] || Object.keys(stmt.qualifiers)
        const resolved = await Promise.all(
          order
            .filter(prop => stmt.qualifiers[prop]?.length)
            .map(async (prop) => {
              const propLabel = await $wikibase.getEntityLabel(props.table, prop, locale.value)
              const values = await Promise.all(
                stmt.qualifiers[prop].map(snak => $wikibase.formatQualifierSnak(snak, locale.value))
              )
              return {
                property: prop,
                propLabel: propLabel?.value || prop,
                valueDisplay: values.filter(Boolean).join(', ')
              }
            })
        )
        if (requestId === entityRequestId) {
          linkingQualifiers.value = resolved.filter(q => q.valueDisplay)
        }
        return
      }
    }
  }
}
</script>

<style scoped>
.v-expansion-panel-title.cnum {
  background-color: rgb(247, 245, 245);
}
:deep(.v-expansion-panel-text__wrapper),
:deep(.claim-values) {
  background-color: white !important;
}
.ritem-header {
  display: flex;
  flex-direction: column;
}
.ritem-qualifiers {
  padding-left: 12px;
}
</style>
