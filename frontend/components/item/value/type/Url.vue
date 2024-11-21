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
      <item-util-edit-text-field
        :save="editValue"
        :value="valueToView_.value"
        :delete="deleteValue"
        :can-delete="canDelete"
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
      required: true
    },
    delete: {
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
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    canDelete () {
      return this.type === 'claim'
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
    deleteValue () {
      return this.delete()
    },
    getUrlValue (newValue, oldValue) {
      const valid = this.isURL(newValue)
      const message = valid ? '' : 'Please fill a valid URL!'
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
