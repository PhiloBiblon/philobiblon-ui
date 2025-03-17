<template>
  <v-data-table
    v-if="claim"
    :headers="formattedHeaders"
    :hide-default-header="!Object.values(headers).length"
    :items="claim.values"
    hide-default-footer
    :items-per-page="claim.values.length"
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
          <item-qualifier-list
            v-if="item.qualifiers?.[header.value]"
            :key="item.qualifiers[header.value].length"
            :claim="item"
            :qualifiers="item.qualifiers[header.value]"
            @delete-qualifier="deleteQualifier($event, index)"
          />
        </td>
      </tr>
      <tr v-if="isUserLogged" class="table-row-edit">
        <td :colspan="formattedHeaders.length" class="table-cell-btn-edit">
          <item-qualifier-create
            :claim="item"
            @create-qualifier="createQualifier($event, index)"
          />
        </td>
      </tr>
      <tr v-if="isUserLogged || item.references" class="table-row-edit">
        <td :colspan="formattedHeaders.length">
          <item-reference-base :claim="item" />
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
    await this.getHeaders()
  },
  methods: {
    async getHeaders () {
      const qualifierKeys = new Set()
      this.claim.values.forEach((item) => {
        Object.keys(item.qualifiers ?? {}).forEach(key => qualifierKeys.add(key))
      })
      const qualifiersKeysOrdered = Array.from(qualifierKeys).sort((a, b) => {
        return this.claim.qualifiersOrder ? this.claim.qualifiersOrder.indexOf(a) - this.claim.qualifiersOrder.indexOf(b) : -1
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
    async createQualifier (qualifiers, index) {
      if (!this.claim.values[index].qualifiers) {
        // eslint-disable-next-line vue/no-mutating-props
        this.claim.values[index].qualifiers = []
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.claim.values[index].qualifiers[qualifiers[0].property] = qualifiers
      await this.getHeaders()
    },
    async deleteQualifier (qualifier, index) {
      const qualifiers = this.claim.values[index].qualifiers[qualifier.property]
      const findIndex = qualifiers.findIndex(item => item.hash === qualifier.hash)
      if (findIndex !== -1) {
        qualifiers.splice(findIndex, 1)
      }
      if (!qualifiers.length) {
        // eslint-disable-next-line vue/no-mutating-props
        delete this.claim.values[index].qualifiers[qualifier.property]
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

.table-row-edit {
  border: none;
  background-color: rgb(247, 245, 245);
}

.table-cell {
  border-bottom: none !important;
  padding-top: 8px !important;
}

.table-cell-btn-edit {
  border-top: none !important;
  border-bottom: none !important;
  height: 30px !important;
}

.table-cell:last-child {
  border-right: none;
}

.table-row:hover {
  background-color: #f0f0f0;
}

.table-row-edit:hover {
  background-color: rgb(247, 245, 245) !important;
}
</style>
