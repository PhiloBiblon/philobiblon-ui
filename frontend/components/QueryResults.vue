<template>
  <div>
    <v-tabs
      v-if="showResults"
      v-model="currentTab"
      height="20"
    >
      <v-tab key="results">
        {{ $t('search.results.results') }} ({{ totalResults }})
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-if="showResults"
      v-model="currentTab"
    >
      <v-tab-item key="results">
        <v-container v-if="totalResults == 0">
          <span>{{ $t('search.results.not_found') }}</span>
        </v-container>
        <v-container v-if="totalResults > 0" class="container-max">
          <v-row dense>
            <v-col class="order-last order-sm-first" cols="10">
              <v-list>
                <v-list-item-group
                  v-model="selectedItem"
                  color="primary"
                >
                  <v-list-item v-for="(result, index) in results" :key="'r-'+index" @click="goToItem(result.item)">
                    <v-list-item-content>
                      <span>{{ result.label }}&nbsp;&nbsp;&nbsp;<span class="text-caption">{{ result.pbid }}</span></span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col>
              <v-container class="container-max">
                <v-row justify="end" dense>
                  <v-col class="text-right text-caption">
                    <span>{{ $t('search.results.sort_by') }}</span>
                  </v-col>
                  <v-col cols="auto" class="sort-select-field">
                    <v-select
                      v-model="sortBy"
                      :items="sortItems"
                      items-text="text"
                      items-value="value"
                      class="text-body-2"
                      dense
                      @change="changeSortByID"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-icon
                      v-if="!isSortByID && !isSortDescending"
                      dense
                      @click="changeSortDescending"
                    >
                      mdi-sort-alphabetical-ascending
                    </v-icon>
                    <v-icon
                      v-if="!isSortByID && isSortDescending"
                      dense
                      @click="changeSortDescending"
                    >
                      mdi-sort-alphabetical-descending
                    </v-icon>
                    <v-icon
                      v-if="isSortByID && !isSortDescending"
                      dense
                      @click="changeSortDescending"
                    >
                      mdi-sort-numeric-ascending
                    </v-icon>
                    <v-icon
                      v-if="isSortByID && isSortDescending"
                      dense
                      @click="changeSortDescending"
                    >
                      mdi-sort-numeric-descending
                    </v-icon>
                  </v-col>
                </v-row>
                <v-row justify="end" dense>
                  <v-col class="text-right text-caption">
                    <a :href="$config.sparqlBaseUrl+'/#'+encodeURI(sparqlQuery)" target="_blank">SPARQL</a>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-container>
        <div class="text-center">
          <v-pagination
            v-if="showResults && results.length > 0"
            v-model="currentPage"
            :length="Math.ceil(totalResults / resultsPerPage)"
            :total-visible="5"
            circle
            @input="changePage"
          />
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
export default {

  props: {
    sparqlQuery: {
      type: String,
      default: null
    },
    results: {
      type: Array,
      default: null
    },
    totalResults: {
      type: Number,
      default: 0
    },
    resultsPerPage: {
      type: Number,
      default: 0
    },
    showResults: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      currentTab: null,
      selectedItem: '',
      sortItems: [
        {
          text: this.$i18n.t('search.results.sort_option.id'),
          value: 'id'
        },
        {
          text: this.$i18n.t('search.results.sort_option.name'),
          value: 'name'
        }
      ],
      sortBy: null,
      currentPage: null
    }
  },

  computed: {
    isSortDescending () {
      return this.$store.state.queryStatus.isSortDescending
    },

    isSortByID () {
      return this.sortBy === 'id'
    }
  },

  beforeUpdate () {
    this.sortBy = this.$store.state.queryStatus.sortBy
    this.currentPage = this.$store.state.queryStatus.currentPage
  },

  methods: {
    changePage (val) {
      this.$store.commit('queryStatus/setPage', val)
      this.$emit('on-pagination', val)
    },

    changeSortByID () {
      this.$store.commit('queryStatus/setSortBy', this.sortBy)
      this.$emit('on-sort-by-id', this.isSortByID)
    },

    changeSortDescending () {
      this.$store.commit('queryStatus/setSortDescending', !this.isSortDescending)
      this.$emit('on-sort-descending', !this.isSortDescending)
    },

    goToItem (id) {
      this.$router.push(this.localePath('/item/' + id))
    }
  }
}
</script>

<style scoped>
.container-max {
  max-width: 100% !important;
  padding: 2px 0 0 0;
}
.sort-select-field {
  padding: 4px 0 0 0;
  width: 75px;
}
</style>
