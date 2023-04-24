<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn text v-on="on">
        {{ $i18n.locale }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in languages"
        :key="index"
        dense
        @click="changeLocale(index)"
      >
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
        { locale: 'ca', name: 'Català' },
        { locale: 'es', name: 'Español' },
        { locale: 'en', name: 'English' },
        { locale: 'ga', name: 'Galego' },
        { locale: 'po', name: 'Português' }
      ]
    }
  },
  methods: {
    changeLocale (index) {
      this.$i18n.setLocale(this.languages[index].locale)
    }
  }
}
</script>
