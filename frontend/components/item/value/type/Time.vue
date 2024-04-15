<template>
  <div>
    <template v-if="!isUserLogged">
      {{ valueToView.value }} <sup>{{ valueToView.calendar }}</sup>
    </template>
    <template v-else>
      <div class="d-flex align-center">
        <item-util-edit-text-field :save="editValue" type="date" :value="valueToView_.value" />
        <v-select
          class="col-5"
          item-text="title"
          item-value="value"
          :items="calendars"
          @change="editCalendarModel"
          :label="$t('common.calendar')"
          v-model="valueToView_.calendarmodel"
        />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isUserLogged: {
      type: Boolean,
      default: false
    },
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
      calendars: [
        {
          title: 'Gregorian',
          value: 'http://www.wikidata.org/entity/Q1985727',
        },
        {
          title: 'Julian',
          value: 'http://www.wikidata.org/entity/Q1985786',
        }
      ],
    }
  },
  methods: {
    editCalendarModel(newValue) {
      return this.save(this.getCalendarModelValue(newValue)).then(res => {
        if (res.success) {
          this.valueToView_.calendarmodel = newValue
          this.$notification.success('Successfully updated')
        }
      })
    },
    editValue (newValue) {
      return this.save(this.getTimeValue(newValue)).then(res => {
        if (res.success) {
          this.valueToView_.value = newValue
          return res
        }
      })
    },
    getTimeValue (value) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue: this.valueToView.value,
          newValue: {
            ...this.valueToView_.datavalue,
            time: value
          }
        }
      }
    },
    getCalendarModelValue (value) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue: {
            time: this.formatDate(this.valueToView.value),
            calendarmodel: this.valueToView.calendarmodel,
          },
          newValue: {
            calendarmodel: value,
            time: this.formatDate(this.valueToView.value)
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
