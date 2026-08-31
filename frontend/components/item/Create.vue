<template>
  <div class="all-width">
    <v-container>
      <v-row class="back">
        <a class="link" @click="cancel">
          <v-tooltip location="right">
            <template #activator="{ props: tooltipProps }">
              <v-icon color="primary" size="large" v-bind="tooltipProps">
                mdi-reply
              </v-icon>
            </template>
            <span>{{ t('item.back') }}</span>
          </v-tooltip>
        </a>
      </v-row>
      <v-alert
        v-if="!isUserLogged && initialClaimsLoaded"
        type="warning"
        class="mb-4"
        variant="tonal"
      >
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <span>{{ t('auth.session.expired') }}</span>
          <v-btn color="primary" variant="flat" @click="loginAgain">
            {{ t('auth.login.label') }}
          </v-btn>
        </div>
      </v-alert>
      <template v-if="isUserLogged || initialClaimsLoaded">
        <v-row>
          <v-col>
            <v-form ref="form">
              <v-text-field
                v-model="label"
                type="text"
                class="text-h4"
                :label="t('common.label')"
              />
              <v-text-field
                v-model="description"
                type="text"
                class="text-subtitle-1"
                :label="t('item.description')"
              />
              <v-text-field
                v-if="aliasValue"
                :model-value="aliasValue"
                type="text"
                class="text-subtitle-1"
                :label="t('item.alias')"
                readonly
              />
            </v-form>
          </v-col>
        </v-row>
        <v-alert v-if="!initialClaimsLoaded" type="info">
          {{ t('item.create.calculating_new_pbid') }}
        </v-alert>
        <item-claim-create
          v-if="initialClaimsLoaded"
          :for-create="true"
          :initial-claims="initialClaims"
          :table="table"
          @update-claims="updateClaims"
        />
        <v-row class="mt-2" density="comfortable">
          <v-spacer />
          <v-btn
            class="mt-4 mr-4"
            elevation="2"
            @click="cancel"
          >
            {{ t('common.cancel') }}
          </v-btn>
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <div v-bind="tooltipProps">
                <v-btn
                  class="mt-4"
                  elevation="2"
                  :disabled="isCreateDisabled || !isUserLogged"
                  @click="create"
                >
                  {{ t('common.create') }}
                </v-btn>
              </div>
            </template>
            <span class="text-no-wrap">
              {{ getCreateDisabledReason() || t('item.create.button.enabled') }}
            </span>
          </v-tooltip>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { applyClaimOverride, applyExtraClaimsOnSave, getDefaultDescription, planDefaultClaims } from '~/service/item-forms/engine.js'

const BIBLIOGRAPHY_LOCALE_MAP = { BETA: 'es', BITECA: 'ca', BITAGAP: 'pt' }

const props = defineProps({
  database: { type: String, required: true },
  table: { type: String, required: true }
})

const { $notification, $wikibase } = useNuxtApp()
const { t, locale, loadLocaleMessages } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const { notifyError } = useNotifyError()
const draft = useItemDraft(props.table)
const { groupByProperty } = useQualifierGrouping()
const itemForm = useItemForm()
const previousPathCookie = useCookie('previous-path', { path: '/', maxAge: 5 * 60 })

const label = ref('')
const initialClaimsLoaded = ref(false)
const initialClaims = ref([])
const claims = ref([])
const description = ref('')

// Label, description and alias must always be tagged/generated under the
// bibliography's own language, not the interface locale — otherwise a BETA
// item created with the English/Galician UI would get them stored as
// "en"/"gl" instead of "es" (#552, #559).
const entityLocale = computed(() => BIBLIOGRAPHY_LOCALE_MAP[props.database] || locale.value)

const isUserLogged = computed(() => authStore.isLogged)
const isCreateDisabled = computed(() => !!getCreateDisabledReason())
const pbid = computed(() => initialClaims.value.find(
  item => item.property.id === $wikibase.constructor.PROPERTY_PBID
)?.value)
const aliasValue = computed(() => {
  const val = pbid.value
  if (!val) return ''
  return typeof val === 'object' ? (val.datavalue?.value || '') : val
})

onMounted(() => {
  nextTick(() => {
    if (!isUserLogged.value || !props.database) {
      return router.push(localePath('/'))
    }
    const savedDraft = draft.load()
    if (savedDraft && savedDraft.database === props.database) {
      restoreDraft(savedDraft)
    } else {
      loadInitialClaims()
    }
  })
})

function restoreDraft (savedDraft) {
  label.value = savedDraft.label || ''
  description.value = savedDraft.description || ''
  initialClaims.value = savedDraft.initialClaims || []
  claims.value = generateClaimsData(initialClaims.value)
  initialClaimsLoaded.value = true
}

// Persist the in-progress form so it survives a session expiry + OAuth re-login.
function persistDraft () {
  if (!initialClaimsLoaded.value) return
  draft.save({
    database: props.database,
    label: label.value,
    description: description.value,
    initialClaims: initialClaims.value
  })
}

watch([label, description], persistDraft)

function loginAgain () {
  persistDraft()
  previousPathCookie.value = route.path
  $wikibase.$oauth.step1()
}

function cancel () {
  draft.clear()
  router.go(-1)
}

function getCreateDisabledReason () {
  const expectedLocale = BIBLIOGRAPHY_LOCALE_MAP[props.database]
  if (expectedLocale && ['es', 'ca', 'pt'].includes(locale.value) && locale.value !== expectedLocale) {
    return t('messages.error.inputs.language_mismatch')
  }

  if (!label.value) {
    return t('messages.error.inputs.label')
  }

  if (!initialClaimsLoaded.value) {
    return t('messages.error.inputs.initial_claims')
  }

  // Required-field derivation, the "at least one of" bibid name group, the
  // manid P843-on-edition conditional, and the global P799 date-completeness
  // rule all live in service/item-forms/ now (#527) -- every table is
  // registered there.
  return itemForm.validateRequired(props.table, initialClaims.value)
}

async function loadInitialClaims () {
  try {
    const res = await $wikibase.getTableLastItem(props.database, props.table)
    if (res?.length && res[0]) {
      await getDefaultClaims(res[0].item_number)
      await setDefaultDescription()
      initialClaimsLoaded.value = true
    }
  } catch (error) {
    notifyError(error)
  }
}

// @nuxtjs/i18n lazy-loads each locale's message bundle on demand: only the
// active UI locale (plus the "en" fallback) is guaranteed loaded. Requesting
// t(key, {}, { locale }) for the bibliography locale before it's loaded
// silently falls back to "en" text instead of throwing, so a BETA cnum item
// created with the English UI got English text stored under the "es" key.
// Force-load the target bundle first (#562).
async function setDefaultDescription () {
  const descriptionConfig = getDefaultDescription(itemForm.getItemForm(props.table))
  if (!descriptionConfig || description.value) return
  await loadLocaleMessages(entityLocale.value)
  if (description.value) return
  description.value = t(descriptionConfig.key, {}, { locale: entityLocale.value })
}

function getEntityLabel (entity) {
  const alt = $wikibase.getAlternativeLabel(props.table, entity, locale.value)
  return alt?.value || $wikibase.getValueByLang(entity.labels, locale.value)?.value || entity.id
}

function buildClaim (entity, qualifiers = [], value = null, removable = true) {
  return {
    default: true,
    removable,
    property: {
      label: getEntityLabel(entity),
      id: entity.id,
      datatype: entity.datatype
    },
    mainsnak: {
      property: entity.id
    },
    claimsValues: [],
    value: {
      property: entity.id,
      datatype: entity.datatype,
      datavalue: {
        default: true,
        value
      }
    },
    qualifiers
  }
}

function buildQualifier (_claim, qualifier) {
  return {
    default: true,
    property: {
      id: qualifier.id,
      label: getEntityLabel(qualifier),
      datatype: qualifier.datatype
    },
    datatype: qualifier.datatype,
    datavalue: {
      value: null
    }
  }
}

async function getDefaultClaims (itemNumber) {
  const form = itemForm.getItemForm(props.table)
  const wikiOrder = (await $wikibase.getClaimsOrderForNewItem(props.table)) || {}
  const plan = planDefaultClaims(form, {
    database: props.database,
    table: props.table,
    itemNumber,
    wikiOrder,
    now: new Date()
  })

  const entities = await $wikibase.getEntities(plan.propertyOrder, locale.value)
  const qualifiersArr = await $wikibase.getEntities(plan.qualifierPropertyIds, locale.value)

  Object.values(entities).forEach((entity) => {
    if (!isValidPropertyEntity(entity)) return

    const qualifiers = []
    wikiOrder[entity.id]?.forEach((property) => {
      if (isValidPropertyEntity(qualifiersArr[property])) {
        qualifiers.push(buildQualifier(entity, qualifiersArr[property]))
      }
    })

    const claim = buildClaim(entity, qualifiers, null)
    applyClaimOverride(claim, plan.overrides[entity.id], (qualifierPropertyId) => {
      const qualifierEntity = qualifiersArr[qualifierPropertyId]
      return isValidPropertyEntity(qualifierEntity) ? buildQualifier(entity, qualifierEntity) : null
    })

    initialClaims.value.push(claim)
  })

  initialClaims.value.sort((a, b) => {
    const ai = plan.propertyOrder.indexOf(a.property?.id)
    const bi = plan.propertyOrder.indexOf(b.property?.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function isValidPropertyEntity (entity) {
  return entity?.title?.startsWith('Property:') && entity?.labels
}

function updateClaims (data) {
  initialClaims.value = data
  claims.value = generateClaimsData(data)
  labelGenerationPromise = generateLabelFromClaims()
  persistDraft()
}

function generateClaimsData (data) {
  const result = {}
  const extractValue = v => v?.datavalue?.value?.id ?? v?.datavalue?.value

  const formatQualifiers = (qualifiers) => groupByProperty(
    qualifiers, q => q.property?.id ?? q.property, q => extractValue(q)
  )

  const formatReferences = (references) => (references || [])
    .map(r => ({ propertyId: r.property?.id ?? r.property, value: extractValue(r) }))
    .filter(r => r.propertyId && r.value != null && r.value !== '')
    .map(r => ({ [r.propertyId]: r.value }))

  const createClaim = (val, qualifiers = {}, references = []) => ({
    value: extractValue(val),
    qualifiers,
    references
  })

  data.forEach((claim) => {
    if (claim.property) {
      const claimKey = claim?.property?.id

      result[claimKey] = result[claimKey] || []

      result[claimKey].push(createClaim(claim.value, formatQualifiers(claim.qualifiers), formatReferences(claim.references)))

      const values = Object.values(claim.claimsValues || {}) || []
      values.forEach((v) => {
        result[claimKey].push(createClaim(v, formatQualifiers(v.qualifiers), formatReferences(v.references)))
      })
    }
  })
  return result
}

function cleanClaims (claimsToClean) {
  const cleanedClaims = {}

  for (const [propertyId, claimArray] of Object.entries(claimsToClean)) {
    const cleanedClaimArray = []

    for (const claim of claimArray) {
      const value = claim?.value
      if (value == null || value === '') {
        continue
      }

      const cleanedQualifiers = {}
      for (const [qualKey, qualVals] of Object.entries(claim.qualifiers || {})) {
        if (!qualKey || qualKey === 'null') {
          continue
        }
        const values = (Array.isArray(qualVals) ? qualVals : [qualVals])
          .filter(v => v != null && v !== 'null' && v !== '')
        if (values.length) {
          cleanedQualifiers[qualKey] = values
        }
      }

      const cleanedReferences = (claim.references || []).filter((refObj) => {
        const [k, v] = Object.entries(refObj)[0] || []
        return k && k !== 'null' && v != null && v !== 'null' && v !== ''
      })

      cleanedClaimArray.push({
        value,
        qualifiers: cleanedQualifiers,
        references: cleanedReferences
      })
    }

    if (cleanedClaimArray.length) {
      cleanedClaims[propertyId] = cleanedClaimArray
    }
  }

  return cleanedClaims
}

// Awaiting labelGenerationPromise once isn't enough: create() itself yields on
// getEntityFromPBID() below, and a claim edited during that window makes
// updateClaims() reassign labelGenerationPromise to a new in-flight generation.
// Loop until the observed promise reference is still the current one.
async function waitForCurrentLabelGeneration () {
  while (true) {
    const generation = labelGenerationPromise
    await generation
    if (generation === labelGenerationPromise) return
  }
}

async function create () {
  // Wait for any auto-generated-label lookup still in flight (e.g. the bibid
  // surname cascade), so we never submit a stale label read before it resolves.
  await waitForCurrentLabelGeneration()
  const existingPBID = await $wikibase.getEntityFromPBID(aliasValue.value)
  await waitForCurrentLabelGeneration()
  if (existingPBID === null) {
    try {
      const cleanedClaims = cleanClaims(claims.value)
      applyExtraClaimsOnSave(itemForm.getItemForm(props.table), cleanedClaims)

      const labels = { [entityLocale.value]: label.value }
      const descriptions = { [entityLocale.value]: description.value || ' ' }

      // Wikibase's default working language is English: without an "en" label
      // (and, for cnum, description), BETA/BITECA/BITAGAP items are hard to
      // find/read outside their own bibliography locale (#562).
      if (entityLocale.value !== 'en') {
        labels.en = label.value
        const descriptionConfig = getDefaultDescription(itemForm.getItemForm(props.table))
        if (descriptionConfig?.duplicateInEnglish) {
          descriptions.en = t(descriptionConfig.key, {}, { locale: 'en' })
        }
      }

      const aliases = { [entityLocale.value]: [aliasValue.value] }

      // Manuscripts/editions are hard to find because the label leads with
      // city/library, not the shelfmark: manid/copid's P10 alias hook adds it
      // as an alias -- duplicated under "en" the same way labels are (#562)
      // -- making them searchable by shelfmark too (#571). Resolves to []
      // when P10 is absent, matching the existing items backfilled via
      // QuickStatements.
      const extraAliases = await itemForm.getAliases(props.table, initialClaims.value, entityLocale.value)
      for (const value of extraAliases) {
        aliases[entityLocale.value].push(value)
        if (entityLocale.value !== 'en') {
          aliases.en = [value]
        }
      }

      const data = {
        labels,
        descriptions,
        aliases,
        claims: {
          ...cleanedClaims
        }
      }

      const response = await $wikibase.getWbEdit().entity.create(data, authStore.requestConfig)

      if (!response.success) {
        throw response
      }

      draft.clear()
      await router.push(localePath({
        path: '/item/' + response.entity.id,
        query: { justCreated: 'true' }
      }))
    } catch (error) {
      if (!isSessionExpired(error)) {
        draft.clear()
      }
      notifyError(error)
    }
  } else {
    $notification.error(t('messages.error.creation.pbid_already_exists', {
      pbid: aliasValue.value,
      item: `&nbsp;<a target="_blank" style="color: #ffffff; font-weight: bold;" href="${$wikibase.getQItemUrl(existingPBID)}">${existingPBID}</a>`
    }))
  }
}

let labelGenerationToken = 0
let labelGenerationPromise = Promise.resolve()

// Label generation lives in service/item-forms/ now (#527) -- every table is
// registered there. The token/promise pair guards against an in-flight
// lookup (e.g. bibid's async surname cascade) resolving after a newer one
// already updated the label.
async function generateLabelFromClaims () {
  const token = ++labelGenerationToken
  const generatedLabel = (await itemForm.generateLabel(props.table, initialClaims.value, entityLocale.value)) || ''
  if (token !== labelGenerationToken) return
  if (generatedLabel) {
    label.value = generatedLabel
  }
}
</script>

