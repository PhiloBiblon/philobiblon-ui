<template>
  <div v-if="valueToView">
    <template v-if="valueToView.type === 'text'">
      <span v-if="!isUserLogged || checkTextIsEditable(value, valueToView) && !checkIfExternalId(value)">
        {{ valueToView.value }}
      </span>
      <div v-else-if="checkIfExternalId(value)">
        <edit-text-field :key="datavalue" :save="editLabel" :value="datavalue" class="text-subtitle-1"/>
      </div>
      <div v-else>
        <edit-select-field
          :save="editLabel"
          :options="options"
          @input="oninput($event)"
          :key="value.datavalue.value.id"
          @update-options="options = $event"
        />
      </div>
    </template>

    <span v-else-if="valueToView.type === 'text-lang'">
      <template v-if="!isUserLogged">
        <text-lang :value="valueToView" />
      </template>
      <template v-else>
        <div class="d-flex">
          <edit-text-field label="Value" :key="datavalue" :save="editLabel" :value="datavalue" class="text-subtitle-1 mt-6"/>
          <edit-select-field
            :options="langOptions"
            label="Language"
            :key="value.datavalue.value.language"
            :callback-params="[true]"
            :save="editLabel"
            :value="value.datavalue.value.language"
            class="text-subtitle-1 col-3"/>
        </div>
      </template>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      <template v-if="!isUserLogged">
        {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
      </template>
      <template v-else>
        <div class="d-flex">
          <edit-text-field :key="datavalue" :save="editLabel" type="date" :value="datavalue" class="text-subtitle-1 mt-5"/>
          <edit-select-field
            :options="calendarOptions"
            label="Calendar"
            :key="valueToView.calendar"
            :callback-params="[true]"
            :save="editLabel"
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
      <template v-if="!isUserLogged">
        <a :href="valueToView.value" target="_blank">
          {{ valueToView.value }}
        </a>
      </template>
      <template v-else>
        <edit-text-field :key="datavalue" :save="isValidUrl" :value="datavalue" class="text-subtitle-1"/>
      </template>
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
            :save="editLabel"
            :options="options"
            @input="oninput($event)"
            :key="value.datavalue.value.id"
            @update-options="options = $event"
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
    value: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
    },
    claim: {
      type: Object,
    },
    qualifiers: {
      type: Object,
    },
    type: {
      type: String,
    },
  },

  data () {
    return {
      datavalue: null,
      valueToView: null,
      imageLink: null,
      options: [],
      calendarOptions: [
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
      langOptions: [
        {
          label: 'Latin',
          value: 'la',
        },
        {
          label: 'English',
          value: 'en',
        },
        {
          label: 'Spanish',
          value: 'es',
        },
        {
          label: 'Portuguese',
          value: 'pt',
        },
        {
          label: 'Catalan',
          value: 'ca',
        },
        {
          label: 'German',
          value: 'de',
        },
        {
          label: 'French',
          value: 'fr',
        },
        {
          label: 'Italian',
          value: 'it',
        },
        {
          label: 'Dutch',
          value: 'nl',
        },
      ]
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

    this.setDefaultOption();

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
    oninput(e) {
      if (e && e !== this.valueToView.value) this.handleSearchChange(e);
    },
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    },
    setDefaultOption() {
      let defaultId = null
      if (this.type === 'qualifier') {
        defaultId = this.claim.qualifiers[this.value.property][this.index].datavalue.value.id
      } else {
        defaultId = this.claim.mainsnak.datavalue.value.id
      }

      this.options = [{
        id: defaultId,
        label: this.valueToView.value,
      }]
    },
    async handleSearchChange(value) {
      if (!value) return;
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale);
      if (search && search.length) return this.options = search;
    },
    getItemId() {
      const pattern = /Q\d+/g;
      return this.claim.id.match(pattern)[0];
    },
    async editLabel(option, isProp = false) {
      const accessToken = this.$store.getters['auth/getAccessToken'];
      const csrfToken = await this.$wikibase.getWikiUiDevCsrfToken(accessToken.token);

      if (!csrfToken) return;

      const formData = await this.customizeUpdateData(option, csrfToken, isProp);
      const response = await this.$wikibase.updateWikiClaim(accessToken.token, formData);

      if (response.success) {
        this.$notification.success('Successfully updated')
      } else {
        this.$notification.error('Something went wrong')
      }
    },
    async customizeUpdateData(value, csrfToken, isProp = false) {
      const itemId = this.getItemId();
      let form = this.createInitialForm();
      let newObj = {}
      switch (this.value.datavalue.type) {
        case 'string':
          newObj = this.getStringValue(value);
          break;
        case 'quantity':
          newObj = this.getQuantityValue(value);
          break;
        case 'time':
          newObj = this.getTimeValue(value, isProp);
          break;
        case 'wikibase-entityid':
          newObj = this.getWikiBaseEntityIdValue(value);
          break;
        case 'url':
          newObj = this.getUrlValue(value);
          break;
        case 'globe-coordinate':
          newObj = this.getCoordinatesValue(value);
          break;
        case 'monolingualtext':
          newObj = this.getMonolingualTextValue(value, isProp);
          break;
        case 'math':
          newObj = this.getMathValue(value);
          break;
        case 'external-id':
          newObj = this.getExternalIdValue(value);
          break;
        default:
          break;
      }
      this.setFormVal(form, newObj);

      return this.createFormData(itemId, csrfToken, form);
    },
    createInitialForm() {
      return JSON.parse(JSON.stringify(this.claim));
    },
    getMonolingualTextValue(value, isLang) {
      let text, lang;
      if (isLang) {
        lang = value.value
        text = this.value.datavalue.value.text
      } else {
        lang = this.value.datavalue.value.language
        text = value
      }
      return {
        type: this.value.datavalue.type,
        value: {
          text: text,
          language: lang,
        },
      };
    },
    getWikiBaseEntityIdValue(value) {
      return {
        type: this.value.datavalue.type,
        value: {
          id: value.id,
        },
      }
    },
    getStringValue(value) {
      return {
        value,
        type: 'string',
      };
    },
    getQuantityValue(value) {
      return {
        type: "quantity",
        value: {
          unit: value.unit,
          amount: value.amount,
        }
      }
    },
    getTimeValue(value, isProp) {
      let calendarModel, time;

      if (isProp) {
        calendarModel = value.wikiValue;
        time = this.value.datavalue.value.time;
      } else {
        time = this.formatDate(value);
        calendarModel = this.value.datavalue.value.calendarmodel;
      }

      return {
        type: "time",
        value: {
          ...this.value.datavalue.value,
          time: time,
          calendarmodel: calendarModel,
        }
      }
    },
    getUrlValue(value) {
      return {
        value,
        type: "url",
      }
    },
    getCoordinatesValue(value) {
      return {
        precision: 0.0001,
        latitude: 37.7749,
        longitude: -122.4194,
        globe: "http://www.wikidata.org/entity/Q2",
      }
    },
    getMathValue(value) {
      return {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "precision": 0.0001,
        "globe": "https://www.wikidata.org/entity/Q2",
      }
    },
    getExternalIdValue(value) {
      return {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "precision": 0.0001,
        "globe": "http://www.wikidata.org/entity/Q2",
      }
    },
    setFormVal(form, val) {
      if (this.type !== 'qualifier') {
        form.mainsnak.datavalue = val
      } else {
        form.qualifiers[this.value.property][this.index].datavalue = val
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const isoYear = date.getUTCFullYear();
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2);
      const isoDay = ('0' + date.getUTCDate()).slice(-2);

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`;
    },
    createFormData(itemId, csrfToken, form) {
      const formData = new URLSearchParams();
      formData.append('id', itemId);
      formData.append('token', csrfToken);
      formData.append('claim', JSON.stringify(form));
      return formData;
    },
    checkTextIsEditable(value) {
      return value.datavalue.type === 'string' || value.datavalue.value.id === 'Q80' || value.datavalue.value.id === 'Q81';
    },
    checkIfExternalId(value) {
      return value.datatype === 'external-id';
    },
    isValidUrl(string) {
      return new Promise((resolve, reject) => {
        try {
          new URL(string);
          resolve(this.editLabel(string));
        } catch (err) {
          reject('Please enter a valid URL!');
        }
      });
    },
  }
}
</script>