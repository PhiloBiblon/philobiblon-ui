<template>
  <v-data-table
    :headers="formattedHeaders"
    :items="claim.values"
    hide-default-footer
    :items-per-page="claim.values.length"
    class="elevation-1"
  >
    <template #item="{ item }">
      <tr class="table-row">
        <td v-for="(header, key) in formattedHeaders" :key="header.value" class="table-cell">
          <item-value-base
            v-if="!key"
            :claim="item"
            :value="item.mainsnak"
            type="claim"
            :in-table="true"
            :column-width="header.width"
          />
          <item-qualifier-value
            v-if="item.qualifiers?.[header.value]"
            :value="item.qualifiers[header.value][0]"
            :claim="claim"
          />
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      default: () => ({ values: [] })
    }
  },
  data () {
    return {
      headers: []
    }
  },
  computed: {
    formattedHeaders () {
      return [
        { text: 'Event', value: 'event', sortable: false, width: '400px' },
        ...this.headers.map(header => ({
          text: header.label.value,
          value: header.property,
          sortable: false
        }))
      ]
    }
  },
  async mounted () {
    await this.getHeaders()
  },
  methods: {
    async getHeaders () {
      const qualifierKeys = new Set()
      this.claim.values.forEach((item) => {
        Object.keys(item.qualifiers ?? {}).forEach(key => qualifierKeys.add(key))
      })

      const headerPromises = Array.from(qualifierKeys).map(async (property) => {
        const entity = await this.$wikibase.getEntity(property, this.$i18n.locale)

        return {
          property,
          label: this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
        }
      })

      this.headers = await Promise.all(headerPromises)
    }
  }
}
</script>

<style scoped>
::v-deep .v-data-table-header th {
  background-color: #e0e0e0;
  color: black;
  font-weight: bold;
  text-transform: uppercase;
}

::v-deep .v-data-table-header th {
  border-right: 1px solid #b0b0b0;
}

::v-deep .v-data-table-header th:last-child {
  border-right: none;
}

.table-row {
  border-bottom: 1px solid #b0b0b0;
}

.table-cell {
  border-right: 1px solid #b0b0b0;
  padding: 8px;
}

.table-cell:last-child {
  border-right: none;
}

.table-row:hover {
  background-color: #f0f0f0;
}
</style>
