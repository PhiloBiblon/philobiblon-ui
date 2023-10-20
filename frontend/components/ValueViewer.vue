<template>
  <div v-if="valueToView">
    <span v-if="valueToView.type === 'text'">
      {{ valueToView.value }}
    </span>
    <span v-else-if="valueToView.type === 'text-lang'">
      {{ valueToView.value }} <sup>{{ valueToView.language }}</sup>
    </span>
    <span v-else-if="valueToView.type === 'time'">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
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
      <NuxtLink :to="getUrlFromPBID(valueToView.item)">{{
        valueToView.value
      }}</NuxtLink>
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
    }
  },

  data () {
    return {
      datavalue: null,
      valueToView: null,
      imageLink: null
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
    getUrlFromPBID (item) {
      return this.localePath('/item/' + item)
    },
    isURL (str) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      return urlRegex.test(str)
    }
  }
}
</script>
