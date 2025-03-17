<template>
  <div class="create-reference">
    <v-row
      v-for="(reference, key) in references"
      :key="key"
      align="center"
      class="even-row"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-autocomplete
          v-model="reference.property"
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
        <div v-if="reference.property">
          <item-value-base
            :key="`${key}-${reference.property}`"
            :label="$t('common.value')"
            :claim="claim"
            :value="reference"
            type="reference"
            mode="creation"
            @new-value="onNewValue($event, reference)"
          />
        </div>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn
          text
          icon
          :disabled="!reference.property || !reference?.datavalue?.value"
          @click.stop="createReference(key)"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-if="claim" text icon @click.stop="removeReference(key)">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      class="add-reference pr-5"
      justify="end"
    >
      <a role="button" class="link" @click="addReference">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ !value ? $t("common.add_reference") : $t("common.add") }}</span>
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
      required: true
    },
    value: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      properties: [],
      references: [],
      propertyValues: []
    }
  },
  watch: {
    references: {
      handler (val) {
        if (!this.claim) {
          this.$emit('update-references', val)
        }
      },
      deep: true
    }
  },
  methods: {
    onNewValue (event, reference) {
      reference.datavalue.value = event
    },
    onChangeProperty (event, index) {
      const reference = this.references[index]
      reference.property = event.id
      reference.datatype = event.datatype
      reference.datavalue = {
        value: null
      }
    },
    addReference () {
      this.references.push({
        property: null,
        type: null,
        datavalue: {
          value: null
        }
      })
    },
    removeReference (index) {
      this.references.splice(index, 1)
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
    async createReference (index) {
      let data
      const reference = this.references[index]

      if (!this.value) {
        data = {
          guid: this.claim.id,
          value: reference.datavalue.value.id ?? reference.datavalue.value,
          property: reference.property
        }
      } else {
        const values = {
          ...this.value.snaks,
          [reference.property]: [...(this.value.snaks[reference.property] || []), reference]
        }

        const formattedSnaks = Object.entries(values).reduce((acc, [key, values]) => {
          acc[key] = values.map(v => v.datavalue.value.id ?? v.datavalue.value)
          return acc
        }, {})
        data = {
          guid: this.claim.id,
          snaks: formattedSnaks,
          hash: this.value.hash,
          property: this.value.property
        }
      }

      await this.$wikibase.getWbEdit().reference.add(data, this.$store.getters['auth/getRequestConfig'])
        .then((res) => {
          if (res.success) {
            this.updateReferences(res.reference)
            this.removeReference(index)
            this.$notification.success(this.$t('messages.success.updated'))
          } else {
            this.$notification.success(this.$t('messages.error.something_went_wrong'))
          }
        }).catch((error) => {
          this.$notification.error(error)
        })
    },
    updateReferences (reference) {
      this.$emit('create-reference', reference)
    }
  }
}
</script>
<style scoped>
.add-reference {
  margin-bottom: 5px;
}
.create-reference {
  padding: 0;
}
.max-w-100 {
  max-width: 100px !important;
}
::v-deep .v-text-field__details {
  display: none;
}
</style>
