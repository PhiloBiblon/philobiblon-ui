<template>
  <div class="create-qualifier">
    <v-row
      v-for="(qualifier, key) in qualifiers"
      :key="key"
      align="center"
      class="even-row"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-autocomplete
          v-model="qualifier.property"
          :label="$t('common.property')"
          required
          return-object
          :items="properties[key]"
          item-text="label"
          variant="outlined"
          @update:search-input="onInput($event, 'property', key)"
        />
      </v-col>
      <v-col class="p-0 pr-3">
        <div v-if="qualifier.property">
          <div v-if="fieldType(key) === 'autocomplete'">
            <v-autocomplete
              v-model="qualifier.value"
              :label="$t('common.value')"
              required
              return-object
              :items="propertyValues[key]"
              item-text="label"
              variant="outlined"
              @update:search-input="onInput($event, 'item', key)"
            />
          </div>
          <div v-if="fieldType(key) === 'date'">
            <item-util-edit-date-picker-field
              :value="qualifier.value"
              style="width: 200px"
              class="ma-0 pa-0"
              @new-value="qualifier.value = $event"
            />
          </div>
          <div v-if="fieldType(key) === 'text'">
            <v-text-field
              v-model="qualifier.value"
              :label="$t('common.value')"
            />
          </div>
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="claim && qualifier.property && qualifier.value" text icon @click.stop="createQualifier(key)">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-if="claim" text icon @click.stop="removeQualifier(key)">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="add-qualifier pr-5" justify="end">
      <a role="button" class="link" @click="addQualifier">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ $t("common.add_qualifier") }}</span>
        </div>
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
      properties: [],
      qualifiers: [],
      propertyValues: []
    }
  },
  watch: {
    qualifiers: {
      handler (val) {
        if (!this.claim) {
          this.$emit('update-qualifiers', val)
        }
      },
      deep: true
    }
  },
  methods: {
    addQualifier () {
      this.qualifiers.push({
        value: null,
        property: null
      })
    },
    removeQualifier (index) {
      this.qualifiers.splice(index, 1)
      this.properties.splice(index, 1)
      this.propertyValues.splice(index, 1)
    },
    fieldType (index) {
      switch (this.qualifiers[index].property.datatype) {
        case 'wikibase-item':
          return 'autocomplete'
        case 'time':
          return 'date'
        default:
          return 'text'
      }
    },
    async onInput (value, type, index) {
      if (value && typeof value === 'string') {
        const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale, type)
        if (search && search.length) {
          if (type === 'property') {
            this.$set(this.properties, index, search)
          } else {
            this.$set(this.propertyValues, index, search)
          }
        }
      }
    },
    async createQualifier (index) {
      await this.$wikibase.getWbEdit().qualifier.add({
        guid: this.claim.id,
        value: this.qualifiers[index].value.id ?? this.qualifiers[index].value,
        property: this.qualifiers[index].property.id
      }, this.$store.getters['auth/getRequestConfig']).then((res) => {
        if (res.success) {
          this.updateQualifiers(res)
          this.removeQualifier(index)
          this.$notification.success(this.$t('messages.success.updated'))
        } else {
          this.$notification.success(this.$t('messages.error.something_went_wrong'))
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
    }
  }
}
</script>
<style scoped>
.add-qualifier {
  margin-bottom: 5px;
}
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
