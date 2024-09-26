<template>
  <div v-if="valueToView">
    <v-tooltip v-if="truncated" top open-delay="200">
      <template #activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on">
          <component
            :is="'item-value-type-' + valueToView.type"
            :is-user-logged="isUserLogged"
            :value-to-view="valueToView"
            :save="editValue"
          />
        </div>
      </template>
      <span>{{ longValue }}</span>
    </v-tooltip>
    <component
      :is="'item-value-type-' + valueToView.type"
      v-else
      :is-user-logged="isUserLogged"
      :value-to-view="valueToView"
      :save="editValue"
    />
  </div>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      default: null
    },
    value: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    inTable: {
      type: Boolean,
      default: false
    },
    columnWidth: {
      type: String,
      default: '200px'
    }
  },
  data () {
    return {
      valueToView: null,
      longValue: null,
      truncated: false
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    maxTextLength () {
      const width = parseInt(this.columnWidth, 10)
      return Math.floor(width / 8)
    }
  },
  async mounted () {
    const vtW = await this.$wikibase.getWbValue(
      this.value.property,
      this.value.datatype,
      this.value.datavalue.value,
      this.$i18n.locale
    )
    this.longValue = vtW.value

    if (this.inTable && vtW.value.length > this.maxTextLength && !this.isUserLogged) {
      this.truncated = true

      vtW.value = `${vtW.value.slice(0, this.maxTextLength)}...`
    }

    this.valueToView = vtW
  },
  methods: {
    editValue (editableData) {
      if (!editableData.validation.valid ||
        (JSON.stringify(editableData.values.newValue) === JSON.stringify(editableData.values.oldValue))) {
        if (editableData.validation.message) {
          this.$notification.error(editableData.validation.message)
        }
        return new Promise((resolve, reject) => {
          return resolve()
        })
      }

      if (this.type === 'claim') {
        return this.$wikibase.getWbEdit().claim.update({
          guid: this.claim.id,
          newValue: editableData.values.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
      } else if (this.type === 'qualifier') {
        return this.$wikibase.getWbEdit().qualifier.update({
          guid: this.claim.id,
          property: this.value.property,
          oldValue: editableData.values.oldValue,
          newValue: editableData.values.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
      } else {
        // eslint-disable-next-line no-console
        console.log(`Unknown type to edit: ${this.type}`)
      }
    }
  }
}
</script>
