<template>
  <div>
    <template v-if="!isUserLogged">
      <a
        v-if="isImage"
        :href="imageLink"
        target="_blank"
      >
        <v-img
          width="300"
          :src="imageLink"
        />
      </a>
      <a
        v-if="isImage === false"
        :href="valueToView.value"
        target="_blank"
      >
        {{ valueToView.value }}
      </a>
      <v-icon
        v-if="!isImage"
      >
        mdi-link
      </v-icon>
    </template>
    <template v-else>
      <item-util-edit-text-field
        :value="valueToView_.value"
        :save="editValue"
        :delete="deleteValue"
        :mode="mode"
        @new-value="newValue"
      />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      required: true
    },
    save: {
      type: Function,
      default: null
    },
    delete: {
      type: Function,
      default: null
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      isImage: false,
      imageLink: null,
      valueToView_: { ...this.valueToView }
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },
  mounted () {
    this.isImageUrl(this.valueToView.value).then((isImage) => {
      this.isImage = isImage
      if (this.isImage) {
        this.imageLink = this.valueToView.value
      }
    })
  },
  methods: {
    newValue (value) {
      const valid = this.isURL(value)
      if (!valid) {
        this.$notification.error(this.$i18n.t('item.messages.invalid_url'))
        value = ''
      }
      this.$emit('new-value', value)
    },
    editValue (newValue, oldValue) {
      return this.save(this.getUrlValue(newValue, oldValue))
    },
    deleteValue () {
      return this.delete()
    },
    getUrlValue (newValue, oldValue) {
      const valid = this.isURL(newValue)
      const message = valid ? '' : this.$i18n.t('item.messages.invalid_url')
      return {
        validation: {
          valid,
          message
        },
        values: {
          newValue,
          oldValue
        }
      }
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    },
    isImageUrl (url) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
      })
    }
  }
}
</script>
