<template>
  <div class="create-reference">
    <v-row
      v-for="(reference, key) in references"
      :key="key"
      align="center"
      class="even-row"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-autocomplete
          v-model="reference.property"
          :label="t('common.property')"
          required
          return-object
          :items="properties[key]"
          item-title="label"
          item-value="id"
          variant="outlined"
          density="compact"
          :filter="acceptAll"
          @update:model-value="onChangeProperty($event, key)"
          @update:search="onInput($event, 'property', key)"
        />
      </v-col>
      <v-col class="p-0 pr-3 pt-3">
        <div v-if="reference.property">
          <item-value-base
            :key="`${key}-${reference.property}`"
            :label="t('common.value')"
            :claim="claim"
            :value="reference"
            type="reference"
            mode="creation"
            @new-value="onNewValue($event, reference)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn
          variant="text"
          icon
          :disabled="!reference.property || !reference?.datavalue?.value"
          @click.stop="createReference(key)"
        >
          <v-tooltip location="top">
            <template #activator="{ props: btnProps }">
              <v-icon v-bind="btnProps">
                mdi-check
              </v-icon>
            </template>
            <span>{{ t("common.save") }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn v-if="claim" variant="text" icon @click.stop="removeReference(key)">
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
    </v-row>
    <v-row
      class="add-reference pr-5"
      justify="end"
    >
      <a role="button" class="link" @click="addReference">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ !value ? t("common.add_reference") : t("common.add") }}</span>
        </div>
      </a>
    </v-row>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  claim: { type: Object, required: true },
  value: { type: Object, default: null }
})

const emit = defineEmits(['update-references', 'create-reference'])

const { $notification, $wikibase } = useNuxtApp()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const properties = reactive([])
const references = reactive([])
const propertyValues = reactive([])

watch(references, (val) => {
  if (!props.claim) {
    emit('update-references', val)
  }
}, { deep: true })

function onNewValue (event, reference) {
  reference.datavalue.value = event
}

function onChangeProperty (event, index) {
  const reference = references[index]
  reference.property = event.id
  reference.datatype = event.datatype
  reference.datavalue = { value: null }
}

function addReference () {
  references.push({
    property: null,
    type: null,
    datavalue: { value: null }
  })
}

function removeReference (index) {
  references.splice(index, 1)
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

async function createReference (index) {
  let data
  const reference = references[index]

  if (!props.value) {
    data = {
      guid: props.claim.id,
      value: reference.datavalue.value.id ?? reference.datavalue.value,
      property: reference.property
    }
  } else {
    const values = {
      ...props.value.snaks,
      [reference.property]: [...(props.value.snaks[reference.property] || []), reference]
    }

    const formattedSnaks = Object.entries(values).reduce((acc, [key, vs]) => {
      acc[key] = vs.map(v => v.datavalue.value.id ?? v.datavalue.value)
      return acc
    }, {})
    data = {
      guid: props.claim.id,
      snaks: formattedSnaks,
      hash: props.value.hash,
      property: props.value.property
    }
  }

  await $wikibase.getWbEdit().reference.add(data, authStore.requestConfig)
    .then((res) => {
      if (res.success) {
        updateReferences(res.reference)
        removeReference(index)
        $notification.success(t('messages.success.updated'))
      } else {
        $notification.error(t('messages.error.something_went_wrong'))
      }
    }).catch((error) => {
      $notification.error(error)
    })
}

function updateReferences (reference) {
  emit('create-reference', reference)
}

function acceptAll () {
  return true
}
</script>

<style scoped>
.add-reference {
  margin-bottom: 5px;
}
.create-reference {
  padding: 0;
}
.max-w-100 {
  max-width: 100px !important;
}
:deep(.v-text-field__details) {
  display: none;
}
</style>
