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
          :readonly="qualifier?.default"
          :items="properties[key]"
          item-text="label"
          item-value="id"
          variant="outlined"
          @change="onChangeProperty($event, key)"
          @update:search-input="onInput($event, 'property', key)"
        />
      </v-col>
      <v-col class="p-0 pr-3 pt-3">
        <div v-if="claim?.mainsnak?.property || qualifier.default">
          <item-value-base
            :key="`${qualifier.property}-${key}`"
            :database="database"
            :label="$t('common.value')"
            :claim="claim"
            :value="qualifier"
            type="qualifier"
            mode="creation"
            @on-blur="onNewValue($event, qualifier)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="allowCreateQualifier(qualifier)" text icon @click.stop="createQualifier(key)">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">
                mdi-check
              </v-icon>
            </template>
            <span>{{ $t("common.save") }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn v-if="claim" text icon @click.stop="removeQualifier(key)">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">
                mdi-trash-can
              </v-icon>
            </template>
            <span>{{ $t("common.remove") }}</span>
          </v-tooltip>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-if="isAllowedAddQualifier"
      class="add-qualifier pr-5"
      justify="end"
    >
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
    database: {
      type: String,
      default: null
    },
    claim: {
      type: Object,
      default: null
    },
    initialQualifiers: {
      type: Array,
      default: null
    },
    forCreate: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      properties: [],
      qualifiers: [],
      propertyValues: []
    }
  },
  computed: {
    pbid () {
      return this.$wikibase.constructor.PROPERTY_PBID
    },
    isAllowedAddQualifier () {
      return this.claim && this.claim.mainsnak.property !== this.$wikibase.constructor.PROPERTY_NOTES
    }
  },
  watch: {
    qualifiers: {
      handler (val) {
        if (!this.claim || this.forCreate) {
          this.$emit('update-qualifiers', val)
        }
      },
      deep: true
    }
  },
  created () {
    if (this.initialQualifiers) {
      this.initialQualifiers.forEach((qualifier, index) => {
        this.$set(this.properties, index, [qualifier.property])
        this.qualifiers.push(qualifier)
      })
    }
  },
  methods: {
    allowCreateQualifier (qualifier) {
      return this.claim && !this.forCreate && qualifier.property && qualifier.datavalue?.value
    },
    onNewValue (event, qualifier) {
      qualifier.datavalue.value = event
    },
    onChangeProperty (event, index) {
      const qualifier = this.qualifiers[index]
      qualifier.property = event?.id
      qualifier.datatype = event?.datatype
      qualifier.datavalue = {
        value: null
      }
    },
    addQualifier () {
      this.qualifiers.push({
        property: null,
        datatype: null,
        datavalue: {
          value: null
        }
      })
    },
    removeQualifier (index) {
      this.qualifiers.splice(index, 1)
      this.properties.splice(index, 1)
      this.propertyValues.splice(index, 1)
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
      const qualifier = this.qualifiers[index]
      await this.$wikibase.getWbEdit().qualifier.add({
        guid: this.claim.id,
        value: qualifier.datavalue.value.id ?? qualifier.datavalue.value,
        property: qualifier.property
      }, this.$store.getters['auth/getRequestConfig']).then((res) => {
        if (res.success) {
          this.updateQualifiers(res.claim.qualifiers[qualifier.property])
          this.removeQualifier(index)
          this.$notification.success(this.$t('messages.success.updated'))
        } else {
          this.$notification.success(this.$t('messages.error.something_went_wrong'))
        }
      }).catch((error) => {
        this.$notification.error(error)
      })
    },
    updateQualifiers (qualifiers) {
      this.$emit('create-qualifier', qualifiers)
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
