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
          v-if="!isWikiBaseItem"
          :key="value.datavalue.value.id"
          :options="options"
          :save="editValue"
          @update-options="options = $event"
          @input="oninput($event)"
        />
        <edit-select-field
          :save="editValue"
          :options="autocompleteItems"
          :key="value.datavalue.value.id"
        />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
      </template>
      <template v-else>
        <div class="d-flex">
          <edit-text-field
            type="date"
            :save="editValue"
            :key="valueToView.value"
            :value="valueToView.value"
            class="text-subtitle-1 mt-5"/>
          <edit-select-field
            :save="editValue"
            :options="calendarTypes"
            :callback-params="[true]"
            :key="valueToView.calendar"
            :value="valueToView.calendar"
            class="text-subtitle-1 col-5"/>
        </div>
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
      currentValue: null,
      autocomplete: {
        items: [],
        queryFunction: () => { return this.qualifiersQuery(this.value.property, this.$i18n.locale) },
      },
      calendarTypes: [
        {
          label: 'Gregorian',
          value: 'Gregorian',
          wikiValue: 'http://www.wikidata.org/entity/Q1985727',
        },
        {
          label: 'Julian',
          value: 'Julian',
          wikiValue: 'http://www.wikidata.org/entity/Q1985786',
        }
      ],
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isWikiBaseItem () {
      return this.claim?.mainsnak?.datatype === 'wikibase-item';
    },
    autocompleteItems () {
      return this.autocomplete.items;
    },
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
    if (this.isWikiBaseItem && this.isUserLogged) { this.populateOptionsAutocomplete() }

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
      if (e && e !== this.valueToView.value) { this.handleSearchChange(e) }
    },
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    },
    setDefaultOption () {
      if (!this.isWikiBaseItem) {
        this.options = [{
          id: this.value.datavalue.value.id,
          label: this.valueToView.value,
        }]
      } else {
        this.autocomplete.items = [{
          id: this.value.datavalue.value.id,
          label: this.valueToView.value,
        }]
      }
    },
    async handleSearchChange (value) {
      if (!value) { return }
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
      // eslint-disable-next-line no-return-assign
      if (search && search.length) { return this.options = search }
    },
    async editValue (option, hasProp) {
      const editableData = await this.getEditableData(option, hasProp);

      if (JSON.stringify(editableData.newValue) === JSON.stringify(editableData.oldValue)) { return }

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
    async getEditableData (value, hasProp = false) {
      let newValue = {}
      switch (this.value.datavalue.type) {
        case 'string':
          newValue = this.getStringValue(value)
          break
        case 'quantity':
          newValue = this.getQuantityValue(value)
          break
        case 'time':
          newValue = this.getTimeValue(value, hasProp)
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
    getTimeValue(value, hasProp) {
      let calendarModel, time;

      if (hasProp) {
        calendarModel = value.wikiValue;
        time = this.value.datavalue.value.time;
      } else {
        time = this.formatDate(value);
        calendarModel = this.value.datavalue.value.calendarmodel;
      }

      return {
        oldValue: this.currentValue,
        newValue: {
          ...this.value.datavalue.value,
          time: time,
          calendarmodel: calendarModel,
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
    qualifiersQuery(property, lang) {
      return this.$wikibase.$query.addPrefixes(
        `
        SELECT DISTINCT ?value ?valueLabel
          WHERE {
            ?item wdt:${property} ?value
            SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
        }
      `);
    },
    populateOptionsAutocomplete() {
      this.$wikibase.runSparqlQuery(this.autocomplete.queryFunction(), true)
        .then((results) => {
          Object.entries(results).forEach(
            ([key, result]) => {
              if (!this.isURL(result.value.label)) {
                this.autocomplete.items.push({
                  id: result.value.value,
                  label: result.value.label,
                });
              }
            });
        });
    },
  }
}
</script>