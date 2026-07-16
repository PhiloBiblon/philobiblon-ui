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
const { t, locale } = useI18n()
const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

const valueToView_ = reactive({ ...props.valueToView })
const consolidatedLanguage = ref(props.valueToView.language)

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
  const qids = [...propConfig.query.matchAll(/wd:(Q\d+)/g)].map(([, qid]) => qid)
  if (qids.length === 0) return

  // Fetch entities to read P822 (ISO 639-1 code) and labels directly from FactGrid,
  // so adding a new language Q-item to the wiki config requires no code change.
  const entities = await $wikibase.getEntities(qids, locale.value)

  const seen = new Set()
  const mapped = []
  for (const qid of qids) {
    const entity = entities[qid]
    const code = entity?.claims?.P822?.[0]?.mainsnak?.datavalue?.value
    if (!code) {
      console.warn(`[TextLang] Q-item ${qid} has no P822 (ISO 639-1) claim — skipping`)
      continue
    }
    if (seen.has(code)) continue
    seen.add(code)
    const title = entity.labels?.[locale.value]?.value || entity.labels?.en?.value || code
    mapped.push({ title, value: code })
  }
  if (mapped.length === 0) return

  mapped.push({ title: '-', value: 'und' })
  languages.value = mapped

  if (!valueToView_.language && propConfig.default_value) {
    const defaultEntity = entities[propConfig.default_value]
    const defaultCode = defaultEntity?.claims?.P822?.[0]?.mainsnak?.datavalue?.value
    if (defaultCode && mapped.some(m => m.value === defaultCode)) {
      valueToView_.language = defaultCode
      consolidatedLanguage.value = defaultCode
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
