<template>
  <div v-if="valueToView">
    <template v-if="valueToView.type === 'text'">
      <span v-if="!isUserLogged">
        {{ valueToView.value }}
      </span>
      <div v-else>
        <edit-text-field :save="editValue" :value="valueToView.value" />
      </div>
    </template>

    <span v-else-if="valueToView.type === 'text-lang'">
      <template v-if="!isUserLogged">
        <text-lang :value="valueToView" />
      </template>
      <template v-else>
        <edit-text-field :save="editValue" :value="valueToView.value" />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
      </template>
      <template v-else>
        <edit-text-field :save="editValue" type="date" :value="valueToView.value" />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'url'">
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
        <edit-text-field :save="editValue" :value="valueToView.value" />
      </template>
    </span>

    <span v-else-if="valueToView.type === 'item'">
      <template v-if="!isUserLogged">
        <template v-if="valueToView.pbid">
          <NuxtLink :to="getUrlFromPBID(valueToView.item)">
            {{ valueToView.value }}
          </NuxtLink>
        </template>
        <template v-else>
          <text-lang :value="valueToView" />
        </template>
      </template>
      <template v-else>
        <edit-select-field
          v-if="isItemWithCustomOptions"
          :value="selectedOption"
          :save="editValue"
          :options="options"
        />
        <edit-select-field
          v-else
          :save="editValue"
          :options="options"
          @update-options="options = $event"
          @input="oninput($event)"
        />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'external-id'">
      <span v-if="!isUserLogged">
        <a :href="valueToView.url" target="_blank">{{ valueToView.value }}</a>
      </span>
      <div v-else>
        <edit-text-field :save="editValue" :value="valueToView.value" />
      </div>
    </span>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-else-if="valueToView.type === 'html'" v-html="valueToView.value" />
    <span v-else-if="valueToView.type === 'image'">
      <a
        :href="valueToView.descriptionurl"
        target="_blank"
      ><v-img
        width="300"
        :src="valueToView.url"
      /></a>
    </span>
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
    }
  },

  data () {
    return {
      valueToView: null,
      imageLink: null,
      selectedOption: null,
      options: [],
      currentValue: null,
      property_autocomplete: {
        P799: {
          sparqlQuery: `SELECT ?item ?itemLabel WHERE { VALUES ?item { wd:Q5 wd:Q14 wd:Q15 } SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.$i18n.locale},en,es". } }`
        }
      }
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isItemWithCustomOptions () {
      return this.valueToView.type === 'item' && this.value.property in this.property_autocomplete
    }
  },

  async mounted () {
    this.valueToView = await this.$wikibase.getWbValue(
      this.value.property,
      this.value.datatype,
      this.value.datavalue.value,
      this.$i18n.locale
    )

    if (this.valueToView.type === 'item') {
      this.setOptionsAutocomplete()
    } else if (this.valueToView.type === 'text-lang') {
      if (this.valueToView.language !== this.$i18n.locale) {
        this.valueToView.value = null
      }
    } else if (this.valueToView.type === 'url' && this.isURL(this.valueToView.value)) {
      fetch(
        'https://the-visionary-git-master-austininseoul.vercel.app/api?url=' + this.valueToView.value
      ).then((res) => {
        this.imageLink = res && res.imageSizes ? res.imageSizes[0].url : this.valueToView.value
      })
    }

    this.currentValue = this.value.datavalue.value
  },

  methods: {
    oninput (e) {
      if (e && e !== this.valueToView.value) { this.handleSearchChange(e) }
    },
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    },
    async handleSearchChange (value) {
      if (value) {
        const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
        if (search && search.length) { this.options = search }
      }
    },
    async editValue (newValue) {
      console.log(newValue)
      const editableData = await this.getEditableData(newValue, this.valueToView.type)
      if (!editableData.valid || JSON.stringify(editableData.newValue) === JSON.stringify(editableData.oldValue)) {
        if (editableData.message) {
          this.$notification.error(editableData.message)
        }
        return
      }

      if (this.type !== 'qualifier') {
        return this.$wikibase.getWbEdit().claim.update({
          guid: this.claim.id,
          newValue: editableData.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
          .then((response) => {
            if (response && response.success) {
              this.currentValue = editableData.newValue
            }
            return response
          })
      } else {
        return this.$wikibase.getWbEdit().qualifier.update({
          guid: this.claim.id,
          property: this.value.property,
          oldValue: editableData.oldValue,
          newValue: editableData.newValue
        },
        this.$store.getters['auth/getRequestConfig'])
          .then((response) => {
            if (response && response.success) {
              this.currentValue = editableData.newValue
            }
            return response
          })
      }
    },
    getEditableData (value, type) {
      let newValue = {}
      switch (type) {
        case 'text':
        case 'external-id':
          newValue = this.getStringValue(value)
          break
        case 'url':
          newValue = this.getUrlValue(value)
          break
        case 'time':
          newValue = this.getTimeValue(value)
          break
        case 'item':
          newValue = this.getWikiBaseEntityIdValue(value)
          break
        case 'text-lang':
          newValue = this.getMonolingualTextValue(value)
          break
        default:
          break
      }
      return newValue
    },
    getMonolingualTextValue (value) {
      return {
        valid: true,
        oldValue: this.currentValue,
        newValue: {
          text: value,
          language: this.$i18n.locale
        }
      }
    },
    getWikiBaseEntityIdValue (value) {
      return {
        valid: true,
        newValue: value.id,
        oldValue: this.currentValue.id
      }
    },
    getStringValue (value) {
      return {
        valid: true,
        newValue: value,
        oldValue: this.currentValue
      }
    },
    getTimeValue (value) {
      return {
        valid: true,
        oldValue: this.currentValue,
        newValue: {
          ...this.value.datavalue.value,
          time: this.formatDate(value)
        }
      }
    },
    getUrlValue (value) {
      console.log(value)
      const valid = this.isURL(value)
      console.log(valid)
      const message = valid ? '' : 'Please fill a valid URL!'

      return {
        valid,
        newValue: value,
        message,
        oldValue: this.currentValue
      }
    },
    formatDate (dateString) {
      const date = new Date(dateString)
      const isoYear = date.getUTCFullYear()
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
      const isoDay = ('0' + date.getUTCDate()).slice(-2)

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
    },
    setOptionsAutocomplete () {
      if (this.isItemWithCustomOptions) {
        const autocomplete = this.property_autocomplete[this.value.property]
        const sparqlQuery = this.$wikibase.$query.addPrefixes(autocomplete.sparqlQuery)
        this.$wikibase.runSparqlQuery(sparqlQuery, true)
          .then((results) => {
            Object.entries(results).forEach(
              ([_, result]) => {
                this.options.push({
                  id: result.item.value,
                  label: result.item.label
                })
              })
            this.selectedOption = this.valueToView.value
          })
      } else {
        this.options = [{
          id: this.value.datavalue.value.id,
          label: this.valueToView.value
        }]
      }
    }
  }
}
</script>
