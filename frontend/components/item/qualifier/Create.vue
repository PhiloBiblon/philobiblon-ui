<template>
  <div class="create-qualifier">
    <v-row v-if="show" class="even-row" align="center" no-gutters dense>
      <v-col class="p-0 pr-3">
        <v-autocomplete
          v-model="property"
          required
          return-object
          :items="items"
          item-text="label"
          variant="outlined"
          @update:search-input="onInput($event, 'property')"
        />
      </v-col>
      <v-col v-if="property" class="p-0 pr-3">
        <v-autocomplete
          v-if="isAutocomplete"
          v-model="value"
          required
          return-object
          :items="valueItems"
          item-text="label"
          variant="outlined"
          @update:search-input="onInput($event, 'item')"
        />
        <v-text-field
          v-else
          v-model="value"
          :type="textFieldType"
        />
      </v-col>
      <v-col v-if="property && value" class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn text icon @click.stop="createQualifier">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn text icon @click.stop="restore">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="back pr-5 mb-2 mt-2" justify="end">
      <a role="button" class="link" @click="show = !show">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <div class="align-center">
              <v-icon v-if="!show" color="primary" v-bind="attrs" v-on="on">
                mdi-plus
              </v-icon>
              <v-icon v-else color="primary" v-bind="attrs" v-on="on">
                mdi-minus
              </v-icon>
              <span v-if="!show">{{ $t("common.add_qualifier") }}</span>
              <span v-else>{{ $t("common.cancel") }}</span>
            </div>
          </template>
          <span v-if="!show">{{ $t("common.add_qualifier") }}</span>
          <span v-else>{{ $t("common.cancel") }}</span>
        </v-tooltip>
      </a>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      value: '',
      items: [],
      show: false,
      property: '',
      valueItems: []
    }
  },
  computed: {
    isAutocomplete () {
      return this.property.datatype === 'wikibase-item'
    },
    textFieldType () {
      return this.property.datatype !== 'time' ? 'text' : 'date'
    }
  },
  watch: {
    show (val) {
      if (!val) {
        this.restore()
      }
    }
  },
  methods: {
    onInput (value, type) {
      if (value && typeof value === 'string') {
        this.handleSearchChange(value, type)
      }
    },
    async handleSearchChange (value, type) {
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale, type)
      if (search && search.length) {
        if (type === 'property') {
          this.items = search
        } else {
          this.valueItems = search
        }
      }
    },
    async createQualifier () {
      await this.$wikibase.getWbEdit().qualifier.add({
        guid: this.claim.id,
        value: this.value.id ?? this.value,
        property: this.property.id
      }, this.$store.getters['auth/getRequestConfig']).then((res) => {
        if (res.success) {
          this.updateQualifiers(res)
          this.restore()
          this.$notification.success('Successfully updated')
        } else {
          this.$notification.success('Something went wrong!')
        }
      }).catch((error) => {
        this.$notification.error(error)
      })
    },
    updateQualifiers (res) {
      const data = {
        claim: res.claim
      }
      this.$emit('create-qualifier', data)
    },
    restore () {
      this.value = ''
      this.items = []
      this.show = false
      this.property = ''
      this.valueItems = []
    }
  }
}
</script>
<style scoped>
.create-qualifier {
  padding: 0;
}
.max-w-100 {
  max-width: 100px !important;
}
::v-deep .v-text-field__details {
  display: none;
}
</style>
