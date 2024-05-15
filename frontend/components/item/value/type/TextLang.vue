<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" />
    </template>
    <template v-else>
      <v-container>
        <v-row dense class="justify-start">
          <v-col dense class="flex-shrink-1">
            <item-util-edit-text-field :save="editValue" :value="valueToView_.value" />
            <v-select
              v-model="valueToView_.language"
              item-text="title"
              item-value="value"
              :items="languages"
              :label="$t('common.language')"
              class="ma-0 pa-0"
              style="width: 100px"
              @change="editLanguage"
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
      consolidatedLanguage: this.valueToView.language,
      languages: [
        {
          title: 'English',
          value: 'en'
        },
        {
          title: 'Español',
          value: 'es'
        },
        {
          title: 'Português',
          value: 'pt'
        },
        {
          title: 'Català',
          value: 'ca'
        },
        {
          title: 'Galego',
          value: 'gl'
        }
      ]
    }
  },
  methods: {
    editLanguage (_newLanguage) {
      // We are only changing the language, so the old and new values (text) are the same.
      this.save(this.getMonolingualTextValue(this.valueToView_.value, this.valueToView_.value))
        .then((response) => {
          if (response) {
            if (!response.success) {
              throw new Error(response.info)
            }
            this.consolidatedLanguage = this.valueToView_.language
            this.$notification.success('Successfully updated')
          }
        })
    },
    editValue (newValue, oldValue) {
      this.valueToView_.value = newValue
      return this.save(this.getMonolingualTextValue(newValue, oldValue))
    },
    getMonolingualTextValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue: {
            text: oldValue,
            language: this.consolidatedLanguage
          },
          newValue: {
            text: newValue,
            language: this.valueToView_.language
          }
        }
      }
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
