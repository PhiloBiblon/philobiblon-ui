<template>
  <v-form ref="search_form">
    <v-container>
      <v-row dense>
        <v-col cols="7">
          <v-radio-group
            v-model="searchGroup.value"
            :disabled="searchGroup.disabled"
            inline
            @update:model-value="onGroupChange"
          >
            <template #label>
              {{ t('search.form.common.group.label') }}
            </template>
            <v-radio
              v-for="group in groups"
              :key="'g-' + (group.value ? group.value : group)"
              class="group-option"
              :label="group.text ? group.text : group"
              :value="group.value ? group.value : group"
            />
          </v-radio-group>
        </v-col>
        <v-col cols="1">
          <v-select
            v-if="isBitagapSelected"
            v-model="bitagapGroup.value"
            :disabled="bitagapGroup.disabled"
            :items="bitagapOptions"
            item-title="text"
            item-value="value"
            :label="t('search.form.common.bitagap_group.label')"
          />
        </v-col>
      </v-row>
      <template v-for="(section) in form.section" :key="`section-${section}`">
        <v-row v-if="!isPrimarySection(section) && existsSectionFilters(section) && !showResults" dense>
          <span class="section-search text-caption mb-2 text-primary" @click="toggleSectionDisplay(section)">
            {{ t(`search.form.common.section.${section}`) }} <v-icon class="text-primary">{{ isSectionDisplayed(section) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </span>
        </v-row>
        <v-row v-if="isSectionDisplayed(section)" dense>
          <template v-for="(item, name) in getInputsBySection(section)" :key="'i-' + name">
            <v-col
              v-if="(item.active && !item.permanent && item.visible)"
              cols="4"
            >
              <search-util-text-field
                v-if="item.type === 'text'"
                v-model="item.value"
                :label="t(item.label)"
                :hint="t(item.hint)"
                :disabled="item.disabled"
              />
              <search-util-autocomplete-field
                v-if="item.type === 'autocomplete'"
                :id="'auto-' + name"
                v-model="item.value"
                :label="t(item.label)"
                :hint="t(item.hint)"
                :disabled="item.disabled"
                :table="table"
                :database="searchGroup.value"
                :bitagap-group="bitagapGroup.value"
                :autocomplete="item.autocomplete"
                @click.stop
                @reset-value="(val) => item.value = val"
              />
              <search-util-date-field
                v-if="item.type === 'date'"
                :value="item.value"
                :label="t(item.label)"
                :hint="t(item.hint)"
                :disabled="item.disabled"
                @update-begin-date="item.value['begin'] = $event"
                @update-end-date="item.value['end'] = $event"
              />
            </v-col>
          </template>
        </v-row>
      </template>
      <v-row dense>
        <v-col cols="7">
          <v-btn
            v-if="!showResults"
            ref="searchBtn"
            class="mr-4"
            size="small"
            elevation="2"
            @click="search"
          >
            {{ t('search.button.search') }}
          </v-btn>
          <v-btn
            v-if="showResults"
            elevation="2"
            class="mr-4"
            size="small"
            :disabled="waitingResults"
            @click="back"
          >
            {{ t('search.button.back') }}
          </v-btn>
          <v-btn
            elevation="2"
            class="mr-4"
            size="small"
            :disabled="waitingResults"
            @click="clear"
          >
            {{ t('search.button.clear') }}
          </v-btn>
        </v-col>
        <v-col cols="4" class="search-type">
          <v-switch
            v-model="searchType.value"
            density="compact"
            :disabled="searchType.disabled"
            :label="searchType.value ? t('search.form.common.search_type.all_words') : t('search.form.common.search_type.any_word')"
          />
        </v-col>
        <v-col cols="1">
          <v-icon
            color="primary"
            @click="goToHelp()"
          >
            mdi-help-circle
          </v-icon>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useQueryStatusStore } from '~/stores/queryStatus'

const props = defineProps({
  table: { type: String, required: true },
  form: { type: Object, default: null },
  waitingResults: { type: Boolean, default: false }
})

const emit = defineEmits(['on-search', 'back-search', 'clear-search', 'database-change'])

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const queryStatusStore = useQueryStatusStore()

const searchGroup = reactive(props.form.input.group)
const searchType = reactive(props.form.input.search_type)
const bitagapGroup = reactive(props.form.input.bitagap_group)
const filtersBySection = reactive(groupFiltersBySection(props.form))
const showResults = ref(false)
const isBitagapSelected = ref(false)
const searchBtn = ref(null)

// eslint-disable-next-line no-unused-vars
const isUserLogged = computed(() => authStore.isLogged)

const groups = computed(() => [
  'BETA',
  'BITAGAP',
  'BITECA',
  { text: t('search.form.common.group_all.label'), value: 'ALL' }
])

const bitagapOptions = computed(() => [
  { text: t('search.form.common.bitagap_group.options.all'), value: 'ALL' },
  { text: t('search.form.common.bitagap_group.options.original'), value: 'ORIG' },
  { text: t('search.form.common.bitagap_group.options.cartas'), value: 'CARTAS' }
])

watch(showResults, (newValue) => {
  queryStatusStore.setShowResults(newValue)
})

if (queryStatusStore.showResults) {
  showResults.value = queryStatusStore.showResults
}
loadDefaultBibliography()

onMounted(() => {
  calculateSectionsToDisplay()
  window.addEventListener('keydown', keyDownHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyDownHandler)
})

function calculateSectionsToDisplay () {
  Object.keys(filtersBySection).forEach((section) => {
    filtersBySection[section].show = existsSectionFiltersSelected(section)
  })
}

function existsSectionFiltersSelected (section) {
  return Object.values(props.form.input).some(item => item.section === section && isFieldValueNotEmpty(item.value))
}

function getInputsBySection (section) {
  return filtersBySection[section].input.reduce((acc, key) => {
    if (key in props.form.input) {
      acc[key] = props.form.input[key]
    }
    return acc
  }, {})
}

function isPrimarySection (section) {
  return section === 'primary'
}

function isSectionDisplayed (section) {
  return isPrimarySection(section) || filtersBySection[section].show
}

function toggleSectionDisplay (section) {
  filtersBySection[section].show = !filtersBySection[section].show
}

function groupFiltersBySection (form) {
  const result = {}
  Object.entries(form.input).forEach(([key, value]) => {
    const section = value.section
    if (section) {
      if (!result[section]) {
        result[section] = { input: [], show: false }
      }
      result[section].input.push(key)
    }
  })
  return result
}

function existsSectionFilters (section) {
  return Object.values(props.form.input).some(item => item.section === section)
}

function keyDownHandler (event) {
  if (event.code === 'Enter') {
    if (document.activeElement.id && document.activeElement.id.startsWith('auto')) {
      return
    }
    searchBtn.value?.$el.focus()
    search()
  }
}

function search () {
  for (const key in props.form.input) {
    const item = props.form.input[key]
    if (!item.value ||
      (item.value instanceof Object && Object.keys(item.value).length === 0)) {
      item.visible = false
      if (item.type === 'autocomplete') {
        item.value = ''
      }
    }
    item.disabled = true
  }
  showResults.value = true
  emit('on-search', props.form)
}

function back () {
  for (const key in props.form.input) {
    const item = props.form.input[key]
    item.visible = true
    item.disabled = false
  }
  showResults.value = false
  calculateSectionsToDisplay()
  queryStatusStore.setForm(JSON.parse(JSON.stringify(props.form)))
  emit('back-search')
}

function clear () {
  for (const key in props.form.input) {
    const item = props.form.input[key]
    if (item.type === 'date') {
      item.value = {}
    } else {
      item.value = ''
    }
    item.visible = true
    item.disabled = false
  }
  searchGroup.value = 'ALL'
  isBitagapSelected.value = false
  bitagapGroup.value = 'ALL'
  searchType.value = true
  showResults.value = false
  calculateSectionsToDisplay()
  queryStatusStore.setForm(null)
  emit('clear-search')
}

function goToHelp () {
  router.push(`../../wiki/${locale.value}_Help`)
}

function isFieldValueNotEmpty (item) {
  if (typeof item === 'string' && item !== '') {
    return true
  }
  if (typeof item === 'object' && item != null && Object.keys(item).length > 0) {
    return true
  }
  return false
}

function onGroupChange (newDatabase) {
  if (newDatabase === 'BITAGAP' && props.table !== 'libid') {
    isBitagapSelected.value = true
  } else {
    isBitagapSelected.value = false
    bitagapGroup.value = 'ALL'
  }
  saveDefaultBibliography(newDatabase)
  emit('database-change', newDatabase)
}

function loadDefaultBibliography () {
  if (searchGroup.value === 'ALL' && typeof localStorage !== 'undefined') {
    const savedBibliography = localStorage.getItem('philobiblon_default_bibliography')
    if (savedBibliography && ['BETA', 'BITAGAP', 'BITECA'].includes(savedBibliography)) {
      searchGroup.value = savedBibliography
      onGroupChange(savedBibliography)
    }
  }
}

function saveDefaultBibliography (bibliography) {
  if (typeof localStorage !== 'undefined' && ['BETA', 'BITAGAP', 'BITECA'].includes(bibliography)) {
    localStorage.setItem('philobiblon_default_bibliography', bibliography)
  }
}

defineExpose({ back })
</script>

<style scoped>
.search-type {
  margin-top: 0;
  padding-top: 0;
}
.group-option {
  padding-right: 30px;
}
.section-search {
  cursor: pointer;
}
</style>
