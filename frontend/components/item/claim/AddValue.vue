<template>
  <v-container class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="key"
      class="even-row value-divider"
      density="comfortable"
    >
      <v-col class="p-0 pr-3 pt-3">
        <div class="d-flex">
          <item-value-base
            :key="`${claim.value}-${key}`"
            class="full-width value-wrapper"
            :label="t('common.value')"
            :value="claim"
            type="claim"
            mode="creation"
            @on-blur="updateClaimValue($event, key)"
          />
          <div class="d-flex ml-3 mt-1 align-center">
            <v-btn
              v-if="!forCreate"
              :disabled="!claim?.datavalue?.value"
              variant="text"
              icon
              density="compact"
              class="action-btn"
              @click.stop="createClaim(key)"
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
          </div>
        </div>
        <v-container class="claim-values">
          <div class="subsection-indent">
            <item-qualifier-create
              :key="`${key}-qualifiers`"
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
                    :key="`${key}-references`"
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
      </v-col>
    </v-row>
    <v-row class="back pr-5 mt-1 add-value" justify="end">
      <a role="button" class="link" @click.stop="addClaim">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ t("common.add_value") }}</span>
        </div>
      </a>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  item: { type: Object, default: null },
  value: { type: Object, default: null },
  forCreate: { type: Boolean, default: false },
  defaultValue: { type: Object, default: null },
  table: { type: String, default: null }
})

const emit = defineEmits(['update-claims-values', 'create-claim'])

const { $notification, $wikibase } = useNuxtApp()
const { t } = useI18n()
const { notifyError } = useNotifyError()
const authStore = useAuthStore()

const items = reactive({})
const claims = reactive({})

onMounted(() => {
  if (props.defaultValue && !props.forCreate) {
    const newKey = `P${Date.now()}`
    claims[newKey] = {
      property: props.value.property,
      datatype: props.value.datatype,
      datavalue: { value: props.defaultValue },
      mainsnak: { property: props.value.property },
      qualifiers: [],
      references: []
    }
  }
})

function addClaim () {
  const newKey = `P${Date.now()}`
  const { property, datatype } = props.value
  claims[newKey] = {
    property,
    datatype,
    datavalue: { value: null, default: false },
    mainsnak: { property },
    qualifiers: [],
    references: []
  }

  if (props.forCreate) {
    emit('update-claims-values', claims)
  }
}

function removeClaim (key) {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete claims[key]
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete items[key]

  if (props.forCreate) {
    emit('update-claims-values', claims)
  }
}

function updateClaimValue (value, key) {
  claims[key].datavalue.value = value && typeof value === 'object' && 'id' in value ? value.id ?? null : value

  if (props.forCreate) {
    emit('update-claims-values', claims)
  }
}

function updateQualifiers (data, key) {
  claims[key].qualifiers = data.map((qualifier) => {
    if (!props.forCreate) {
      const propertyId = qualifier?.property?.id || qualifier?.property
      return { property: propertyId, value: qualifier?.datavalue?.value?.id ?? qualifier.datavalue?.value }
    } else {
      return qualifier
    }
  })

  if (props.forCreate) {
    emit('update-claims-values', claims)
  }
}

function updateReferences (data, key) {
  claims[key].references = data.map((reference) => {
    if (!props.forCreate) {
      const propertyId = reference?.property?.id || reference?.property
      return { property: propertyId, value: reference?.datavalue?.value?.id ?? reference.datavalue?.value }
    } else {
      return reference
    }
  })

  if (props.forCreate) {
    emit('update-claims-values', claims)
  }
}

function referenceHeader (claim) {
  const count = claim.references?.length ?? 0
  return `${count} reference${count === 1 ? '' : 's'}`
}

async function createClaim (index) {
  const claim = claims[index]
  const raw = claim?.datavalue?.value
  const value = raw && typeof raw === 'object' && 'id' in raw ? raw.id ?? null : raw
  if (value == null) {
    return
  }

  const formattedQualifiers = Object.fromEntries(
    (claim.qualifiers || [])
      .filter(q => q.property && q.value)
      .map(({ property: p, value: v }) => [p, { value: v }])
  )

  const formattedReferences = (claim.references || [])
    .filter(r => r.property && r.value)
    .map(({ property: p, value: v }) => ({ [p]: v }))

  try {
    const res = await $wikibase.getWbEdit().claim.create({
      value,
      id: props.item.id,
      property: props.value.property,
      qualifiers: Object.keys(formattedQualifiers).length ? formattedQualifiers : undefined,
      references: formattedReferences.length ? formattedReferences : undefined
    }, authStore.requestConfig)
    if (res.success) {
      $notification.success(t('messages.success.updated'))
      updateClaims(res)
    } else {
      throw res
    }
    return res
  } catch (error) {
    notifyError(error)
  }
}

function updateClaims (res) {
  emit('create-claim', { claim: res.claim, property: props.value.property })
}
</script>

<style scoped>
.add-value {
  font-size: 14px;
}
.claim {
  padding: 0;
}
.claim-values {
  padding: 0;
}
.value-wrapper {
  padding: 8px 16px;
}
.value-divider {
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  margin-top: 10px;
}
.subsection-indent {
  padding-left: 40px;
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
