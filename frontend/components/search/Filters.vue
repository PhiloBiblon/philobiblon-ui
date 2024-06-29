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
            :value="group.value ? group.value : group"
          />
        </v-radio-group>
      </v-row>
      <v-row dense>
        <template v-for="(item, name) in primaryFilters">
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
      <v-row v-if="existsAdvancedFilters && !showResults" dense>
        <span class="advanced-search text-caption mb-2 primary--text" @click="showAdvancedSearch = !showAdvancedSearch">
          {{ $t('common.advanced_search') }} <v-icon class="primary--text">{{ showAdvancedSearch ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </span>
      </v-row>
      <v-row v-if="showAdvancedSearch" dense>
        <template v-for="(item, name) in advancedFilters">
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
      showAdvancedSearch: false
    }
  },

  computed: {
    groups () {
      return ['BETA', 'BITAGAP', 'BITECA', { text: this.$t('search.form.common.group_all.label'), value: 'ALL' }]
    },
    primaryFilters () {
      return Object.entries(this.form).reduce((acc, [key, value]) => {
        if (value.primary) {
          acc[key] = value
        }
        return acc
      }, {})
    },
    advancedFilters () {
      return Object.entries(this.form).reduce((acc, [key, value]) => {
        if (!value.primary) {
          acc[key] = value
        }
        return acc
      }, {})
    },
    existsAdvancedFilters () {
      return Object.values(this.form).some(item => item.primary === false)
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
        if (!item.value ||
          (item.value instanceof Object && Object.keys(item.value).length === 0)) {
          item.visible = false
        }
        item.disabled = true
      }
      this.showResults = true
      this.$emit('on-search', this.form)
    },

    back () {
      for (const key in this.form) {
        const item = this.form[key]
        item.visible = true
        item.disabled = false
      }
      this.showResults = false
      this.$store.commit('queryStatus/setForm', JSON.parse(JSON.stringify(this.form)))
      this.$emit('back-search')
    },

    clear () {
      for (const key in this.form) {
        const item = this.form[key]
        if (item.type === 'date') {
          item.value = {}
        } else {
          item.value = ''
        }
        item.visible = true
        item.disabled = false
      }
      this.search_group.value = 'ALL'
      this.search_type.value = true
      this.showResults = false
      this.showAdvancedSearch = false
      this.$store.commit('queryStatus/setForm', null)
      this.$emit('clear-search')
    },

    goToHelp () {
      window.location.href = 'https://bancroft.berkeley.edu/philobiblon/help_en.html'
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
.advanced-search {
  cursor: pointer;
}
</style>
