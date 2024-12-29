<template>
  <div>
    <span v-if="!isUserLogged">
      {{ valueToView.value.amount }} <item-util-view-text-lang :value="unitLabel" />
    </span>
    <div v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-text-field
              :save="editAmount"
              :value="valueToView_.value.amount"
              style="width: 200px"
              class="ma-0 pa-0"
            />
            <item-util-edit-select-field
              :value="selectedUnit"
              :save="editUnit"
              :options="unitOptions"
              style="width: 200px"
              @update-options="unitOptions = $event"
              @input="oninput($event)"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    valueToView: {
      type: Object,
      default: null
    },
    save: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      valueToView_: { ...this.valueToView },
      unitItemId: null,
      unitLabel: null,
      selectedUnit: '',
      unitOptions: []
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },
  async mounted () {
    this.unitItemId = this.extractItemNumber(this.valueToView.value.unit)
    await this.$wikibase
      .getEntity(this.unitItemId, this.$i18n.locale)
      .then((entity) => {
        this.unitLabel = this.$wikibase.getValueByLang(
          entity.labels,
          this.$i18n.locale
        )
        this.setUnitOptions()
      })
  },
  methods: {
    extractItemNumber (url) {
      return url.substring(url.lastIndexOf('/') + 1)
    },
    editUnit (newUnit) {
      const oldUnit = this.valueToView_.value.unit
      this.valueToView_.value.unit = newUnit.concepturi
      return this.save(this.getQuantityValue({ amount: this.valueToView_.value.amount, unit: newUnit.concepturi }, { amount: this.valueToView_.value.amount, unit: oldUnit }))
    },
    editAmount (newAmount, oldValue) {
      this.valueToView_.value.amount = newAmount
      return this.save(this.getQuantityValue({ amount: newAmount, unit: this.valueToView_.value.unit }, oldValue))
    },
    getQuantityValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue,
          newValue
        }
      }
    },
    oninput (e) {
      if (e) { this.handleSearchChange(e) }
    },
    async handleSearchChange (value) {
      if (value) {
        const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
        if (search && search.length) { this.unitOptions = search }
      }
    },
    setUnitOptions () {
      this.unitOptions = [{
        id: this.unitItemId,
        label: this.unitLabel.value
      }]
      this.selectedUnit = this.unitLabel.value
    }
  }
}
</script>
