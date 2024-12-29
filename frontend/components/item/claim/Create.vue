<template>
  <div class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="key"
      align="center"
      class="even-row"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3">
        <v-subheader class="claim-header grey--text">
          <v-autocomplete
            v-model="claim.property"
            required
            :items="properties[key]"
            item-text="label"
            return-object
            :label="$t('common.property')"
            variant="outlined"
            @update:search-input="onInput($event, 'property', key)"
          />
        </v-subheader>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn :disabled="!canCreate(key)" text icon @click.stop="addClaim(key)">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn text icon @click.stop="removeClaim(key)">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>
      <v-container class="claim-values">
        <div v-if="claim.property">
          <div v-if="fieldType(key) === 'autocomplete'">
            <v-autocomplete
              v-model="claim.value"
              :items="propertyValues[key]"
              item-text="label"
              return-object
              required
              variant="outlined"
              @update:search-input="onInput($event, 'item', key)"
            />
          </div>
          <div v-if="fieldType(key) === 'date'">
            <item-util-edit-date-picker-field
              :value="claim.value"
              style="width: 200px"
              class="ma-0 pa-0"
              @new-value="claim.value = $event"
            />
          </div>
          <div v-if="fieldType(key) === 'text'">
            <v-text-field
              v-model="claim.value"
              :type="fieldType(key)"
            />
          </div>
        </div>
        <item-qualifier-create :key="claim?.property?.id" @update-qualifiers="updateQualifiers($event, key)" />
      </v-container>
    </v-row>
    <v-row class="back pr-5 mb-2 mt-2" justify="end">
      <a role="button" class="link" @click="addNewClaim">
        <div class="align-center">
          <v-icon color="primary">
            mdi-plus
          </v-icon>
          <span>{{ $t("common.add_claim") }}</span>
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
      claims: [],
      properties: [],
      propertyValues: []
    }
  },
  methods: {
    canCreate (index) {
      const claim = this.claims[index]

      if (!claim.property || !claim.value) {
        return false
      }

      return claim.qualifiers.every(
        qualifier => qualifier.property && qualifier.value
      )
    },
    addNewClaim () {
      this.claims.push({
        value: null,
        property: null,
        qualifiers: []
      })
    },
    removeClaim (index) {
      this.claims.splice(index, 1)
      this.properties.splice(index, 1)
      this.propertyValues.splice(index, 1)
    },
    fieldType (index) {
      switch (this.claims[index].property.datatype) {
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
    async addClaim (index) {
      return await this.createClaim(index).then((res) => {
        if (res.success) {
          this.updateClaims(res)
          this.removeClaim(index)
          this.$notification.success(this.$t('messages.success.updated'))
        } else {
          this.$notification.error(this.$t('messages.error.something_went_wrong'))
        }
      }).catch((error) => {
        this.$notification.error(error.message)
      })
    },
    async createClaim (index) {
      const { property, value, qualifiers: rawQualifiers } = this.claims[index]

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
      this.claims[key].qualifiers = data.map((qualifier) => {
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
.claim {
  padding: 0;
  margin-top: 25px;
}
.claim-header {
  font-size: 16px;
}
.claim-values {
  background-color: rgb(247, 245, 245);
}
</style>
