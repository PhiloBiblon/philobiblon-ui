<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel class="cnum">
      <v-expansion-panel-title class="cnum">
        <div>
          <span class="mb-0 ml-3">#{{ index + 1 }}</span>
          <NuxtLink class="ml-1 text-black" :to="url">
            <span>{{ pbid }}</span>
          </NuxtLink>
          <span class="ml-1">
            <item-util-view-text-lang :value="label" />
          </span>
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
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  table: { type: String, required: true },
  value: { type: Object, default: null },
  index: { type: Number, default: null }
})

const { $notification, $wikibase } = useNuxtApp()
const { locale } = useI18n()
const localePath = useLocalePath()

const label = ref(null)
const item = ref(null)
const claims = ref(null)

const pbid = computed(() => props.value.item_pbid)
const url = computed(() => localePath(`/item/${props.value.item}`))

onMounted(async () => {
  if (props.value.item) {
    await getEntity()
  }
})

async function getEntity () {
  try {
    const entity = await $wikibase.getEntity(props.value.item, locale.value)
    item.value = entity
    claims.value = await $wikibase.getOrderedClaims(props.table, entity.claims)
    label.value = $wikibase.getValueByLang(entity.labels, locale.value)
  } catch (err) {
    $notification.error(err)
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
</style>
