<template>
  <div class="search-container" :class="{'welcome-container': isWelcome}">
    <v-autocomplete
      rounded
      item-props
      :items="items"
      item-value="id"
      item-text="title"
      class="search-bar"
      :class="{welcome: isWelcome}"
      style="max-width: 450px;"
      :loading="loading"
      :search-input.sync="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search PhiloBiblon"
      append-inner-icon="mdi-microphone"
      @change="onItemSelected"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      items: [],
      search: '',
      loading: false
    }
  },
  computed: {
    isWelcome () {
      return this.$route.path.includes('Welcome')
    }
  },
  watch: {
    search (val) {
      if (val) {
        this.searchItems(val)
      }
    }
  },
  methods: {
    async searchItems (search) {
      if (search.length < 2) {
        this.items = []
        return
      }

      this.loading = true

      try {
        this.results = []
        const sparqlQuery = this.$wikibase.$query.allItemsQuery(search, this.$i18n.locale)

        const items = await this.$wikibase.runSparqlQuery(sparqlQuery)
        console.log(items)
        this.items = this.customizeSearchData(items)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching items:', error)
      } finally {
        this.loading = false
      }
    },
    customizeSearchData (items) {
      return items.map((item) => {
        return {
          id: item.pbid,
          title: item.label
        }
      })
    },
    onItemSelected (id) {
      if (id) {
        this.$router.push(this.localePath(`/item/${id}`))
      }
    }
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  background-color: white;
}

.search-container:not(.welcome-container) {
  justify-content: end;
  align-items: start;
}

.search-container.welcome-container {
  align-items: center;
  justify-content: center;
}

::v-deep .search-bar .v-text-field__details{
  display: none;
}

::v-deep .search-bar:not(.welcome) .v-input__slot {
  padding-top: unset!important;
  margin: unset;
}

.search-bar {
  width: 100%;
  padding-top: unset;
}

::v-deep .v-application .v-autocomplete__content.v-menu__content {
  width: 598px!important;
}

::v-deep .v-autocomplete .v-input__control {
  background-color: white !important;
  border: 1px solid #dcdcdc !important;
  border-radius: 24px !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

::v-deep .v-autocomplete .v-input__append-inner,
::v-deep .v-autocomplete .v-input__prepend-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep .v-autocomplete .v-input__append-inner .v-icon,
::v-deep .v-autocomplete .v-input__prepend-inner .v-icon {
  color: rgba(0, 0, 0, 0.54);
}

::v-deep .v-autocomplete .v-input__control .v-input__slot {
  padding-top: 10px;
  border-radius: 24px;
}

::v-deep .v-autocomplete .v-input__control:hover,
::v-deep .v-autocomplete .v-input__control:focus-within {
  border-color: #4285f4 !important;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28) !important;
}

::v-deep .v-autocomplete .v-list-item__title {
  color: black;
}
</style>
