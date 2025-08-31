<template>
  <v-form ref="search_form">
    <v-container>
      <v-row dense>
        <v-col cols="7">
          <v-radio-group
            v-model="search_group.value"
            :disabled="search_group.disabled"
            row
            @change="onGroupChange"
          >
            <template #label>
              {{ $t('search.form.common.group.label') }}
            </template>
            <v-radio
              v-for="group in groups"
              :key="'g-'+group"
              class="group-option"
              :label="group.text ? group.text : group"
              :value="group.value ? group.value : group"
            />
          </v-radio-group>
        </v-col>
        <v-col cols="1">
          <v-select
            v-if="isBitagapSelected"
            v-model="bitagap_group.value"
            :disabled="bitagap_group.disabled"
            :items="bitagapOptions"
            item-text="text"
            item-value="value"
            :label="$t('search.form.common.bitagap_group.label')"
          />
        </v-col>
        <v-col cols="4" class="d-flex justify-end">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-btn
                  v-if="isUserLogged"
                  small
                  color="primary"
                  class="mr-4"
                  elevation="2"
                  :disabled="isCreateDisabled"
                  v-bind="attrs"
                  v-on="on"
                  @click="goTo(`/item/${table}/create`, { database: search_group.value })"
                >
                  {{ $t('item.create.button.text') }}
                </v-btn>
              </div>
            </template>
            <span v-if="isCreateDisabled">{{ $t('item.create.button.disabled') }}</span>
            <span v-else>{{ $t('item.create.button.enabled') }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <template v-for="(section) in form.section">
        <v-row v-if="!isPrimarySection(section) && existsSectionFilters(section) && !showResults" :key="'header-' + section" dense>
          <span class="section-search text-caption mb-2 primary--text" @click="toggleSectionDisplay(section)">
            {{ $t(`common.search.section.${section}`) }} <v-icon class="primary--text">{{ isSectionDisplayed(section) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </span>
        </v-row>
        <v-row v-if="isSectionDisplayed(section)" :key="'body-' + section" dense>
          <template v-for="(item, name) in getInputsBySection(section)">
            <v-col
              v-if="(item.active && !item.permanent && item.visible)"
              :key="'i-'+name"
              cols="4"
            >
              <search-util-text-field
                v-if="item.type === 'text'"
                v-model="item.value"
                :label="$t(item.label)"
                :hint="$t(item.hint)"
                :disabled="item.disabled"
              />
              <search-util-autocomplete-field
                v-if="item.type === 'autocomplete'"
                :id="'auto-'+name"
                v-model="item.value"
                :label="$t(item.label)"
                :hint="$t(item.hint)"
                :disabled="item.disabled"
                :table="table"
                :autocomplete="item.autocomplete"
                @click.stop
                @reset-value="(val) => item.value = val"
              />
              <search-util-date-field
                v-if="item.type === 'date'"
                :value="item.value"
                :label="$t(item.label)"
                :hint="$t(item.hint)"
                :disabled="item.disabled"
                @update-begin-date="item.value['begin'] = $event"
                @update-end-date="item.value['end'] = $event"
              />
            </v-col>
          </template>
        </v-row>
      </template>
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
            @click="goToHelp()"
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
      bitagap_group: {},
      filtersBySection: {},
      showResults: false,
      isCreateDisabled: true,
      isBitagapSelected: false
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    groups () {
      return ['BETA', 'BITAGAP', 'BITECA', { text: this.$t('search.form.common.group_all.label'), value: 'ALL' }]
    },
    bitagapOptions () {
      return [{ text: 'All', value: 'ALL' }, { text: 'Original', value: 'ORIG' }, { text: 'Cartas', value: 'CARTAS' }]
    }
  },

  watch: {
    showResults (newValue, oldValue) {
      this.$store.commit('queryStatus/setShowResults', newValue)
    }
  },

  created () {
    this.search_group = this.form.input.group
    this.search_type = this.form.input.search_type
    this.bitagap_group = this.form.input.bitagap_group
    this.filtersBySection = this.groupFiltersBySection(this.form)
    const showResults = this.$store.state.queryStatus.showResults
    if (showResults) {
      this.showResults = showResults
    }
  },

  mounted () {
    this.calculateSectionsToDisplay()
    window.addEventListener('keydown', this.keyDownHandler)
  },

  destroyed () {
    window.removeEventListener('keydown', this.keyDownHandler)
  },

  methods: {
    calculateSectionsToDisplay () {
      Object.keys(this.filtersBySection).forEach((section) => {
        if (this.existsSectionFiltersSelected(section)) {
          this.filtersBySection[section].show = true
        } else {
          this.filtersBySection[section].show = false
        }
      })
    },
    existsSectionFiltersSelected (section) {
      return Object.values(this.form.input).some(item => item.section === section && this.isFieldValueNotEmpty(item.value))
    },
    getInputsBySection (section) {
      return this.filtersBySection[section].input.reduce((acc, key) => {
        if (key in this.form.input) {
          acc[key] = this.form.input[key]
        }
        return acc
      }, {})
    },
    isPrimarySection (section) {
      return section === 'primary'
    },
    isSectionDisplayed (section) {
      return this.isPrimarySection(section) || this.filtersBySection[section].show
    },
    toggleSectionDisplay (section) {
      this.filtersBySection[section].show = !this.filtersBySection[section].show
    },
    groupFiltersBySection (form) {
      const filtersBySection = {}
      Object.entries(form.input).forEach(([key, value]) => {
        const section = value.section
        if (section) {
          if (!filtersBySection[section]) {
            filtersBySection[section] = {}
            filtersBySection[section].input = []
            filtersBySection[section].show = false
          }
          filtersBySection[section].input.push(key)
        }
      })
      return filtersBySection
    },
    existsSectionFilters (section) {
      return Object.values(this.form.input).some(item => item.section === section)
    },
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
      for (const key in this.form.input) {
        const item = this.form.input[key]
        if (!item.value ||
          (item.value instanceof Object && Object.keys(item.value).length === 0)) {
          item.visible = false
          // force to change empty object to empty string for autocomplete fields
          // if not, query service detects that a value was filled
          if (item.type === 'autocomplete') {
            item.value = ''
          }
        }
        item.disabled = true
      }
      this.showResults = true
      this.$emit('on-search', this.form)
    },
    back () {
      for (const key in this.form.input) {
        const item = this.form.input[key]
        item.visible = true
        item.disabled = false
      }
      this.showResults = false
      this.calculateSectionsToDisplay()
      this.$store.commit('queryStatus/setForm', JSON.parse(JSON.stringify(this.form)))
      this.$emit('back-search')
    },
    clear () {
      for (const key in this.form.input) {
        const item = this.form.input[key]
        if (item.type === 'date') {
          item.value = {}
        } else {
          item.value = ''
        }
        item.visible = true
        item.disabled = false
      }
      this.search_group.value = 'ALL'
      this.isBitagapSelected = false
      this.bitagap_group.value = 'ALL'
      this.search_type.value = true
      this.showResults = false
      this.calculateSectionsToDisplay()
      this.$store.commit('queryStatus/setForm', null)
      this.$emit('clear-search')
    },
    goTo (path, params) {
      if (this.$i18n.locale !== 'en') {
        path = `/${this.$i18n.locale}${path}`
      }
      this.$router.push({
        path,
        query: params
      })
    },
    goToHelp () {
      this.$router.push(`../../wiki/${this.$i18n.locale}_Help`)
    },
    isFieldValueNotEmpty (item) {
      if (typeof item === 'string' && item !== '') {
        return true
      }
      if (typeof item === 'object' && item != null && Object.keys(item).length > 0) {
        return true
      }
      return false
    },
    onGroupChange (newDatabase) {
      this.isCreateDisabled = newDatabase === 'ALL'
      if (newDatabase === 'BITAGAP' && this.table !== 'libid') {
        this.isBitagapSelected = true
      } else {
        this.isBitagapSelected = false
        this.bitagap_group.value = 'ALL'
      }
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
.section-search {
  cursor: pointer;
}
</style>
