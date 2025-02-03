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
          item-value="id"
          variant="outlined"
          @change="onChangeProperty($event, key)"
          @update:search-input="onInput($event, 'property', key)"
        />
      </v-col>
      <v-col class="p-0 pr-3 pt-3">
        <div v-if="showValue">
          <item-value-base
            :label="$t('common.value')"
            :claim="claim"
            :value="qualifier"
            type="qualifier"
            mode="creation"
            @new-value="onNewValue($event, qualifier)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="allowCreateQualifier(qualifier)" text icon @click.stop="createQualifier(key)">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-if="claim" text icon @click.stop="removeQualifier(key)">
          <v-icon>mdi-trash-can</v-icon>
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
    claim: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      showValue: false,
      properties: [],
      qualifiers: [],
      propertyValues: []
    }
  },
  computed: {
    isAllowedAddQualifier () {
      return this.claim.mainsnak.property !== this.$wikibase.constructor.PROPERTY_NOTES
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
    allowCreateQualifier (qualifier) {
      return this.claim && qualifier.property && qualifier.datavalue?.value
    },
    onNewValue (event, qualifier) {
      qualifier.datavalue.value = event
    },
    onChangeProperty (event, index) {
      const qualifier = this.qualifiers[index]
      qualifier.property = event.id
      qualifier.datatype = event.datatype
      qualifier.datavalue = {
        value: null
      }
      this.refreshValueSection()
    },
    refreshValueSection () {
      this.showValue = false
      this.$nextTick(() => {
        this.showValue = true
      })
    },
    addQualifier () {
      this.qualifiers.push({
        property: null,
        type: null,
        datavalue: {
          value: null
        }
      })
    },
    removeQualifier (index) {
      this.qualifiers.splice(index, 1)
      this.properties.splice(index, 1)
      this.propertyValues.splice(index, 1)
      this.showValue = false
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
