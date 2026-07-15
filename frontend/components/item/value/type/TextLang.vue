<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" />
    </template>
    <template v-else>
      <v-container>
        <v-row density="comfortable" class="justify-start">
          <v-col class="flex-shrink-1">
            <item-util-edit-text-field
              :label="label"
              :value="valueToView_.value"
              :save="editValue"
              :delete="deleteValue"
              :mode="mode"
              @new-value="newTextValue"
              @on-blur="emit('on-blur', $event)"
            />
            <v-select
              v-model="valueToView_.language"
              item-title="title"
              item-value="value"
              :items="languages"
              :label="t('common.language')"
              class="ma-0 pa-0"
              style="width: 100px"
              @update:model-value="onChangeLanguage"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: null },
  valueToView: { type: Object, default: null },
  save: { type: Function, default: null },
  delete: { type: Function, default: null },
  mode: { type: String, default: 'edit' }
})

const emit = defineEmits(['on-blur', 'new-value'])

const { $notification, $wikibase } = useNuxtApp()
const { t } = useI18n()
const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

const valueToView_ = reactive({ ...props.valueToView })
const consolidatedLanguage = ref(props.valueToView.language)

// Maps FactGrid language Q-items to BCP-47 codes used for monolingual text storage
const LANG_QITEM_MAP = {
  Q11149: { code: 'en', title: 'English' },
  Q11150: { code: 'de', title: 'Deutsch' },
  Q11152: { code: 'fr', title: 'Français' },
  Q11153: { code: 'es', title: 'Español' },
  Q11154: { code: 'nl', title: 'Nederlands' },
  Q11155: { code: 'it', title: 'Italiano' },
  Q11157: { code: 'da', title: 'Dansk' },
  Q144754: { code: 'sv', title: 'Svenska' },
  Q152304: { code: 'hu', title: 'Magyar' },
  Q164451: { code: 'pt', title: 'Português' },
  Q361085: { code: 'ca', title: 'Català' },
  Q361087: { code: 'gl', title: 'Galego' },
  Q393616: { code: 'nl', title: 'Nederlands' }, // duplicate Q-item for Dutch in FactGrid; deduped by 'seen' set below
  Q448505: { code: 'cs', title: 'Čeština' },
  Q456587: { code: 'pl', title: 'Polski' },
  Q899064: { code: 'nb', title: 'Norsk bokmål' },
}

const FALLBACK_LANGUAGES = [
  { title: 'English', value: 'en' },
  { title: 'Español', value: 'es' },
  { title: 'Português', value: 'pt' },
  { title: 'Català', value: 'ca' },
  { title: 'Galego', value: 'gl' },
  { title: '-', value: 'und' }
]

const languages = ref([...FALLBACK_LANGUAGES])

const isUserLogged = computed(() => authStore.isLogged)
const isEditable = computed(() => props.mode === 'edit')

onMounted(async () => {
  if (!isUserLogged.value || !props.valueToView?.property) return

  const config = await $wikibase.getControlledVocabularyConfig(
    breadcrumbStore.table,
    breadcrumbStore.database
  )
  const propConfig = config?.[props.valueToView.property]
  if (!propConfig?.query) return

  // NOTE: the query text is parsed with a regex to extract wd:Qxxxx tokens —
  // it is NOT executed as SPARQL. The Ui_ControlledVocabulary entry for this
  // property must list language Q-items as literals (e.g. VALUES ?item { wd:Q11149 ... }),
  // not as a class query, or the regex will produce no matches and fall back to the hardcoded list.
  const seen = new Set()
  const mapped = []
  for (const [, qid] of propConfig.query.matchAll(/wd:(Q\d+)/g)) {
    const lang = LANG_QITEM_MAP[qid]
    if (lang && !seen.has(lang.code)) {
      seen.add(lang.code)
      mapped.push({ title: lang.title, value: lang.code })
    } else if (!lang) {
      console.warn(`[TextLang] Q-item ${qid} from Ui_ControlledVocabulary query is not in LANG_QITEM_MAP — add it to use it as a language option`)
    }
  }
  if (mapped.length === 0) return

  mapped.push({ title: '-', value: 'und' })
  languages.value = mapped

  if (!valueToView_.language && propConfig.default_value) {
    const defaultLang = LANG_QITEM_MAP[propConfig.default_value]
    if (defaultLang && mapped.some(m => m.value === defaultLang.code)) {
      valueToView_.language = defaultLang.code
      consolidatedLanguage.value = defaultLang.code
      emit('new-value', getMonolingualTextNewValue(valueToView_.value))
    }
  }
})

function newTextValue (value) {
  valueToView_.value = value
  emit('new-value', getMonolingualTextNewValue(valueToView_.value))
}

function onChangeLanguage () {
  if (isEditable.value) {
    props.save(getMonolingualTextValue(valueToView_.value, valueToView_.value))
      .then((response) => {
        if (response) {
          if (!response.success) {
            throw new Error(response.info)
          }
          consolidatedLanguage.value = valueToView_.language
          $notification.success(t('messages.success.updated'))
        }
      })
  }
  emit('new-value', getMonolingualTextNewValue(valueToView_.value))
}

function editValue (newValue, oldValue) {
  valueToView_.value = newValue
  return props.save(getMonolingualTextValue(newValue, oldValue))
}

function getMonolingualTextValue (newValue, oldValue) {
  return {
    validation: { valid: true },
    values: {
      oldValue: {
        text: oldValue,
        language: consolidatedLanguage.value
      },
      newValue: getMonolingualTextNewValue(newValue)
    }
  }
}

function getMonolingualTextNewValue (value) {
  return {
    text: value,
    language: valueToView_.language
  }
}

function deleteValue () {
  return props.delete()
}
</script>

<style scoped>
:deep(.v-list-item__title) {
  font-size: 12px;
}
:deep(.v-select__selection) {
  font-size: 12px;
}
</style>
