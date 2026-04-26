<template>
  <div class="create-qualifier">
    <v-row
      v-for="(qualifier, key) in qualifiers"
      :key="key"
      align="center"
      class="even-row pt-3"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-autocomplete
          v-model="qualifier.property"
          :label="t('common.property')"
          required
          return-object
          :readonly="qualifier?.default"
          :items="properties[key]"
          item-title="label"
          item-value="id"
          variant="underlined"
          density="compact"
          :filter="acceptAll"
          @update:model-value="onChangeProperty($event, key)"
          @update:search="onInput($event, 'property', key)"
        />
      </v-col>
      <v-col class="p-0 pr-3">
        <div v-if="claim?.mainsnak?.property || qualifier.default">
          <item-value-base
            :key="`${qualifier.property?.id ?? qualifier.property}-${key}`"
            :label="t('common.value')"
            :claim="claim"
            :value="qualifier"
            type="qualifier"
            mode="creation"
            @on-blur="onNewValue($event, qualifier)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end align-center max-w-100">
        <v-btn
          v-if="allowCreateQualifier(qualifier)"
          variant="text"
          icon
          density="compact"
          class="action-btn"
          @click.stop="createQualifier(key)"
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
          v-if="claim"
          variant="text"
          icon
          density="compact"
          class="action-btn"
          @click.stop="removeQualifier(key)"
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
    </v-row>
    <v-row
      v-if="isAllowedAddQualifier"
      class="add-qualifier pr-5"
      justify="end"
    >
      <a role="button" class="link" @click="addQualifier">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ t("common.add_qualifier") }}</span>
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
  claim: { type: Object, default: null },
  initialQualifiers: { type: Array, default: null },
  forCreate: { type: Boolean, default: false }
})

const emit = defineEmits(['update-qualifiers', 'create-qualifier'])

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const properties = reactive([])
const qualifiers = reactive([])
const propertyValues = reactive([])

const isAllowedAddQualifier = computed(() => props.claim && props.claim.mainsnak.property !== WikibaseService.PROPERTY_NOTES)

if (props.initialQualifiers) {
  props.initialQualifiers.forEach((qualifier, index) => {
    properties[index] = [qualifier.property]
    qualifiers.push(qualifier)
  })
}

watch(qualifiers, (val) => {
  if (!props.claim || props.forCreate) {
    emit('update-qualifiers', val)
  }
}, { deep: true })

function allowCreateQualifier (qualifier) {
  const propertyId = qualifier.property?.id || qualifier.property
  return props.claim && !props.forCreate && propertyId && qualifier.datavalue?.value !== undefined && qualifier.datavalue?.value !== null
}

function onNewValue (event, qualifier) {
  qualifier.datavalue.value = event
}

function onChangeProperty (event, index) {
  const qualifier = qualifiers[index]
  qualifier.property = event ? { id: event.id, label: event.label, datatype: event.datatype } : null
  qualifier.datatype = event?.datatype
  qualifier.datavalue = { value: null }
}

function addQualifier () {
  qualifiers.push({
    property: null,
    datatype: null,
    datavalue: { value: null }
  })
}

function removeQualifier (index) {
  qualifiers.splice(index, 1)
  properties.splice(index, 1)
  propertyValues.splice(index, 1)
}

async function onInput (value, type, index) {
  if (value && typeof value === 'string') {
    const search = await $wikibase.searchEntityByName(value, locale.value, locale.value, type)
    if (search && search.length) {
      if (type === 'property') {
        properties[index] = search
      } else {
        propertyValues[index] = search
      }
    }
  }
}

async function createQualifier (index) {
  const qualifier = qualifiers[index]
  const propertyId = qualifier.property?.id || qualifier.property
  await $wikibase.getWbEdit().qualifier.add({
    guid: props.claim.id,
    value: qualifier.datavalue.value.id ?? qualifier.datavalue.value,
    property: propertyId
  }, authStore.requestConfig).then((res) => {
    if (res.success) {
      updateQualifiers(res.claim.qualifiers[propertyId])
      removeQualifier(index)
      $notification.success(t('messages.success.updated'))
    } else {
      $notification.error(t('messages.error.something_went_wrong'))
    }
  }).catch((error) => {
    $notification.error(error)
  })
}

function updateQualifiers (qs) {
  emit('create-qualifier', qs)
}

function acceptAll () {
  return true
}
</script>

<style scoped>
.add-qualifier {
  margin-top: 12px;
  margin-bottom: 5px;
}
.create-qualifier {
  padding: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
:deep(.v-text-field__details) {
  display: none;
}
:deep(.v-input__details) {
  display: none;
}
:deep(.v-autocomplete .v-field__input) {
  min-height: 28px !important;
  padding-bottom: 0 !important;
}
</style>
