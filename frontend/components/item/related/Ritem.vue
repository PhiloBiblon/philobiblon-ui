<template>
  <v-expansion-panels class="mb-2">
    <v-expansion-panel class="cnum">
      <v-expansion-panel-header class="cnum">
        <div class="related-item-header">
          <!-- Row 1: Name -->
          <div class="row-1">
            <span class="mb-0 ml-3">#{{ index + 1 }}</span>
            <NuxtLink class="ml-1 black--text" :to="url">
              <span>{{ pbid }}</span>
            </NuxtLink>
            <span class="ml-1">
              <item-util-view-text-lang :value="label" />
            </span>
          </div>
          <!-- Row 2: Qualifiers summary -->
          <div v-if="qualifierSummary" class="row-2 ml-3 mt-1">
            <span class="qualifier-summary text-caption grey--text">
              {{ qualifierSummary }}
            </span>
          </div>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div>
          <item-claims :table="table" :item="item" :claims="claims" />
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    table: {
      type: String,
      required: true
    },
    value: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
      default: null
    }
  },

  data () {
    return {
      label: null,
      item: null,
      claims: null
    }
  },

  computed: {
    pbid () {
      return this.value.item_pbid
    },
    url () {
      return this.localePath(`/item/${this.value.item}`)
    },
    qualifierSummary () {
      if (!this.claims || this.claims.length === 0) {
        return null
      }
      // Extract key qualifier values to show as summary
      const summaryParts = []
      const maxClaims = 3 // Limit to first 3 claims for brevity

      for (let i = 0; i < Math.min(this.claims.length, maxClaims); i++) {
        const claim = this.claims[i]
        if (claim.values && claim.values.length > 0) {
          // Get the first value's display text
          const firstValue = claim.values[0]
          let displayText = this.getValueDisplayText(firstValue)
          if (displayText) {
            // Include property label if available
            const propertyLabel = claim.propertyLabel || claim.property
            summaryParts.push(`${propertyLabel}: ${displayText}`)
          }
        }
      }

      return summaryParts.length > 0 ? summaryParts.join(' | ') : null
    }
  },

  async mounted () {
    if (this.value.item) {
      await this.getEntity()
    }
  },

  methods: {
    async getEntity () {
      try {
        await this.$wikibase
          .getEntity(this.value.item, this.$i18n.locale)
          .then(async (entity) => {
            this.item = entity
            this.claims = await this.$wikibase.getOrderedClaims(this.table, entity.claims)
            this.label = this.$wikibase.getValueByLang(this.item.labels, this.$i18n.locale)
          })
      } catch (err) {
        this.$notification.error(err)
      }
    },
    getValueDisplayText (value) {
      // Extract display text from various value types
      if (!value || !value.mainsnak || !value.mainsnak.datavalue) {
        return null
      }
      const datavalue = value.mainsnak.datavalue
      switch (datavalue.type) {
        case 'string':
          return datavalue.value
        case 'monolingualtext':
          return datavalue.value?.text
        case 'time':
          return this.formatTime(datavalue.value)
        case 'wikibase-entityid':
          // For entity references, we'd need the label - use the value if available
          return value.value || datavalue.value?.id
        default:
          return value.value || null
      }
    },
    formatTime (timeValue) {
      if (!timeValue || !timeValue.time) {
        return null
      }
      // Parse the time string (format: +YYYY-MM-DDT00:00:00Z)
      const match = timeValue.time.match(/([+-]?\d+)-(\d{2})-(\d{2})/)
      if (match) {
        const year = parseInt(match[1])
        const month = parseInt(match[2])
        const day = parseInt(match[3])
        // Return appropriate precision
        if (timeValue.precision >= 11) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        } else if (timeValue.precision >= 10) {
          return `${year}-${String(month).padStart(2, '0')}`
        } else {
          return String(year)
        }
      }
      return null
    }
  }
}
</script>

<style scoped>
.cnum {
  background-color: rgb(247, 245, 245);
}

.related-item-header {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.row-1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.row-2 {
  padding-left: 24px; /* Align with the content after #index */
}

.qualifier-summary {
  font-style: italic;
  line-height: 1.4;
}
</style>
