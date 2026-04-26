<template>
  <div>
    <v-form v-if="showGroups" ref="search_form">
      <v-container>
        <v-row dense>
          <v-col cols="7">
            <v-radio-group
              v-model="database"
              inline
            >
              <template #label>
                {{ t('search.form.common.group.label') }}
              </template>
              <v-radio
                v-for="group in groups"
                :key="'g-' + group"
                class="group-option"
                :label="group"
                :value="group"
              />
            </v-radio-group>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <item-create
      :key="database"
      :table="table"
      :database="database"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const props = defineProps({
  table: { type: String, default: null },
  breadcrumbItems: { type: Array, default: null }
})

const { t } = useI18n()
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()

const database = ref('BETA')
const showGroups = ref(false)
const groups = ['BETA', 'BITAGAP', 'BITECA']

watch(() => route.query.database, (val) => {
  if (groups.includes(val)) {
    database.value = val
    showGroups.value = false
  } else {
    showGroups.value = true
  }
}, { immediate: true })

onMounted(() => {
  breadcrumbStore.setItems(props.breadcrumbItems)
  breadcrumbStore.setClass('large-font-breadcrumb')
  breadcrumbStore.setDatabase(database.value)
  breadcrumbStore.setTable(props.table)
})

onBeforeUnmount(() => {
  breadcrumbStore.setClass('')
})
</script>

<style scoped>
.group-option {
  padding-right: 30px;
}
</style>
