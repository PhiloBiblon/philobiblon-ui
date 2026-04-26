<template>
  <div class="all-width">
    <v-container v-if="showItem">
      <v-row class="back">
        <a class="link" @click="goTo(`/search/${table}/query`)">
          <v-tooltip location="right">
            <template #activator="{ props: tooltipProps }">
              <v-icon color="primary" size="large" v-bind="tooltipProps">
                mdi-reply
              </v-icon>
            </template>
            <span>{{ t("item.back") }}</span>
          </v-tooltip>
        </a>
      </v-row>
      <v-row>
        <v-col>
          <span v-if="isUserLogged">
            <item-util-edit-text-field :label="t('item.title')" :save="editLabel" :value="label.value" class="text-h4">
              <template #append-outer>
                &nbsp;
                <a
                  class="text-subtitle-2 link"
                  :href="$wikibase.getQItemUrl(item.id)"
                  target="_blank"
                >{{ item.id }}</a>
              </template>
            </item-util-edit-text-field>
          </span>
          <span v-else class="text-h4">
            <item-util-view-text-lang :value="label" />
            &nbsp;
            <a
              class="text-subtitle-2 link"
              :href="$wikibase.getQItemUrl(item.id)"
              target="_blank"
            >{{ item.id }}</a>
          </span>
        </v-col>
      </v-row>
      <v-row class="pb-5">
        <span v-if="isUserLogged" class="full-width">
          <item-util-edit-text-field :label="t('item.description')" :save="editDescription" :value="description.value" class="text-subtitle-1" />
        </span>
        <span v-else class="text-subtitle-1">
          <v-col class="text-subtitle-1">
            <item-util-view-text-lang :value="description" />
          </v-col>
        </span>
      </v-row>
      <item-claims :table="table" :item="item" :claims="claimsOrdered" />
      <div v-if="hasRelatedTable" class="text-h6 mt-6">
        {{ t('item.related_items') }}
      </div>
      <item-related-tables :item-id="item.id" :table="table" @has-related-table="hasRelatedTable = $event" />
      <div v-if="hasNotes || isUserLogged" class="text-h6 mt-6">
        {{ t('item.notes') }}
      </div>
      <item-notes :item-id="item.id" @has-notes="hasNotes = $event" />
      <div class="text-h6 mt-6">
        {{ t('item.identifiers') }}
      </div>
      <item-claims :table="table" :item="item" :claims="externalIdClaims" />
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const props = defineProps({
  id: { type: String, default: null },
  database: { type: String, required: true },
  table: { type: String, required: true }
})

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

const item = ref(null)
const label = ref(null)
const description = ref(null)
const showItem = ref(false)
const claimsOrdered = ref([])
const externalIdClaims = ref([])
const hasRelatedTable = ref(false)
const hasNotes = ref(false)

const isUserLogged = computed(() => authStore.isLogged)

onMounted(async () => {
  if (props.id) {
    await getEntity()
  }
})

onBeforeUnmount(() => {
  breadcrumbStore.setClass('')
})

function goTo (path) {
  router.push(localePath(path))
}

async function getEntity () {
  try {
    const entity = await $wikibase.getEntity(props.id, locale.value)
    item.value = entity
    label.value = await $wikibase.getValueByLang(entity.labels, locale.value)
    description.value = await $wikibase.getValueByLang(entity.descriptions, locale.value)
    setBreadCrumb(props.database, props.table, entity)
    showItem.value = true
    handleClaims(entity)
  } catch (err) {
    $notification.error(err)
  }
}

async function handleClaims (entity) {
  const allClaims = await $wikibase.getOrderedClaims(props.table, entity.claims)
  for (const claim of allClaims) {
    const entityProperty = await $wikibase.getEntity(claim.property, locale.value)
    if (entityProperty.datatype === 'external-id') {
      externalIdClaims.value.push(claim)
    } else {
      claimsOrdered.value.push(claim)
    }
  }
}

function setBreadCrumb (database, table, entity) {
  breadcrumbStore.setItems(getBreadcrumbItems(database, table, entity))
  breadcrumbStore.setClass('large-font-breadcrumb')
  breadcrumbStore.setDatabase(database)
  breadcrumbStore.setTable(table)
}

function getBreadcrumbItems (database, table, entity) {
  return [
    {
      title: t('menu.item.search.label'),
      disabled: true
    },
    {
      title: t('menu.item.search.item.' + table + '.label'),
      disabled: false,
      to: localePath('/search/' + table + '/query')
    },
    {
      title: $wikibase.getPBID(entity, database, table),
      disabled: true
    }
  ]
}

function editLabel (labelValue) {
  return $wikibase.getWbEdit().label.set(
    { id: item.value.id, language: locale.value, value: labelValue },
    authStore.requestConfig
  )
}

function editDescription (descriptionValue) {
  return $wikibase.getWbEdit().description.set(
    { id: item.value.id, language: locale.value, value: descriptionValue },
    authStore.requestConfig
  )
}
</script>

