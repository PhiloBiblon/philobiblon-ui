<template>
  <div class="statement">
    <v-row
      v-for="(statement, key) in statements"
      :key="key"
      align="center"
      class="even-row"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-subheader class="statement-header grey--text">
          <v-autocomplete
            v-model="statement.property"
            required
            :items="properties[key]"
            item-text="label"
            return-object
            label="Property"
            variant="outlined"
            @update:search-input="onInput($event, 'property', key)"
          />
        </v-subheader>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn :disabled="!canCreate(key)" text icon @click.stop="createStatement(key)">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn text icon @click.stop="removeStatement(key)">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>
      <v-container class="statement-values">
        <div v-if="statement.property">
          <v-autocomplete
            v-if="isAutocomplete(key)"
            v-model="statement.value"
            :items="propertyValues[key]"
            item-text="label"
            return-object
            required
            variant="outlined"
            @update:search-input="onInput($event, 'item', key)"
          />
          <v-text-field
            v-else
            v-model="statement.value"
            :type="fieldType(key)"
          />
        </div>
        <item-qualifier-create :key="statement?.property?.id" @update-qualifiers="updateQualifiers($event, key)" />
      </v-container>
    </v-row>
    <v-row class="back pr-5 mb-2 mt-2" justify="end">
      <a role="button" class="link" @click="addStatement">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ $t("common.add_statement") }}</span>
        </div>
      </a>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      statements: [],
      properties: [],
      propertyValues: []
    }
  },
  methods: {
    canCreate (index) {
      const statement = this.statements[index]

      if (!statement.property || !statement.value) {
        return false
      }

      return statement.qualifiers.every(
        qualifier => qualifier.property && qualifier.value
      )
    },
    addStatement () {
      this.statements.push({
        value: null,
        property: null,
        qualifiers: []
      })
    },
    removeStatement (index) {
      this.statements.splice(index, 1)
      this.properties.splice(index, 1)
      this.propertyValues.splice(index, 1)
    },
    isAutocomplete (index) {
      return this.statements[index].property.datatype === 'wikibase-item'
    },
    fieldType (index) {
      return this.statements[index].property.datatype !== 'time' ? 'text' : 'date'
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
    async createStatement (index) {
      return await this.createClaim(index).then((res) => {
        if (res.success) {
          this.updateClaims(res)
          this.removeStatement(index)
          this.$notification.success(this.$t('messages.success.updated'))
        } else {
          this.$notification.error(this.$t('messages.error.something_went_wrong'))
        }
      }).catch((error) => {
        this.$notification.error(error.message)
      })
    },
    async createClaim (index) {
      const { property, value, qualifiers: rawQualifiers } = this.statements[index]

      const formattedQualifiers = Object.fromEntries(
        (rawQualifiers || [])
          .filter(q => q.property && q.value)
          .map(({ property, value }) => [property, { value }])
      )

      return await this.$wikibase.getWbEdit().claim.create({
        id: this.item.id,
        property: property.id,
        value: value.id ?? value,
        qualifiers: Object.keys(formattedQualifiers).length ? formattedQualifiers : undefined
      }, this.$store.getters['auth/getRequestConfig'])
    },
    updateQualifiers (data, key) {
      this.statements[key].qualifiers = data.map((qualifier) => {
        return {
          property: qualifier?.property?.id,
          value: qualifier?.value?.id ?? qualifier.value
        }
      })
    },
    updateClaims (res) {
      const data = {
        values: [res.claim],
        hasQualifiers: res.claim?.qualifiers,
        property: res.claim.mainsnak.property,
        qualifiersOrder: res.claim['qualifiers-order'] ?? false
      }
      this.$emit('update-claims', data)
    }
  }
}
</script>

<style scoped>
.statement {
  padding: 0;
  margin-top: 25px;
}
.statement-header {
  font-size: 16px;
}
.statement-values {
  background-color: rgb(247, 245, 245);
}
</style>
