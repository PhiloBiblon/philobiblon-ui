<template>
  <v-data-table
    v-if="claimValue"
    :headers="formattedHeaders"
    :hide-default-header="!Object.values(headers).length"
    :items="claimValue.values"
    hide-default-footer
    :items-per-page="claimValue.values.length"
    class="elevation-1"
  >
    <template #item="{ item, index }">
      <tr class="table-row">
        <td v-for="(header, key) in formattedHeaders" :key="header.value" class="table-cell">
          <item-value-base
            v-if="!key"
            :claim="item"
            :value="item.mainsnak"
            type="claim"
            :in-table="true"
            :column-width="header.width"
            @delete-claim="$emit('delete-claim', $event)"
          />
          <item-qualifier-value
            v-if="item.qualifiers?.[header.value]"
            :value="item.qualifiers[header.value][0]"
            :claim="item"
            @delete-qualifier="deleteQualifier($event, index)"
          />
        </td>
      </tr>
      <tr v-if="isUserLogged" class="table-row">
        <td :colspan="formattedHeaders.length" class="table-cell-full-width">
          <item-qualifier-create
            :claim="item"
            @create-qualifier="createQualifier($event, index)"
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
      headers: [],
      claimValue: null
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    formattedHeaders () {
      return [
        { text: '', value: '', sortable: false },
        ...this.headers.map(header => ({
          text: header.label.value,
          value: header.property,
          sortable: false
        }))
      ]
    }
  },
  async mounted () {
    this.claimValue = this.claim
    await this.getHeaders()
  },
  methods: {
    async getHeaders () {
      const qualifierKeys = new Set()
      this.claimValue.values.forEach((item) => {
        Object.keys(item.qualifiers ?? {}).forEach(key => qualifierKeys.add(key))
      })
      const qualifiersKeysOrdered = Array.from(qualifierKeys).sort((a, b) => {
        return this.claimValue.qualifiersOrder ? this.claimValue.qualifiersOrder.indexOf(a) - this.claimValue.qualifiersOrder.indexOf(b) : -1
      })
      const headerPromises = Array.from(qualifiersKeysOrdered).map(async (property) => {
        const entity = await this.$wikibase.getEntity(property, this.$i18n.locale)
        return {
          property,
          label: this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
        }
      })

      this.headers = await Promise.all(headerPromises)
    },
    async createQualifier (data, index) {
      this.claimValue.values[index].qualifiers = data.claim.qualifiers

      await this.getHeaders()
    },
    async deleteQualifier (data, index) {
      const findIndex = this.claimValue.values[index].qualifiers[data.property].findIndex(item => item.id === data.id)
      if (findIndex !== -1) {
        delete this.claimValue.values[index].qualifiers[data.property]
      }

      await this.getHeaders()
    }
  }
}
</script>

<style scoped>
::v-deep .v-data-table-header th {
  background-color: #e0e0e0;
  color: black;
  font-weight: bold;
  border: none;
}

::v-deep .v-data-table-header th:last-child {
  border-right: none;
}

.table-row {
  border: none;
  background-color: rgb(247, 245, 245);
}

.table-cell {
  padding: 4px;
  border: none;
}

.table-cell:last-child {
  border-right: none;
}

.table-row:hover {
  background-color: #f0f0f0;
}
</style>
