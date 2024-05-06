<template>
  <div>
    <template v-if="!isUserLogged">
      <item-util-view-text-lang :value="valueToView" />
    </template>
    <template v-else>
      <div class="d-flex align-center">
        <item-util-edit-text-field :save="editValue" :value="valueToView_.value" class="pl-0 col-9" />
        <v-select
          item-text="title"
          item-value="value"
          :items="languages"
          @change="editLanguage"
          class="mt-0 pt-0 col-3"
          :label="$t('common.language')"
          v-model="valueToView_.language"
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
      languages: [
        {
          title: 'Latin',
          value: 'la',
        },
        {
          title: 'English',
          value: 'en',
        },
        {
          title: 'Spanish',
          value: 'es',
        },
        {
          title: 'Portuguese',
          value: 'pt',
        },
        {
          title: 'Catalan',
          value: 'ca',
        },
        {
          title: 'German',
          value: 'de',
        },
        {
          title: 'French',
          value: 'fr',
        },
        {
          title: 'Italian',
          value: 'it',
        },
        {
          title: 'Dutch',
          value: 'nl',
        },
      ],
    }
  },
  methods: {
    editLanguage (newLanguage) {
      this.valueToView_.language = newLanguage
      this.save(this.getMonolingualTextValue(this.valueToView_.value))
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
      return this.save(this.getMonolingualTextValue(newValue, oldValue))
    },
    getMonolingualTextValue (newValue, oldValue) {
      return {
        validation: {
          valid: true
        },
        values: {
          oldValue,
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
::v-deep .v-list-item__content {
  padding: 0;
}
::v-deep .v-select__selection {
  font-size: 12px;
}
</style>
