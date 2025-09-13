<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        text
        class="d-flex align-center pa-0"
        height="0"
        min-width="0"
        v-on="on"
      >
        <v-img
          :src="localeFlag"
          alt="flag"
          contain
          max-width="24"
          max-height="16"
        />
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in languages"
        :key="index"
        dense
        @click="changeLocale(index)"
      >
        <v-list-item-avatar>
          <v-img :src="item.image" alt="flag" />
        </v-list-item-avatar>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data () {
    return {
      languages: [
        { locale: 'ca', name: 'Català', image: 'img/flags/flag_catalonia.gif' },
        { locale: 'es', name: 'Español', image: 'img/flags/flag_spain.gif' },
        { locale: 'en', name: 'English', image: 'img/flags/flag_unitedstates.gif' },
        { locale: 'gl', name: 'Galego', image: 'img/flags/flag_galicia.gif' },
        { locale: 'pt', name: 'Português', image: 'img/flags/flag_portugal.gif' }
      ]
    }
  },

  computed: {
    localeFlag () {
      return this.languages.find(lang => lang.locale === this.$i18n.locale)?.image ?? ''
    }
  },
  methods: {
    changeLocale (index) {
      this.$i18n.setLocale(this.languages[index].locale)
    }
  }
}
</script>

<style scoped>
::v-deep .v-image__image--cover {
  background-size: unset !important;
}
</style>
