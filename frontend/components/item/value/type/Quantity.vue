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
              :label="$t('common.amount')"
              :value="valueToView_.value.amount"
              :save="editAmount"
              :delete="deleteValue"
              :mode="mode"
              style="width: 200px"
              class="ma-0 pa-0"
              @new-value="newDateValue"
              @on-blur="$emit('on-blur', $event)"
            />
            <item-util-edit-select-field
              :label="$t('common.unit')"
              :value="selectedUnit"
              :save="editUnit"
              :options="unitOptions"
              :mode="mode"
              style="width: 200px"
              @update-options="unitOptions = $event"
              @input="oninput($event)"
              @new-value="newUnitValue"
              @on-blur="$emit('on-blur', $event)"
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
      default: null
    },
    delete: {
      type: Function,
      default: null
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      valueToView_: this.getInitialValue(),
      newValue_: {
        amount: null,
        unit: null
      },
      unitItemId: null,
      unitLabel: null,
      selectedUnit: '',
      unitOptions: []
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isEditable () {
      return this.mode === 'edit'
    }
  },
  async mounted () {
    if (this.valueToView_?.value?.unit) {
      this.unitItemId = this.extractItemNumber(this.valueToView_.value.unit)
      // it seems that 1 is the default value for undefined unit
      if (this.unitItemId !== '1') {
        await this.$wikibase
          .getEntity(this.unitItemId, this.$i18n.locale)
          .then((entity) => {
            this.unitLabel = this.$wikibase.getValueByLang(
              entity.labels,
              this.$i18n.locale
            )
            this.setUnitOptions()
          })
      }
    }
  },
  methods: {
    getInitialValue () {
      const initialValue = this.valueToView
      if (!initialValue.value) {
        initialValue.value = {
          amount: '',
          unit: ''
        }
      }
      return initialValue
    },
    newDateValue (value) {
      this.newValue_.amount = value
      this.$emit('new-value', this.newValue_)
    },
    newUnitValue (value) {
      this.newValue_.unit = value.concepturi
      this.$emit('new-value', this.newValue_)
    },
    extractItemNumber (url) {
      return url.substring(url.lastIndexOf('/') + 1)
    },
    editUnit (newUnit) {
      const oldUnit = this.valueToView_.value.unit
      this.valueToView_.value.unit = newUnit.concepturi
      return this.save(this.getQuantityValue(this.valueToView_.value, { amount: this.valueToView_.value.amount, unit: oldUnit }))
    },
    editAmount (newAmount, oldValue) {
      this.valueToView_.value.amount = newAmount
      return this.save(this.getQuantityValue(this.valueToView_.value, oldValue))
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
    },
    deleteValue () {
      return this.delete()
    }
  }
}
</script>
