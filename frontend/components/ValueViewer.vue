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
          :save="editLabel"
          @update-options="options = $event"
          @input="oninput($event)"
        />
      </div>
    </template>

    <span v-else-if="valueToView.type === 'text-lang'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.language }}</sup>
      </template>
      <template v-else>
        <edit-text-field :key="datavalue" :save="editLabel" :value="datavalue" class="text-subtitle-1" />
      </template>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
      </template>
      <template v-else>
        <edit-text-field :key="datavalue" :save="editLabel" type="date" :value="datavalue" class="text-subtitle-1" />
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
            :save="editLabel"
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
    index: {
      type: Number
    },
    claim: {
      type: Object
    },
    qualifiers: {
      type: Object
    },
    type: {
      type: String
    }
  },

  data () {
    return {
      valueToView: null,
      imageLink: null,
      options: []
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

    this.setDefaultOption()

    this.datavalue = this.valueToView.value

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
      let defaultId = null
      if (this.type === 'qualifier') {
        defaultId = this.claim.qualifiers[this.value.property][this.index].datavalue.value.id
      } else {
        defaultId = this.claim.mainsnak.datavalue.value.id
      }

      this.options = [{
        id: defaultId,
        label: this.valueToView.value
      }]
    },
    async handleSearchChange (value) {
      if (!value) { return }
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
      // eslint-disable-next-line no-return-assign
      if (search && search.length) { return this.options = search }
    },
    getItemId () {
      const pattern = /Q\d+/g
      return this.claim.id.match(pattern)[0]
    },
    async editLabel (option) {
      const accessToken = this.$store.getters['auth/getAccessToken']
      const csrfToken = await this.$wikibase.getWikiUiDevCsrfToken(accessToken.token)

      if (!csrfToken) { return }

      const formData = await this.customizeUpdateData(option, csrfToken)
      const response = await this.$wikibase.updateWikiClaim(accessToken.token, formData)

      if (response.success) {
        this.$notification.success('Successfully updated')
      } else {
        this.$notification.error('Something went wrong')
      }
    },
    customizeUpdateData (value, csrfToken) {
      const itemId = this.getItemId()
      const form = this.createInitialForm()
      let newObj = {}
      switch (this.value.datavalue.type) {
        case 'string':
          newObj = this.getStringValue(value)
          break
        case 'quantity':
          newObj = this.getQuantityValue(value)
          break
        case 'time':
          newObj = this.getTimeValue(value)
          break
        case 'wikibase-entityid':
          newObj = this.getWikiBaseEntityIdValue(value)
          break
        case 'url':
          newObj = this.getUrlValue(value)
          break
        case 'globe-coordinate':
          newObj = this.getCoordinatesValue(value)
          break
        case 'monolingualtext':
          newObj = this.getMonolingualTextValue(value)
          break
        case 'math':
          newObj = this.getMathValue(value)
          break
        case 'external-id':
          newObj = this.getExternalIdValue(value)
          break
        default:
          break
      }
      this.setFormVal(form, newObj)

      return this.createFormData(itemId, csrfToken, form)
    },
    createInitialForm () {
      return JSON.parse(JSON.stringify(this.claim))
    },
    getMonolingualTextValue (value) {
      return {
        type: this.value.datavalue.type,
        value: {
          text: value,
          language: this.value.datavalue.value.language
        }
      }
    },
    getWikiBaseEntityIdValue (value) {
      return {
        type: this.value.datavalue.type,
        value: {
          id: value.id
        }
      }
    },
    getStringValue (value) {
      return {
        value,
        type: 'string'
      }
    },
    getQuantityValue (value) {
      return {
        type: 'quantity',
        value: {
          unit: value.unit,
          amount: value.amount
        }
      }
    },
    getTimeValue (value) {
      return {
        type: 'time',
        value: {
          ...this.value.datavalue.value,
          time: this.formatDate(value)
        }
      }
    },
    getUrlValue (value) {
      return {
        value,
        type: 'url'
      }
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
    setFormVal (form, val) {
      if (this.type !== 'qualifier') {
        form.mainsnak.datavalue = val
      } else {
        form.qualifiers[this.value.property][this.index].datavalue = val
      }
    },
    formatDate (dateString) {
      const date = new Date(dateString)
      const isoYear = date.getUTCFullYear()
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
      const isoDay = ('0' + date.getUTCDate()).slice(-2)

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
    },
    createFormData (itemId, csrfToken, form) {
      const formData = new URLSearchParams()
      formData.append('id', itemId)
      formData.append('token', csrfToken)
      formData.append('claim', JSON.stringify(form))
      return formData
    }
  }
}
</script>
