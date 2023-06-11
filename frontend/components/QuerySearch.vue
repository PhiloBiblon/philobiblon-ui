<template>
  <v-form ref="search_form">
    <v-container>
      <v-row dense>
        <v-radio-group
          v-model="search_group.value"
          :disabled="search_group.disabled"
          row
        >
          <template #label>
            {{ $t('search.form.common.group.label') }}
          </template>
          <v-radio
            v-for="group in groups"
            :key="'g-'+group"
            class="group-option"
            :label="group.text ? group.text : group"
            :value="group.value ? group.value: group"
          />
        </v-radio-group>
      </v-row>
      <v-row dense>
        <template v-for="(item, name) in form">
          <v-col
            v-if="(item.active && !item.permanent && item.visible)"
            :key="'i-'+name"
            cols="4"
          >
            <search-text-field
              v-if="item.type === 'text'"
              v-model="item.value"
              :label="$t(item.label)"
              :hint="$t(item.hint)"
              :disabled="item.disabled"
            />
            <search-autocomplete-field
              v-if="item.type === 'autocomplete'"
              :id="'auto-'+name"
              v-model="item.value"
              :items="getAutocompleteItems(name)"
              :label="$t(item.label)"
              :hint="$t(item.hint)"
              :disabled="item.disabled"
              @click.stop
            />
          </v-col>
        </template>
      </v-row>
      <v-row dense>
        <v-col
          cols="7"
        >
          <v-btn
            v-if="!showResults"
            ref="search"
            class="mr-4"
            small
            elevation="2"
            @click="search"
          >
            {{ $t('search.button.search') }}
          </v-btn>
          <v-btn
            v-if="showResults"
            elevation="2"
            class="mr-4"
            small
            :disabled="waitingResults"
            @click="back"
          >
            {{ $t('search.button.back') }}
          </v-btn>
          <v-btn
            elevation="2"
            class="mr-4"
            small
            :disabled="waitingResults"
            @click="clear"
          >
            {{ $t('search.button.clear') }}
          </v-btn>
        </v-col>
        <v-col
          cols="4"
          class="search-type"
        >
          <v-switch
            v-model="search_type.value"
            dense
            :disabled="search_type.disabled"
            :label="search_type.value ? $t('search.form.common.search_type.all_words') : $t('search.form.common.search_type.any_word')"
          />
        </v-col>
        <v-col
          cols="1"
        >
          <v-icon
            color="primary"
            @click="goToHelp"
          >
            mdi-help-circle
          </v-icon>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {

  props: {
    table: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      default: null
    },
    waitingResults: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      search_group: {},
      search_type: {},
      showResults: false,
      autocomplete: {
        city: {
          items: [],
          queryFunction: (table, lang) => { return this.$wikibase.$query.citiesQuery(table, lang) }
        },
        subject: {
          items: [],
          queryFunction: (table, lang) => { return this.$wikibase.$query.subjectsQuery(table, lang) },
          resultFunction: (result) => { return { text: result.label, value: { item: result.item, property: result.property } } }
        },
        institution_type: {
          items: [],
          queryFunction: (table, lang) => { return this.$wikibase.$query.institutionTypesQuery(table, lang) }
        },
        institution: {
          items: [],
          queryFunction: (table, lang) => { return this.$wikibase.$query.institutionQuery(table, lang) }
        }
      }
    }
  },

  computed: {
    groups () {
      return ['BETA', 'BITAGAP', 'BITECA', { text: this.$t('search.form.common.group_all.label'), value: 'ALL' }]
    }
  },

  watch: {
    showResults (newValue, oldValue) {
      this.$store.commit('queryStatus/setShowResults', newValue)
    }
  },

  mounted () {
    this.search_group = this.form.group
    this.search_type = this.form.search_type
    const showResults = this.$store.state.queryStatus.showResults
    if (showResults) {
      this.showResults = showResults
    }
    Object.entries(this.form).forEach(
      ([key, field]) => {
        if (field.type === 'autocomplete') {
          this.populateItemsAutocomplete(key, this.autocomplete[key])
        }
      }
    )
    window.addEventListener('keydown', this.keyDownHandler)
  },

  destroyed () {
    window.removeEventListener('keydown', this.keyDownHandler)
  },

  methods: {
    keyDownHandler (event) {
      if (event.code === 'Enter') {
        // Not search in autocomplete fields to avoid weird display errors
        if (document.activeElement.id && document.activeElement.id.startsWith('auto')) {
          return
        }
        this.$refs.search.$el.focus()
        this.search()
      }
    },
    search () {
      for (const key in this.form) {
        const item = this.form[key]
        if (!item.value) {
          item.visible = false
        }
        item.disabled = true
      }
      this.search_group.disabled = true
      this.search_type.disabled = true
      this.showResults = true
      this.$emit('on-search', this.form)
    },

    back () {
      for (const key in this.form) {
        const item = this.form[key]
        item.visible = true
        item.disabled = false
      }
      this.search_group.disabled = false
      this.search_type.disabled = false
      this.showResults = false
      this.$store.commit('queryStatus/setForm', JSON.parse(JSON.stringify(this.form)))
      this.$emit('back-search')
    },

    clear () {
      for (const key in this.form) {
        const item = this.form[key]
        item.value = ''
        item.visible = true
        item.disabled = false
      }
      this.search_group.value = 'ALL'
      this.search_type.value = true
      this.showResults = false
      this.$store.commit('queryStatus/setForm', null)
      this.$emit('clear-search')
    },

    goToHelp () {
      window.location.href = 'https://bancroft.berkeley.edu/philobiblon/help_en.html'
    },

    getAutocompleteItems (field) {
      return this.autocomplete[field].items
    },

    populateItemsAutocomplete (autocompleteKey, autocompleteField) {
      let resultFunction = autocompleteField.resultFunction
      if (!resultFunction) {
        resultFunction = (result) => { return { text: result.label, value: result.item } }
      }
      this.$wikibase.runSparqlQuery(autocompleteField.queryFunction(this.table, this.$i18n.locale), true)
        .then((results) => {
          this.autocomplete[autocompleteKey].items = []
          Object.entries(results).forEach(
            ([key, result]) => {
              this.autocomplete[autocompleteKey].items.push(resultFunction(result))
            }
          )
        }
        )
    }
  }
}
</script>

<style scoped>
.search-type {
  margin-top: 0;
  padding-top: 0;
}
.group-option {
  padding-right: 30px;
}
</style>
