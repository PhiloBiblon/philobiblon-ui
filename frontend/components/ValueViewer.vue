<template>
  <div v-if="valueToView">
    <template v-if="valueToView.type === 'text'">
      <span v-if="!isUserLogged || value.datavalue.type === 'string'">
        {{ valueToView.value }}
      </span>
      <div v-else>
        <edit-select-field
          :key="value.datavalue.value.id"
          :options="options"
          :save="editValue"
          @update-options="options = $event"
          @input="oninput($event)"
        />
      </div>
    </template>

    <span v-else-if="valueToView.type === 'text-lang'">
      <template v-if="!isUserLogged">
        <text-lang :value="valueToView" />
      </template>
      <template v-else>
        <edit-select-field
          :save="editValue"
          :options="options"
          @input="oninput($event)"
          :key="value.datavalue.value.id"
          @update-options="options = $event"
        />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
      </template>
      <template v-else>
        <edit-text-field :key="valueToView.value" :save="editValue" type="date" :value="valueToView.value" class="text-subtitle-1" />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'url'">
      <a
        :href="imageLink"
        target="_blank"
      ><v-img
        width="300"
        :src="imageLink"
      /></a>
      <a :href="valueToView.value" target="_blank">{{ valueToView.value }}</a>
      <v-icon>mdi-link</v-icon>
    </span>

    <span v-else-if="valueToView.type === 'item'">
      <template v-if="!isUserLogged">
        <NuxtLink :to="getUrlFromPBID(valueToView.item)">
          {{ valueToView.value }}
        </NuxtLink>
      </template>
      <template v-else>
        <div style="position: relative">
          <edit-select-field
            :key="value.datavalue.value.id"
            :options="options"
            :save="editValue"
            @update-options="options = $event"
            @input="oninput($event)"
          />
        </div>
      </template>
    </span>
    <span v-else-if="valueToView.type === 'external-id'">
      <a :href="valueToView.url" target="_blank">{{ valueToView.value }}</a>
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
      options: [],
      currentValue: null
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },

  async mounted () {
    this.valueToView = await this.$wikibase.getWbValue(
      this.value.property,
      this.value.datatype,
      this.value.datavalue.value,
      this.$i18n.locale
    )

    this.currentValue = this.value.datavalue.value

    this.setDefaultOption();
    if (this.isUserLogged) { this.getQualifiers() }

    if (this.isURL(this.valueToView.value) === true) {
      const res = await fetch(
        'https://the-visionary-git-master-austininseoul.vercel.app/api?url=' +
          this.valueToView.value
      )
      const data = await res.json()

      this.imageLink = data.imageSizes[0].url
    }
  },

  methods: {
    oninput (e) {
      if (e && e !== this.valueToView.value && this.claim.mainsnak.datatype !== 'wikibase-item') { this.handleSearchChange(e) }
    },
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    },
    getQualifiers() {
      if (this.claim.mainsnak.datatype === 'wikibase-item') {
        this.populateOptionsAutocomplete();
      }
    },
    setDefaultOption () {
      this.options = [{
        id: this.value.datavalue.value.id,
        label: this.valueToView.value
      }]
    },
    async handleSearchChange (value) {
      if (!value) { return }
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
      // eslint-disable-next-line no-return-assign
      if (search && search.length) { return this.options = search }
    },
    async editValue (option) {
      const editableData =  this.getEditableData(option);
      if (this.type !== 'qualifier') {
        return this.$wikibase.getWbEdit().claim.update({
          guid: this.claim.id,
          newValue: editableData.newValue,
        },
        this.$store.getters['auth/getRequestConfig'])
      } else {
        return this.$wikibase.getWbEdit().qualifier.update({
          guid: this.claim.id,
          property: this.value.property,
          oldValue: editableData.oldValue,
          newValue: editableData.newValue,
        },
        this.$store.getters['auth/getRequestConfig'])
          .then((response) => {
            if (response && response.success) {
              if (typeof editableData.newValue !== 'object') {
                this.currentValue.id = editableData.newValue;
              } else {
                this.currentValue = editableData.newValue;
              }
            }
            return response
          });
      }
    },
    getEditableData (value) {
      let newValue = {}
      switch (this.value.datavalue.type) {
        case 'string':
          newValue = this.getStringValue(value)
          break
        case 'quantity':
          newValue = this.getQuantityValue(value)
          break
        case 'time':
          newValue = this.getTimeValue(value)
          break
        case 'wikibase-entityid':
          newValue = this.getWikiBaseEntityIdValue(value)
          break
        case 'url':
          newValue = this.getUrlValue(value)
          break
        case 'globe-coordinate':
          newValue = this.getCoordinatesValue(value)
          break
        case 'monolingualtext':
          newValue = this.getMonolingualTextValue(value)
          break
        case 'math':
          newValue = this.getMathValue(value)
          break
        case 'external-id':
          newValue = this.getExternalIdValue(value)
          break
        default:
          break
      }
      return newValue
    },
    getMonolingualTextValue (value) {
      return {
        text: value,
        language: this.value.datavalue.value.language
      }
    },
    getWikiBaseEntityIdValue (value) {
      return {
        newValue: value.id,
        oldValue: this.currentValue.id,
      };
    },
    getStringValue (value) {
      return value
    },
    getQuantityValue (value) {
      return {
        unit: value.unit,
        amount: value.amount
      }
    },
    getTimeValue (value) {
      return {
        oldValue: this.currentValue,
        newValue: {
          ...this.value.datavalue.value,
          time: this.formatDate(value),
        },
      }
    },
    getUrlValue (value) {
      return value
    },
    getCoordinatesValue (value) {
      return {
        precision: 0.0001,
        latitude: 37.7749,
        longitude: -122.4194,
        globe: 'http://www.wikidata.org/entity/Q2'
      }
    },
    getMathValue (value) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        precision: 0.0001,
        globe: 'https://www.wikidata.org/entity/Q2'
      }
    },
    getExternalIdValue (value) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        precision: 0.0001,
        globe: 'http://www.wikidata.org/entity/Q2'
      }
    },
    formatDate (dateString) {
      const date = new Date(dateString)
      const isoYear = date.getUTCFullYear()
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
      const isoDay = ('0' + date.getUTCDate()).slice(-2)

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
    },
    populateOptionsAutocomplete() {
      this.$wikibase.runSparqlQuery(this.$wikibase.$query.qualifiersQuery(this.value.property, this.$i18n.locale), true)
        .then((results) => {
          Object.entries(results).forEach(
            ([key, result]) => {
              this.options.push({
                id: result.value.value,
                label: result.value.label,
              });
            });
        });
    },
  }
}
</script>
