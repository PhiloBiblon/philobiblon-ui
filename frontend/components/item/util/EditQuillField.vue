<template>
  <div class="mt-3 mb-3">
    <div ref="editorContainer" class="quill-editor" />
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default {
  props: {
    value: {
      type: String,
      default: null
    },
    save: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      quill: null,
      content: ''
    }
  },
  async mounted () {
    await this.initQuill()
  },
  methods: {
    initQuill () {
      this.quill = new Quill(this.$refs.editorContainer, {
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

      this.quill.root.innerHTML = this.value
      this.insertCustomButtons()
    },
    insertCustomButtons () {
      const toolbarModule = this.quill.getModule('toolbar')
      const toolbar = toolbarModule.container

      if (toolbar) {
        const customButtonsContainer = document.createElement('div')
        customButtonsContainer.classList.add('custom-buttons-container')
        toolbar.appendChild(customButtonsContainer)

        const checkButton = this.createButton('edit', 'mdi mdi-check')
        checkButton.title = this.$t('common.save')

        const closeButton = this.createButton('restore', 'mdi mdi-close')
        closeButton.title = this.$t('common.cancel')

        customButtonsContainer.appendChild(checkButton)
        customButtonsContainer.appendChild(closeButton)
      }
    },
    createButton (type, icon) {
      const button = document.createElement('button')
      button.classList.add('ql-custom-button')
      button.setAttribute('type', 'button')
      button.innerHTML = `<i class="${icon}"></i>`

      button.addEventListener('click', () => {
        this[type]()
      })
      return button
    },
    async edit () {
      if (this.quill.root.innerHTML === this.value) {
        return
      }

      await this.save(this.quill.root.innerHTML, this.value)
        .then((response) => {
          if (response) {
            if (response.error && response.error.info) {
              throw new Error(response.error.info)
            }
            this.$notification.success(this.$i18n.t('messages.success.updated'))
          }
        })
        .catch((error) => {
          if (error.message === 'query is undefined') {
            error = this.$i18n.t('messages.error.session.expired')
          }

          if (error.message.includes('modification-failed')) {
            error = this.$i18n.t('messages.error.modification.failed')
          }

          this.$notification.error(error)
        })
    },
    restore () {
      this.quill.root.innerHTML = this.value
    }
  }
}
</script>

<style scoped>
::v-deep .ql-toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

::v-deep .custom-buttons-container {
  display: flex;
  margin-left: auto;
  margin-right: 0;
}

::v-deep .ql-custom-button {
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

::v-deep .ql-custom-button .mdi {
  font-size: 20px;
  line-height: 1;
  vertical-align: middle;
}
</style>
