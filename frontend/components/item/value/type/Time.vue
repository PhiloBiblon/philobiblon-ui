<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-text-field
              type="date"
              :save="editValue"
              :value="valueToView_.value"
              style="width: 200px"
              class="ma-0 pa-0"
            />
            <v-select
              v-model="valueToView_.calendar"
              :label="$t('common.calendar')"
              :items="['Gregorian', 'Julian']"
              class="ma-0 pa-0"
              style="width: 100px"
              @change="editCalendarType"
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
      required: true
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
    }
  },
  methods: {
    editCalendarType (newCalendar) {
      this.valueToView_.calendar = newCalendar
      this.save(this.getTimeValue(this.valueToView_.value, this.valueToView_.value))
        .then((response) => {
          if (response) {
            if (!response.success) {
              throw new Error(response.info)
            }
            this.$notification.success('Successfully updated')
          }
        })
    },
    editValue (newValue, oldValue) {
      this.valueToView_.value = newValue
      return this.save(this.getTimeValue(newValue, oldValue))
    },
    getTimeValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue,
          newValue: {
            time: this.formatDate(newValue),
            calendar: this.valueToView_.calendar.toLowerCase()
          }
        }
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
