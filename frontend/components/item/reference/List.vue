<template>
  <v-data-table
    v-if="valueToView && Object.keys(snaks).length"
    :key="valueToView.hash"
    :items="snaks"
    hide-default-header
    hide-default-footer
    :items-per-page="snaks.length"
    class="elevation-1 mt-1 mb-3 bg-gray"
  >
    <template #item="{ item, index }">
      <tr :key="valueToView.hash" class="table-row">
        <td :class="isUserLogged ? 'table-cell-value-edit' : 'table-cell'" class="col-4">
          <span>{{ item.propertyLabel.value }}</span>
        </td>
        <td :class="isUserLogged ? 'table-cell-value-edit' : 'table-cell'" class="col-8">
          <item-reference-values
            v-if="item.property"
            :key="`${valueToView.hash}-${index}`"
            :claim="claim"
            :values="item.data"
            :reference="valueToView"
            @create-reference="updateReference($event)"
            @delete-reference="$emit('delete-reference', $event)"
          />
        </td>
      </tr>
    </template>
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-if="isUserLogged" #body.append>
      <tr>
        <td :colspan="2" class="full-width">
          <item-reference-create
            :key="valueToView.hash"
            class="mt-5"
            :claim="claim"
            :value="valueToView"
            @create-reference="updateReference($event)"
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
      required: true
    },
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      properties: [],
      valueToView: null
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    snaks () {
      return Object.entries(this.valueToView.snaks).map(([key, value]) => ({
        property: key,
        propertyLabel: this.properties.find(item => item.property === key)?.label || key,
        data: value.map(item => ({
          ...item,
          reference_hash: this.valueToView.hash
        }))
      }))
    }
  },
  async mounted () {
    this.valueToView = this.value
    await this.getProperties()
  },
  methods: {
    async getProperties () {
      const referenceKeys = Object.keys(this.valueToView.snaks ?? {})

      const referenceKeysOrdered = Array.from(referenceKeys).sort((a, b) => {
        return this.valueToView['snaks-order'] ? this.valueToView['snaks-order'].indexOf(a) - this.valueToView['snaks-order'].indexOf(b) : -1
      })
      const headerPromises = Array.from(referenceKeysOrdered).map(async (property) => {
        const entity = await this.$wikibase.getEntity(property, this.$i18n.locale)
        return {
          property,
          label: this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
        }
      })
      this.properties = await Promise.all(headerPromises)
    },
    async updateReference (data) {
      this.valueToView = data.reference ?? data
      await this.getProperties()
    }
  }
}
</script>

<style scoped>
.bg-gray {
  background-color: rgb(247, 245, 245);
}

.table-row {
  background-color: rgb(247, 245, 245);
}
.w-100
.table-cell {
  border: none;
}

.table-cell-value-edit {
  padding-top: 8px !important;
}

.table-cell:last-child {
  border-right: none;
}
.full-width {
  width: 100% !important;
}
</style>
