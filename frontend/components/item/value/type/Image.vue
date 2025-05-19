<template>
  <div>
    <div v-if="!isUserLogged">
      <a :href="valueToView.descriptionurl" target="_blank">
        <v-img width="300" :src="valueToView.url" />
      </a>
    </div>
    <item-util-edit-text-field
      v-else
      :key="consolidatedUrl"
      :value="consolidatedUrl"
      :save="editValue"
      :delete="!deletable ? null : deleteValue"
      :mode="mode"
      @on-blur="$emit('on-blur', $event)"
      @new-value="$emit('new-value', $event)"
    />
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
    save: {
      type: Function,
      default: null
    },
    delete: {
      type: Function,
      default: null
    },
    deletable: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      consolidatedUrl: null
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },
  mounted () {
    this.consolidatedUrl = this.getFileNameFromURL(this.valueToView.url)
  },
  methods: {
    editValue (newValue, oldValue) {
      return this.save(this.getWikiBaseImageValue(newValue, oldValue))
        .then((result) => {
          return result
        })
        .catch((error) => {
          this.$notification.error(error)
        })
    },
    getWikiBaseImageValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          newValue,
          oldValue
        }
      }
    },
    getFileNameFromURL (url) {
      return url.substring(url.lastIndexOf('/') + 1)
    },
    deleteValue () {
      return this.delete()
    }
  }
}
</script>
