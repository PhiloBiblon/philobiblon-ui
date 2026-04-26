<template>
  <v-container class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="key"
      class="even-row"
      dense
    >
      <v-col class="p-0 pr-3 pt-3">
        <div class="d-flex">
          <item-value-base
            :key="`${claim.value}-${key}`"
            class="full-width"
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
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  item: { type: Object, default: null },
  value: { type: Object, default: null },
  forCreate: { type: Boolean, default: false }
})

const emit = defineEmits(['update-claims-values', 'create-claim'])

const { $notification, $wikibase } = useNuxtApp()
const { t } = useI18n()
const authStore = useAuthStore()

const items = reactive({})
const claims = reactive({})

function addClaim () {
  const newKey = `P${Date.now()}`
  const { property, datatype } = props.value
  claims[newKey] = {
    property,
    datatype,
    datavalue: { value: null, default: false }
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

async function createClaim (index) {
  const value = claims[index]?.datavalue?.value
  if (value == null) {
    return
  }
  const res = await $wikibase.getWbEdit().claim.add({
    value,
    id: props.item.id,
    property: props.value.property
  }, authStore.requestConfig)
  if (res.success) {
    $notification.success(t('messages.success.updated'))
    updateClaims(res)
  } else {
    $notification.error(t('messages.error.modification.failed'))
  }
  return res
}

function updateClaims (res) {
  emit('create-claim', { claim: res.claim, property: props.value.property })
}
</script>

<style scoped>
.add-value {
  background-color: white;
  font-size: 14px;
}
.claim {
  padding: 0;
}
</style>
