<template>
  <div class="mt-3 mb-3">
    <div ref="editorContainer" class="quill-editor" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  value: { type: String, default: null },
  save: { type: Function, required: true }
})

const { $notification } = useNuxtApp()
const { t } = useI18n()

const editorContainer = ref(null)
let quill = null

onMounted(() => {
  initQuill()
})

function initQuill () {
  quill = new Quill(editorContainer.value, {
    theme: 'snow',
    placeholder: 'Start typing...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        [{ align: [] }]
      ]
    }
  })

  quill.root.innerHTML = props.value
  insertCustomButtons()
}

function insertCustomButtons () {
  const toolbarModule = quill.getModule('toolbar')
  const toolbar = toolbarModule.container

  if (toolbar) {
    const customButtonsContainer = document.createElement('div')
    customButtonsContainer.classList.add('custom-buttons-container')
    toolbar.appendChild(customButtonsContainer)

    const checkButton = createButton('edit', 'mdi mdi-check')
    checkButton.title = t('common.save')

    const closeButton = createButton('restore', 'mdi mdi-close')
    closeButton.title = t('common.cancel')

    customButtonsContainer.appendChild(checkButton)
    customButtonsContainer.appendChild(closeButton)
  }
}

function createButton (type, icon) {
  const button = document.createElement('button')
  button.classList.add('ql-custom-button')
  button.setAttribute('type', 'button')
  button.innerHTML = `<i class="${icon}"></i>`

  button.addEventListener('click', () => {
    if (type === 'edit') { edit() } else { restore() }
  })
  return button
}

async function edit () {
  if (quill.root.innerHTML === props.value) {
    return
  }

  await props.save(quill.root.innerHTML, props.value)
    .then((response) => {
      if (response) {
        if (response.error && response.error.info) {
          throw new Error(response.error.info)
        }
        $notification.success(t('messages.success.updated'))
      }
    })
    .catch((error) => {
      if (error.message === 'query is undefined') {
        error = t('messages.error.session.expired')
      }

      if (error.message.includes('modification-failed')) {
        error = t('messages.error.modification.failed')
      }

      $notification.error(error)
    })
}

function restore () {
  quill.root.innerHTML = props.value
}
</script>

<style scoped>
:deep(.ql-toolbar) {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

:deep(.custom-buttons-container) {
  display: flex;
  margin-left: auto;
  margin-right: 0;
}

:deep(.ql-custom-button) {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 36px;
  height: 36px;
}

:deep(.ql-custom-button .mdi) {
  font-size: 20px;
  line-height: 1;
  vertical-align: middle;
}
</style>
