<template>
  <div class="all-width">
    <v-container>
      <v-row class="back">
        <a class="link" @click="router.go(-1)">
          <v-tooltip location="right">
            <template #activator="{ props: tooltipProps }">
              <v-icon color="primary" v-bind="tooltipProps">
                mdi-reply
              </v-icon>
            </template>
            <span>{{ t('item.back') }}</span>
          </v-tooltip>
        </a>
      </v-row>
      <template v-if="isUserLogged">
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
          @update-claims="updateClaims"
        />
        <v-row class="mt-2" dense>
          <v-spacer />
          <v-btn
            class="mt-4 mr-2"
            color="grey"
            size="small"
            elevation="2"
            variant="outlined"
            @click="router.go(-1)"
          >
            {{ t('common.cancel') }}
          </v-btn>
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <div v-bind="tooltipProps">
                <v-btn
                  class="mt-4"
                  color="primary"
                  size="small"
                  elevation="2"
                  :disabled="isCreateDisabled"
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
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  database: { type: String, required: true },
  table: { type: String, required: true }
})

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()

const label = ref('')
const initialClaimsLoaded = ref(false)
const initialClaims = ref([])
const claims = ref([])
const description = ref('')

const isUserLogged = computed(() => authStore.isLogged)
const isCreateDisabled = computed(() => !!getCreateDisabledReason())
const pbid = computed(() => initialClaims.value.find(
  item => item.property.id === $wikibase.constructor.PROPERTY_PBID
).value)

onMounted(() => {
  nextTick(() => {
    if (!isUserLogged.value || !props.database) {
      return router.push(localePath('/'))
    } else {
      loadInitialClaims()
    }
  })
})

function getCreateDisabledReason () {
  if (!label.value) {
    return t('messages.error.inputs.label')
  }

  if (!initialClaimsLoaded.value) {
    return t('messages.error.inputs.initial_claims')
  }

  const claimsEntries = Object.entries(claims.value)

  for (let propIndex = 0; propIndex < claimsEntries.length; propIndex++) {
    const [, claimArray] = claimsEntries[propIndex]
    const initialClaim = initialClaims.value[propIndex]
    const propertyLabel = initialClaim?.property?.label

    if (
      initialClaim?.property?.id === 'P2' ||
      initialClaim?.property?.id === 'P476' ||
      (props.table === 'cnum' && initialClaim?.property?.id === 'P590') ||
      (props.table === 'copid' && initialClaim?.property?.id === 'P839')
    ) {
      for (const item of claimArray) {
        if (item?.value == null || item?.value === '') {
          return t('messages.error.inputs.claim_value_missing', { propertyLabel })
        }

        const claimLabel = initialClaim?.value?.datavalue?.value?.label || propertyLabel

        for (const [qualifierKey, qualifierVal] of Object.entries(item.qualifiers || {})) {
          if (!qualifierKey || qualifierKey === 'null') {
            return t('messages.error.inputs.qualifier_key_missing', { claimLabel, propertyLabel })
          }
          if (!qualifierVal || qualifierVal === 'null') {
            return t('messages.error.inputs.qualifier_value_missing', { claimLabel, propertyLabel })
          }
        }
      }
    }
  }

  return null
}

async function loadInitialClaims () {
  try {
    const res = await $wikibase.getTableLastItem(props.database, props.table)
    if (res?.length && res[0]) {
      await getDefaultClaims(res[0].item_number)
      initialClaimsLoaded.value = true
    }
  } catch (error) {
     
    console.error(error)
    $notification.error(
      error?.body?.error?.info || t('messages.error.something_went_wrong')
    )
  }
}

function buildClaim (entity, qualifiers = [], value = null, removable = true) {
  const lbl = $wikibase.getValueByLang(entity.labels, locale.value)?.value || entity.id
  return {
    default: true,
    removable,
    property: {
      label: lbl,
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

function buildQualifier (claim, qualifier) {
  const lbl = $wikibase.getValueByLang(qualifier.labels, locale.value)?.value || qualifier.id
  return {
    default: true,
    property: {
      id: qualifier.id,
      label: lbl,
      datatype: qualifier.datatype
    },
    datatype: qualifier.datatype,
    datavalue: {
      value: null
    }
  }
}

async function getDefaultClaims (itemNumber) {
  const def = ['P476', 'P131']
  const res = await $wikibase.getClaimsOrderForNewItem(props.table)
  const propertyIds = [...new Set([...def, ...Object.keys(res)])]
  const qualifiersProperties = [...new Set(Object.values(res).flat())]
  const entities = await $wikibase.getEntities(propertyIds, locale.value)
  const qualifiersArr = await $wikibase.getEntities(qualifiersProperties, locale.value)

  Object.values(entities).forEach((entity) => {
    if (isValidPropertyEntity(entity)) {
      const qualifiers = []

      res[entity.id]?.forEach((property) => {
        if (isValidPropertyEntity(qualifiersArr[property])) {
          qualifiers.push(buildQualifier(entity, qualifiersArr[property]))
        }
      })

      let claim = buildClaim(entity, qualifiers, null)

      if (entity.id === 'P476') {
        claim = buildClaim(entity, [], generatePbId(itemNumber), false)
      } else if (entity.id === 'P131') {
        const bibliographyMap = {
          BETA: 'Q254471',
          BITECA: 'Q256810',
          BITAGAP: 'Q256809'
        }
        const bibliographyId = bibliographyMap[props.database] || null

        const bibliographyQualifiers = [
          {
            default: true,
            property: 'P700',
            datatype: 'wikibase-item',
            datavalue: {
              value: {
                id: 'Q447226'
              }
            }
          }
        ]

        claim = buildClaim(entity, bibliographyQualifiers, bibliographyId ? { id: bibliographyId } : null)
      } else if (props.table === 'cnum' && entity.id === 'P590') {
        claim = buildClaim(entity, qualifiers, null, false)
      } else if (props.table === 'copid' && entity.id === 'P839') {
        claim = buildClaim(entity, qualifiers, null, false)
      }

      initialClaims.value.push(claim)
    }
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
        (claim.qualifiers || []).map(q => [q.property, extractValue(q)])
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

async function create () {
  const existingPBID = await $wikibase.getEntityFromPBID(pbid.value)
  if (existingPBID === null) {
    try {
      const cleanedClaims = cleanClaims(claims.value)

      const data = {
        labels: {
          [locale.value]: label.value
        },
        descriptions: {
          [locale.value]: description.value || ' '
        },
        claims: {
          ...cleanedClaims
        }
      }

      const response = await $wikibase.getWbEdit().entity.create(data, authStore.requestConfig)

      if (response.success) {
        await router.push(localePath('/item/' + response.entity.id))
      } else {
        $notification.error(t('messages.error.something_went_wrong'))
      }
    } catch (error) {
      $notification.error(
        error.body.error.info ?? t('messages.error.something_went_wrong')
      )
    }
  } else {
    $notification.error(t('messages.error.creation.pbid_already_exists', {
      pbid: pbid.value,
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
    day: 'numeric'
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

function generateLabelFromClaims () {
  let generatedLabel = ''
  switch (props.table) {
    case 'texid': {
      const author = getClaimValue('P21')
      const title = getClaimValue('P11')
      if (author && title) {
        generatedLabel = `${author}. ${title}`
      }
      break
    }
    case 'cnum': {
      const work = getClaimValue('P590')
      const partOf = getClaimValue('P8')
      if (work && partOf) {
        generatedLabel = `Witness of ${work}, part of ${partOf}`
      }
      break
    }
    case 'bibid': {
      const surname = getClaimValue('P247')
      const author = getClaimValue('P21')
      const creator = getClaimValue('P1134')
      const title = getClaimValue('P11')
      const date = getClaimValue('P222')

      const name = surname || author || creator

      if (name && title) {
        const datePart = date ? ` (${date})` : ''
        generatedLabel = `${name}${datePart}, ${title}`
      }
      break
    }
    case 'bioid': {
      const fallbackProps = ['P34', 'P77', 'P173', 'P291', 'P165', 'P746']
      for (const bioPbid of fallbackProps) {
        const val = getClaimValue(bioPbid)
        if (val) {
          generatedLabel = val
          break
        }
      }
      break
    }
    case 'manid': {
      const holding = getClaimValue('P329')
      const position = getClaimValue('P10')
      if (holding && position) {
        generatedLabel = `${holding}, ${position}`
      }
      break
    }
    case 'copid': {
      const holding = getClaimValue('P329')
      const position = getClaimValue('P10')
      const edition = getClaimValue('P839')
      if (holding && position && edition) {
        generatedLabel = `${holding}, ${position} (${edition})`
      }
      break
    }
    case 'geoid':
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

  label.value = generatedLabel || ''
}
</script>

<style scoped>
.all-width {
  max-width: 100% !important;
}
.link {
  text-decoration: none;
}
.back {
  font-size: 12px;
  height: 25px;
}
</style>
