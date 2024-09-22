<template>
  <div>
    <template v-if="!isUserLogged">
      <a
        :href="imageLink"
        target="_blank"
      >
        <v-img
          width="300"
          :src="imageLink"
        />
      </a>
      <a
        :href="valueToView.value"
        target="_blank"
      >
        {{ valueToView.value }}
      </a>
      <v-icon>mdi-link</v-icon>
    </template>
    <template v-else>
      <item-util-edit-text-field :save="editValue" :value="valueToView_.value" />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isUserLogged: {
      type: Boolean,
      default: false
    },
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      imageLink: null,
      valueToView_: { ...this.valueToView }
    }
  },
  mounted () {
    if (this.isURL(this.valueToView.value)) {
      fetch(
        'https://the-visionary-git-master-austininseoul.vercel.app/api?url=' + this.valueToView.value
      ).then((res) => {
        this.imageLink = res && res.imageSizes ? res.imageSizes[0].url : this.valueToView.value
      })
    }
  },
  methods: {
    editValue (newValue, oldValue) {
      return this.save(this.getUrlValue(newValue, oldValue))
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
    }
  }
}
</script>
