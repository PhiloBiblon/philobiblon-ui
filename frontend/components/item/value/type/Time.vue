<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-date-picker-field
              :value="valueToView_.value"
              :mode="mode"
              style="width: 200px"
              class="ma-0 pa-0"
              :save="editValue"
              :delete="!deletable ? null : deleteValue"
              @new-value="newDateValue"
            />
            <v-select
              v-model="valueToView_.calendar"
              :label="$t('common.calendar')"
              :items="['Gregorian', 'Julian']"
              class="ma-0 pa-0"
              style="width: 100px"
              @change="onChangeCalendarType"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
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
    deletable: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      valueToView_: { ...this.valueToView }
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
  methods: {
    newDateValue (value) {
      this.valueToView_.value = value
      this.$emit('new-value', this.getTimeNewValue(this.valueToView_.value))
      this.$emit('on-blur', this.getTimeNewValue(this.valueToView_.value))
    },
    onChangeCalendarType (newCalendar) {
      this.valueToView_.calendar = newCalendar
      if (this.isEditable) {
        this.save(this.getTimeValue(this.valueToView_.value, this.valueToView_.value))
          .then((response) => {
            if (response) {
              if (!response.success) {
                throw new Error(response.info)
              }
              this.$notification.success(this.$i18n.t('messages.success.updated'))
            }
          })
      }
      this.$emit('new-value', this.getTimeNewValue(this.valueToView_.value))
    },
    editValue (newValue, oldValue) {
      this.valueToView_.value = newValue
      return this.save(this.getTimeValue(newValue, oldValue))
    },
    deleteValue () {
      return this.delete()
    },
    getTimeValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue,
          newValue: this.getTimeNewValue(newValue)
        }
      }
    },
    getTimeNewValue (value) {
      return {
        time: this.formatDate(value),
        calendar: this.valueToView_.calendar.toLowerCase()
      }
    },
    formatDate (dateString) {
      const date = new Date(dateString)
      const isoYear = date.getUTCFullYear()
      const isoMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2)
      const isoDay = ('0' + date.getUTCDate()).slice(-2)

      return `+${isoYear}-${isoMonth}-${isoDay}T00:00:00Z`
    }
  }
}
</script>

<style scoped>
::v-deep .v-list-item__title {
  font-size: 12px;
}
::v-deep .v-select__selection {
  font-size: 12px;
}
</style>
