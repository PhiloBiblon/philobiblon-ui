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
import { WikibaseService } from '~/service/wikibase.service'

const BIBLIOGRAPHY_LOCALE_MAP = { BETA: 'es', BITECA: 'ca', BITAGAP: 'pt' }

const props = defineProps({
  database: { type: String, required: true },
  table: { type: String, required: true }
})

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const { notifyError } = useNotifyError()
const draft = useItemDraft(props.table)
const previousPathCookie = useCookie('previous-path', { path: '/', maxAge: 5 * 60 })

const label = ref('')
const initialClaimsLoaded = ref(false)
const initialClaims = ref([])
const claims = ref([])
const description = ref('')

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

  const requiredPropertyIds = new Set(['P2', 'P476'])
  if (props.table === 'manid') requiredPropertyIds.add('P329')
  if (props.table === 'cnum') { requiredPropertyIds.add('P590'); requiredPropertyIds.add('P8') }
  if (props.table === 'copid') { requiredPropertyIds.add('P839'); requiredPropertyIds.add('P329') }
  if (props.table === 'geoid') requiredPropertyIds.add('P34')
  if (props.table === 'insid') { requiredPropertyIds.add('P34'); requiredPropertyIds.add('P297') }
  if (props.table === 'libid') { requiredPropertyIds.add('P34'); requiredPropertyIds.add('P47') }
  if (props.table === 'subid' || props.table === 'bioid') requiredPropertyIds.add('P34')
  if (props.table === 'texid') { requiredPropertyIds.add('P21'); requiredPropertyIds.add('P11') }

  if (props.table === 'bibid') {
    const hasName = ['P247', 'P21', 'P845', 'P1134'].some(p => {
      const arr = claims.value[p]
      return Array.isArray(arr) && arr.length > 0 && arr[0]?.value != null && arr[0]?.value !== ''
    })
    if (!hasName) {
      const propertyLabel = initialClaims.value.find(c => c.property?.id === 'P247')?.property?.label || 'P247'
      return t('messages.error.inputs.claim_value_missing', { propertyLabel })
    }
    requiredPropertyIds.add('P11')
  }

  if (props.table === 'manid') {
    const p2Array = claims.value['P2']
    const isEdition = Array.isArray(p2Array) && p2Array.some(c => c?.value === 'Q20')
    if (isEdition) {
      const p843Array = claims.value['P843']
      const p843Label = initialClaims.value.find(c => c.property?.id === 'P843')?.property?.label || 'P843'
      if (!Array.isArray(p843Array) || !p843Array.some(c => c?.value != null && c?.value !== '')) {
        return t('messages.error.inputs.claim_value_missing', { propertyLabel: p843Label })
      }
    }
  }

  for (const propKey of requiredPropertyIds) {
    const claimArray = claims.value[propKey]
    const initialClaim = initialClaims.value.find(c => c.property?.id === propKey)
    const propertyLabel = initialClaim?.property?.label || propKey

    const hasValue = Array.isArray(claimArray) && claimArray.some(item => item?.value != null && item?.value !== '')
    if (!hasValue) {
      return t('messages.error.inputs.claim_value_missing', { propertyLabel })
    }
  }

  for (const [propertyId, claimArray] of Object.entries(claims.value)) {
    if (propertyId === 'P799') {
      const initialClaim = initialClaims.value.find(ic => ic.property?.id === propertyId)
      const propertyLabel = initialClaim?.property?.label || propertyId
      for (const item of claimArray) {
        if (item?.value == null || item?.value === '') {
          continue
        }
        const dateQualifier = item?.qualifiers?.P106
        if (dateQualifier == null || !isCompleteDate(dateQualifier)) {
          return t('messages.error.inputs.incomplete_date', { propertyLabel })
        }
      }
    }
  }

  return null
}

function isCompleteDate (value) {
  if (typeof value === 'object' && value !== null) {
    return value.precision === 11
  }
  if (typeof value === 'string') {
    return /^[+-]?\d{4}-\d{2}-\d{2}/.test(value)
  }
  return false
}

async function loadInitialClaims () {
  try {
    const res = await $wikibase.getTableLastItem(props.database, props.table)
    if (res?.length && res[0]) {
      await getDefaultClaims(res[0].item_number)
      setDefaultDescription()
      initialClaimsLoaded.value = true
    }
  } catch (error) {
    notifyError(error)
  }
}

function setDefaultDescription () {
  if (props.table === 'cnum' && !description.value) {
    description.value = t('item.cnum_description')
  }
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
  const def = ['P476', 'P131', 'P799']
  const res = await $wikibase.getClaimsOrderForNewItem(props.table)
  const safeRes = res || {}
  const resKeys = Object.keys(safeRes)
  const defOnly = def.filter(p => !resKeys.includes(p))
  const defWithoutP799 = defOnly.filter(p => p !== 'P799')
  const trailingP799 = defOnly.includes('P799') ? ['P799'] : []
  const propertyIds = [...new Set([...defWithoutP799, ...resKeys, ...trailingP799])]
  const qualifiersProperties = [...new Set(['P700', 'P106', ...Object.values(safeRes).flat()])]
  const entities = await $wikibase.getEntities(propertyIds, locale.value)
  const qualifiersArr = await $wikibase.getEntities(qualifiersProperties, locale.value)

  Object.values(entities).forEach((entity) => {
    if (isValidPropertyEntity(entity)) {
      const qualifiers = []

      safeRes[entity.id]?.forEach((property) => {
        if (isValidPropertyEntity(qualifiersArr[property])) {
          qualifiers.push(buildQualifier(entity, qualifiersArr[property]))
        }
      })

      let claim = buildClaim(entity, qualifiers, null)

      if (entity.id === 'P476') {
        claim = buildClaim(entity, [], generatePbId(itemNumber), false)
      } else if (entity.id === 'P131') {
        const bibliographyId = WikibaseService.BIBLIOGRAPHY_MAP[props.database] || null

        const bibliographyQualifiers = [
          buildQualifier(entity, qualifiersArr['P700'])
        ]
        bibliographyQualifiers[0].datavalue.value = { id: 'Q447226' }

        claim = buildClaim(entity, bibliographyQualifiers, bibliographyId ? { id: bibliographyId } : null)
      } else if (entity.id === 'P799') {
        const today = new Date()
        const yyyy = String(today.getFullYear()).padStart(4, '0')
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        let dateQualifier = qualifiers.find(q => q.property?.id === 'P106')
        if (!dateQualifier && isValidPropertyEntity(qualifiersArr['P106'])) {
          dateQualifier = buildQualifier(entity, qualifiersArr['P106'])
          qualifiers.push(dateQualifier)
        }
        if (dateQualifier) {
          dateQualifier.datavalue.value = {
            time: `+${yyyy}-${mm}-${dd}T00:00:00Z`,
            precision: 11,
            calendar: 'gregorian'
          }
          dateQualifier.hidden = true
        }
        if (props.table === 'geoid' || props.table === 'bioid') {
          claim = buildClaim(entity, qualifiers, { id: 'Q447227' })
          claim.hidden = true
        } else {
          claim = buildClaim(entity, qualifiers, null)
        }
      } else if (props.table === 'cnum' && entity.id === 'P590') {
        claim = buildClaim(entity, qualifiers, null, false)
      } else if (props.table === 'copid' && entity.id === 'P839') {
        claim = buildClaim(entity, qualifiers, null, false)
      }

      initialClaims.value.push(claim)
    }
  })

  initialClaims.value.sort((a, b) => {
    const ai = propertyIds.indexOf(a.property?.id)
    const bi = propertyIds.indexOf(b.property?.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function isValidPropertyEntity (entity) {
  return entity?.title?.startsWith('Property:') && entity?.labels
}

function generatePbId (lastItemPbId) {
  return `${props.database} ${props.table} ${parseInt(lastItemPbId) + 1}`
}

function updateClaims (data) {
  initialClaims.value = data
  claims.value = generateClaimsData(data)
  generateLabelFromClaims()
  persistDraft()
}

function generateClaimsData (data) {
  const result = {}
  data.forEach((claim) => {
    if (claim.property) {
      const claimKey = claim?.property?.id

      result[claimKey] = result[claimKey] || []
      const extractValue = v => v?.datavalue?.value?.id ?? v?.datavalue?.value

      const createClaim = (val, qualifiers = {}) => ({
        value: extractValue(val),
        qualifiers
      })

      const qualifiers = Object.fromEntries(
        (claim.qualifiers || []).map(q => [q.property?.id ?? q.property, extractValue(q)])
      )

      result[claimKey].push(createClaim(claim.value, qualifiers))

      const values = Object.values(claim.claimsValues || {}) || []
      values.forEach((v) => {
        result[claimKey].push(createClaim(v))
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
      for (const [qualKey, qualVal] of Object.entries(claim.qualifiers || {})) {
        if (
          qualKey &&
          qualKey !== 'null' &&
          qualVal != null &&
          qualVal !== 'null' &&
          qualVal !== ''
        ) {
          cleanedQualifiers[qualKey] = qualVal
        }
      }

      cleanedClaimArray.push({
        value,
        qualifiers: cleanedQualifiers
      })
    }

    if (cleanedClaimArray.length) {
      cleanedClaims[propertyId] = cleanedClaimArray
    }
  }

  return cleanedClaims
}

// Ui_ControlledVocabulary only supports one default value per property, so Q453706
// (WEMI Item, required for editions alongside Q453705 Manifestation) cannot be
// expressed as a second P843 default in wiki config — it must be injected here.
function addManidEditionFrbrClaim (cleanedClaims) {
  const p2Claims = cleanedClaims['P2'] || []
  const isEdition = p2Claims.some(c => c.value === 'Q20')
  if (!isEdition) return
  const p843Claims = cleanedClaims['P843']
  if (!p843Claims?.length) return
  if (!p843Claims.some(c => c.value === 'Q453706')) {
    p843Claims.push({ value: 'Q453706', qualifiers: {} })
  }
}

async function create () {
  const existingPBID = await $wikibase.getEntityFromPBID(aliasValue.value)
  if (existingPBID === null) {
    try {
      const cleanedClaims = cleanClaims(claims.value)
      if (props.table === 'manid') addManidEditionFrbrClaim(cleanedClaims)

      const data = {
        labels: {
          [locale.value]: label.value
        },
        descriptions: {
          [locale.value]: description.value || ' '
        },
        aliases: {
          [locale.value]: aliasValue.value
        },
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

function formatTime (raw) {
  const cleaned = raw.replace(/^\+/, '')
  const date = new Date(cleaned)
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

function safeFormatTime (timeString) {
  if (!timeString || typeof timeString !== 'string' || !timeString.trim()) {
    return undefined
  }
  const datePattern = /^[+-]?\d{4}-\d{2}-\d{2}/
  if (!datePattern.test(timeString)) {
    return undefined
  }
  try {
    return formatTime(timeString)
  } catch {
    return undefined
  }
}

function getClaimValue (claimPbid) {
  const claim = initialClaims.value.find(cl => cl.property?.id === claimPbid)
  const val = claim?.value?.datavalue?.value

  if (!val) {
    return null
  }
  if (typeof val === 'object') {
    if (val.time !== undefined) {
      const formatted = safeFormatTime(val.time)
      return val.label || val.text || formatted || val.id
    }
    return val.label || val.text || val.id
  }
  return val
}

function getQualifierValue (claimId, qualifierId) {
  const claim = initialClaims.value.find(cl => cl.property?.id === claimId)
  const qualifier = claim?.qualifiers?.find(q => q.property?.id === qualifierId)
  const val = qualifier?.datavalue?.value
  if (!val) return null
  if (typeof val === 'object') {
    return val.label || val.text || val.id
  }
  return val
}

function getManidPrefix () {
  const claim = initialClaims.value.find(cl => cl.property?.id === 'P2')
  const p2Id = claim?.value?.datavalue?.value?.id
  if (p2Id === 'Q15') return 'MS: '
  if (p2Id === 'Q20') return 'Ed.: '
  return ''
}

function getBibidDate () {
  const claim = initialClaims.value.find(cl => cl.property?.id === 'P49')
  const val = claim?.value?.datavalue?.value
  if (!val) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val.time) {
    const match = val.time.replace(/^\+/, '').match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!match) return null
    if (val.precision >= 11) return `${match[1]}-${match[2]}-${match[3]}`
    if (val.precision >= 10) return `${match[1]}-${match[2]}`
    return match[1]
  }
  return null
}

function generateLabelFromClaims () {
  let generatedLabel = ''
  switch (props.table) {
    case 'texid': {
      const author = getClaimValue('P21')
      const title = getClaimValue('P11')
      if (author && title) {
        generatedLabel = `${author}, ${title}`
      }
      break
    }
    case 'cnum': {
      const work = getClaimValue('P590')
      const partOf = getClaimValue('P8')
      if (work && partOf) {
        generatedLabel = `${work}, ${partOf}`
      }
      break
    }
    case 'bibid': {
      const surname = getClaimValue('P247')
      const author = getClaimValue('P21')
      const creator = getClaimValue('P845')
      const title = getClaimValue('P11')
      const date = getBibidDate()

      const usesP845Creator = !surname && !author && Boolean(creator)
      const name = surname || author || creator || getClaimValue('P1134')

      if (name && title) {
        const role = usesP845Creator ? getQualifierValue('P845', 'P820') : null
        const rolePart = role ? ` (${role})` : ''
        const datePart = date ? ` (${date})` : ''
        generatedLabel = `${name}${rolePart}${datePart}, ${title}`
      }
      break
    }
    case 'bioid': {
      const name = getClaimValue('P34')
      if (name) {
        generatedLabel = name
      }
      break
    }
    case 'manid': {
      const holding = getClaimValue('P329')
      if (holding) {
        const prefix = getManidPrefix()
        const position = getClaimValue('P10') || getQualifierValue('P329', 'P10')
        generatedLabel = position ? `${prefix}${holding}, ${position}` : `${prefix}${holding}`
      }
      break
    }
    case 'copid': {
      const holding = getClaimValue('P329')
      const edition = getClaimValue('P839')
      if (holding && edition) {
        const position = getClaimValue('P10') || getQualifierValue('P329', 'P10')
        generatedLabel = position
          ? `${edition}. ${holding}, ${position}`
          : `${edition}. ${holding}`
      }
      break
    }
    case 'geoid': {
      const name = getClaimValue('P34')
      const region = getClaimValue('P297')
      if (name) {
        generatedLabel = region ? `${name}, ${region}` : name
      }
      break
    }
    case 'insid': {
      const name = getClaimValue('P34')
      const region = getClaimValue('P297')
      if (name && region) {
        generatedLabel = `${name}, ${region}`
      }
      break
    }
    case 'libid': {
      const name = getClaimValue('P34')
      const location = getClaimValue('P47')
      if (name && location) {
        generatedLabel = `${name}, ${location}`
      }
      break
    }
    case 'subid': {
      const name = getClaimValue('P34')
      if (name) {
        generatedLabel = name
      }
      break
    }
    default:
      break
  }

  if (generatedLabel) {
    label.value = generatedLabel
  }
}
</script>

