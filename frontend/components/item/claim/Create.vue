<template>
  <div class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="claim?.property?.id"
      class="even-row text-center pt-5"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3 mt-3">
        <div class="claim-header text-grey">
          <v-autocomplete
            v-model="claim.property"
            required
            :readonly="claim?.default"
            :items="properties[key]"
            item-title="label"
            return-object
            :label="t('common.property')"
            variant="outlined"
            density="compact"
            :filter="acceptAll"
            @update:model-value="onChangeProperty($event, claim)"
            @update:search="onInput($event, 'property', key)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="!forCreate" :disabled="!canCreate(key)" variant="text" icon @click.stop="addClaim(key)">
          <v-tooltip location="top">
            <template #activator="{ props: btnProps }">
              <v-icon v-bind="btnProps">
                mdi-check
              </v-icon>
            </template>
            <span>{{ t("common.save") }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn v-if="claim?.property?.id !== pbid" variant="text" icon @click.stop="removeClaim(key)">
          <v-tooltip location="top">
            <template #activator="{ props: btnProps }">
              <v-icon v-bind="btnProps">
                mdi-trash-can
              </v-icon>
            </template>
            <span>{{ t("common.remove") }}</span>
          </v-tooltip>
        </v-btn>
      </v-col>
      <v-container class="claim-values elevation-1">
        <div v-if="claim?.property?.id || claim.default">
          <item-value-base
            :key="`${claim.property?.id}-${key}`"
            :claim="claim"
            :value="claim.value"
            type="claim"
            mode="creation"
            @new-value="onNewValue($event, claim)"
          />
          <item-qualifier-create
            :key="claim?.property?.id"
            :claim="claim"
            :for-create="forCreate"
            :initial-qualifiers="claim.qualifiers"
            @update-qualifiers="updateQualifiers($event, key)"
          />
        </div>
      </v-container>
      <item-claim-add-value
        v-if="forCreate"
        :key="key"
        class="add-claim-value mb-2"
        :item="item"
        :value="claim.value"
        :for-create="forCreate"
        @update-claims-values="updateClaimValues($event, key)"
      />
    </v-row>
    <v-row class="back pr-5 mb-2 mt-2" justify="end">
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
  forCreate: { type: Boolean, default: false }
})

const emit = defineEmits(['update-claims'])

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const claims = reactive([])
const properties = reactive([])

const pbid = computed(() => WikibaseService.PROPERTY_PBID)

if (props.initialClaims) {
  props.initialClaims.forEach((claim, index) => {
    properties[index] = [claim.property]
    claims.push(claim)
  })
}

watch(claims, (newValue) => {
  if (props.forCreate) {
    emit('update-claims', newValue)
  }
}, { deep: true })

function onChangeProperty (property, claim) {
  claim.property = property ?? null
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

  return !!(c?.property && v && (typeof v !== 'object' || Object.values(v).every(val => val != null && val !== '')) &&
    c.qualifiers?.every(q =>
      q?.property && q?.value &&
      (typeof q.value === 'string' ? q.value.trim() : Object.values(q.value).every(vv => vv != null && vv !== ''))
    ))
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
    qualifiers: []
  })
}

function removeClaim (index) {
  claims.splice(index, 1)
  properties.splice(index, 1)
}

async function onInput (value, type, index) {
  if (value && typeof value === 'string') {
    const search = await $wikibase.searchEntityByName(value, locale.value, locale.value, type)
    if (search && search.length) {
      properties[index] = search
    }
  }
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
        $notification.error(t('messages.error.something_went_wrong'))
      }
    }).catch((error) => {
      $notification.error(error.message)
    })
  }
}

async function createClaim (index) {
  const { property, value, qualifiers: rawQualifiers } = claims[index]

  const formattedQualifiers = Object.fromEntries(
    (rawQualifiers || [])
      .filter(q => q.property && q.value)
      .map(({ property: p, value: v }) => [p, { value: v }])
  )

  return await $wikibase.getWbEdit().claim.create({
    id: props.item.id,
    property: property.id,
    value: value.datavalue.value.id ?? value.datavalue.value,
    qualifiers: Object.keys(formattedQualifiers).length ? formattedQualifiers : undefined
  }, authStore.requestConfig)
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
.claim-values {
  background-color: rgb(247, 245, 245);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
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
</style>
