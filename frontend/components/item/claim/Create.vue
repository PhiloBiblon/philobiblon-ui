<template>
  <div class="claim">
    <v-row
      v-for="(claim, key) in claims"
      v-show="!claim.hidden"
      :key="claim?.property?.id"
      class="even-row pt-5"
      no-gutters
      density="comfortable"
    >
      <v-col class="p-0 pr-3 mt-3">
        <div class="claim-header">
          <v-autocomplete
            v-model="claim.property"
            required
            :readonly="claim?.default"
            :items="properties[key]"
            item-title="label"
            return-object
            :aria-label="t('common.property')"
            variant="underlined"
            density="compact"
            :custom-filter="acceptAll"
            @update:model-value="onChangeProperty($event, claim)"
            @update:search="onInput($event, key)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end align-center max-w-100">
        <v-btn
          v-if="!forCreate"
          :disabled="!canCreate(key)"
          variant="text"
          icon
          density="compact"
          class="action-btn"
          @click.stop="addClaim(key)"
        >
          <v-tooltip location="top">
            <template #activator="{ props: btnProps }">
              <v-icon v-bind="btnProps" color="#616161" size="22">
                mdi-check
              </v-icon>
            </template>
            <span>{{ t("common.save") }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          v-if="claim?.removable !== false && claim?.property?.id !== pbid"
          variant="text"
          icon
          density="compact"
          class="action-btn"
          @click.stop="removeClaim(key)"
        >
          <v-tooltip location="top">
            <template #activator="{ props: btnProps }">
              <v-icon v-bind="btnProps" color="#616161" size="22">
                mdi-trash-can
              </v-icon>
            </template>
            <span>{{ t("common.remove") }}</span>
          </v-tooltip>
        </v-btn>
      </v-col>
      <v-container v-if="claim?.property?.id || claim.default" class="claim-values">
        <div class="value-wrapper">
          <item-value-base
            :key="`${claim.property?.id}-${key}`"
            :label="t('common.value')"
            :claim="claim"
            :value="claim.value"
            type="claim"
            mode="creation"
            @new-value="onNewValue($event, claim)"
          />
        </div>
        <div class="subsection-indent">
          <item-qualifier-create
            :key="claim?.property?.id"
            :claim="claim"
            :for-create="forCreate"
            :table="table"
            :initial-qualifiers="claim.qualifiers"
            @update-qualifiers="updateQualifiers($event, key)"
          />
        </div>
        <div class="subsection-indent">
          <v-expansion-panels class="mt-2 mb-2 mr-2 pa-2 bg-gray none-z-index">
            <v-expansion-panel class="bg-gray">
              <v-expansion-panel-title class="bg-gray header">
                <p class="text-subtitle-2 mb-0 reference-header">
                  {{ referenceHeader(claim) }}
                </p>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="bg-gray">
                <item-reference-create
                  :key="claim?.property?.id"
                  :claim="claim"
                  :for-create="forCreate"
                  :table="table"
                  :initial-references="claim.references"
                  @update-references="updateReferences($event, key)"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-container>
      <item-claim-add-value
        v-if="forCreate"
        :key="key"
        class="add-claim-value mb-2"
        :item="item"
        :value="claim.value"
        :for-create="forCreate"
        :table="table"
        @update-claims-values="updateClaimValues($event, key)"
      />
    </v-row>
    <v-row class="back pr-5 mb-2 mt-2 add-statement" justify="end">
      <a role="button" class="link" @click="addNewClaim">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ t("common.add_claim") }}</span>
        </div>
      </a>
    </v-row>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { WikibaseService } from '~/service/wikibase.service'

const props = defineProps({
  item: { type: Object, default: null },
  initialClaims: { type: Array, default: null },
  forCreate: { type: Boolean, default: false },
  table: { type: String, default: null }
})

const emit = defineEmits(['update-claims'])

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const { notifyError } = useNotifyError()
const { groupByProperty } = useQualifierGrouping()
const { searchProperties } = usePropertySearch()
const authStore = useAuthStore()

const claims = reactive([])
const properties = reactive([])
// Guards against an in-flight search resolving after a newer one already updated
// the same row. A single monotonic counter (rather than one per row) ensures a
// stale response can never match a fresh row that reused its index after splice().
const searchRequestIds = []
let nextSearchRequestId = 0

const pbid = computed(() => WikibaseService.PROPERTY_PBID)

watch(() => props.initialClaims?.length, () => {
  if (props.initialClaims) {
    props.initialClaims.forEach((claim) => {
      if (!claims.some(c => c.property?.id === claim.property?.id)) {
        properties[claims.length] = [claim.property]
        claims.push(claim)
      }
    })
  }
}, { immediate: true })

watch(claims, (newValue) => {
  if (props.forCreate) {
    emit('update-claims', newValue)
  }
}, { deep: true })

async function onChangeProperty (property, claim) {
  if (property) {
    const altLabel = await $wikibase.getEntityLabel(props.table, property.id, locale.value)
    claim.property = { ...property, label: altLabel?.value ?? property.label }
  } else {
    claim.property = null
  }
  claim.value.datavalue.value = null
  claim.value.property = property?.id ?? null
  claim.mainsnak.property = property?.id ?? null
  claim.value.datatype = property?.datatype ?? null
}

function onNewValue (event, claim) {
  claim.value.datavalue.value = event
}

function canCreate (index) {
  const c = claims[index]
  const v = c?.value?.datavalue?.value

  const validSnak = s =>
    s?.property && s?.value &&
    (typeof s.value === 'string' ? s.value.trim() : Object.values(s.value).every(vv => vv != null && vv !== ''))

  return !!(c?.property && v && (typeof v !== 'object' || Object.values(v).every(val => val != null && val !== '')) &&
    c.qualifiers?.every(validSnak) &&
    c.references?.every(validSnak))
}

function addNewClaim () {
  claims.push({
    default: false,
    value: {
      property: null,
      datatype: null,
      datavalue: { value: null }
    },
    claimsValues: [],
    mainsnak: { property: null },
    property: null,
    qualifiers: [],
    references: []
  })
}

function removeClaim (index) {
  claims.splice(index, 1)
  properties.splice(index, 1)
  searchRequestIds.splice(index, 1)
}

async function onInput (value, index) {
  const requestId = (searchRequestIds[index] = ++nextSearchRequestId)
  if (!value || typeof value !== 'string') {
    properties[index] = []
    return
  }
  const search = await searchProperties(value, props.table)
  if (searchRequestIds[index] !== requestId) { return }
  properties[index] = search
}

function updateClaimValues (data, key) {
  claims[key].claimsValues = data
  emit('update-claims', claims)
}

async function addClaim (index) {
  if (claims[index]?.value?.datavalue?.value) {
    return await createClaim(index).then((res) => {
      if (res.success) {
        updateClaims(res)
        removeClaim(index)
        $notification.success(t('messages.success.updated'))
      } else {
        throw res
      }
    }).catch((error) => {
      notifyError(error)
    })
  }
}

async function createClaim (index) {
  const { property, value, qualifiers: rawQualifiers, references: rawReferences } = claims[index]

  const formattedQualifiers = groupByProperty(rawQualifiers, q => q.property, q => q.value)

  const formattedReferences = (rawReferences || [])
    .filter(r => r.property && r.value)
    .map(({ property: p, value: v }) => ({ [p]: v }))

  return await $wikibase.getWbEdit().claim.create({
    id: props.item.id,
    property: property.id,
    value: value.datavalue.value.id ?? value.datavalue.value,
    qualifiers: Object.keys(formattedQualifiers).length ? formattedQualifiers : undefined,
    references: formattedReferences.length ? formattedReferences : undefined
  }, authStore.requestConfig)
}

function updateReferences (data, key) {
  claims[key].references = data.map((reference) => {
    if (!props.forCreate) {
      const propertyId = reference?.property?.id || reference?.property
      return {
        property: propertyId,
        value: reference?.datavalue?.value?.id ?? reference.datavalue?.value
      }
    } else {
      return reference
    }
  })
}

function updateQualifiers (data, key) {
  claims[key].qualifiers = data.map((qualifier) => {
    if (!props.forCreate) {
      const propertyId = qualifier?.property?.id || qualifier?.property
      return {
        property: propertyId,
        value: qualifier?.datavalue?.value?.id ?? qualifier.datavalue?.value
      }
    } else {
      return qualifier
    }
  })
}

function updateClaims (res) {
  emit('update-claims', {
    values: [res.claim],
    hasQualifiers: res.claim?.qualifiers,
    property: res.claim.mainsnak.property,
    datatype: res.claim.mainsnak.datatype,
    qualifiersOrder: res.claim['qualifiers-order'] ?? false
  })
}

function acceptAll () {
  return true
}

function referenceHeader (claim) {
  const count = claim.references?.length ?? 0
  return t('common.reference_count', count)
}
</script>

<style scoped>
.claim {
  padding: 0;
  margin-top: 25px;
}
.claim-header {
  font-size: 16px;
  padding: 0 16px;
  min-height: 48px;
}
.claim-header :deep(.v-field__input),
.claim-header :deep(.v-label) {
  font-size: 18px;
  font-weight: 500;
}
.claim-values {
  padding: 0;
  background-color: rgb(247, 245, 245);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
.value-wrapper {
  padding: 8px 16px;
}
.subsection-indent {
  padding-left: 40px;
}

:deep(.add-claim-value) {
  .add-value {
    margin-top: 0;
  }
  .even-row {
    margin: 1px 0 0 0;
  }
  margin-top: 0;
}
.add-statement {
  font-size: 16px;
}
.action-btn {
  width: 28px !important;
  height: 28px !important;
}
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
