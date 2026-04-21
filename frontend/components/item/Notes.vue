<template>
  <div class="notes">
    <div v-if="loadingContent">
      {{ t('common.loading') }}
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-else-if="!isUserLogged" v-html="contentView" />
    <item-util-edit-quill-field v-else :save="editValue" :value="content?.value" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  itemId: { type: String, default: null }
})

const emit = defineEmits(['has-notes'])

const { $notification, $wikibase, $sanitize } = useNuxtApp()
const { t } = useI18n()
const config = useRuntimeConfig().public
const authStore = useAuthStore()

const content = ref(null)
const loadingContent = ref(false)

const isUserLogged = computed(() => authStore.isLogged)
const contentView = computed(() => $sanitize(content.value?.value))

onMounted(async () => {
  loadingContent.value = true
  content.value = await $wikibase.getDiscussionPage(props.itemId)
  emit('has-notes', !!content.value?.value)
  if (content.value?.value) {
    content.value.value = convertWikiLinksToHtml(content.value.value)
  }
  loadingContent.value = false
})

async function editValue (value) {
  try {
    value = convertHtmlLinksToWiki(value)
    const response = await $wikibase.updateDiscussionPage(props.itemId, value)
    if (response.status === 200) {
      const data = await response.json()
      if (data.edit?.result === 'Success') {
        content.value.value = value
        $notification.success(t('messages.success.updated'))
      } else {
        $notification.error(`Error editing notes page: ${data.error?.info}`)
      }
    } else {
      $notification.error(`HTTP error editing notes: ${response.status}`)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error editing notes:', error)
    $notification.error(`Error editing notes: ${error}`)
  }
}

function convertWikiLinksToHtml (str) {
  str = str.replace(/\[(https?:\/\/[^\s\]]+)(?:\s([^\]]+))?\]/g, (match, url, label) => {
    label = label || url
    label = label.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<a href="${url}" target="_blank">${label}</a>`
  })
  str = str.replace(/\[\[(.+?)\]\]/g, (match, inner) => {
    let [target, label] = inner.split('|')
    label = label || target

    label = label.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    target = target.trim()
    let url = target
    if (target.startsWith('Item:')) {
      target = target.replace(/^Item:/, '')
      url = $wikibase.getQItemUrl(target)
    }

    return `<a href="${url}" target="_blank">${label}</a>`
  })

  return str
}

function convertHtmlLinksToWiki (str) {
  return str.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
    const cleanHref = href.trim()
    const cleanText = text.trim()

    const wikibasePrefix = config.wikibaseBaseUrl + '/wiki/'
    const isInternal = cleanHref.startsWith(wikibasePrefix)

    if (isInternal) {
      const internalTarget = cleanHref.slice(wikibasePrefix.length)
      if (internalTarget === cleanText) {
        return `[[${internalTarget}]]`
      } else {
        return `[[${internalTarget}|${cleanText}]]`
      }
    } else {
      /* eslint-disable-next-line no-lonely-if */
      if (cleanHref === cleanText) {
        return `[${cleanHref}]`
      } else {
        return `[${cleanHref} ${cleanText}]`
      }
    }
  })
}
</script>

<style scoped>
.notes {
  background-color: rgb(247, 245, 245);
}

.notes {
  overflow: visible;
  padding-left: 1.5em;
}

.notes ul,
.notes ol {
  list-style-position: inside;
  padding-left: 0;
  margin-left: 0;
}

.notes li {
  margin-bottom: 0.5em;
}
</style>
