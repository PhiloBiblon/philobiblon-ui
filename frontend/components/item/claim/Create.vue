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
            @change="onChangeProperty($event, claim)"
            @update:search-input="onInput($event, 'property', key)"
          />
        </v-subheader>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="!forCreate" :disabled="!canCreate(key)" text icon @click.stop="addClaim(key)">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn text icon @click.stop="removeClaim(key)">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>
      <v-container class="claim-values">
        <div v-if="showValue">
          <item-value-base
            :claim="claim"
            :value="claim.value"
            type="claim"
            mode="creation"
            @new-value="onNewValue($event, claim)"
          />
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
    },
    forCreate: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showValue: false,
      claims: [],
      properties: [],
      propertyValues: []
    }
  },
  watch: {
    claims: {
      handler (newValue) {
        if (this.forCreate) {
          this.$emit('update-claims', this.generateClaimsData(newValue))
        }
      },
      deep: true
    }
  },
  methods: {
    generateClaimsData (data) {
      const claims = {}

      data.forEach((claim) => {
        claims[claim.value.property] = {
          value: claim.value.datavalue.value?.id ?? claim.value.datavalue.value,
          qualifiers: {}
        }

        claim.qualifiers.forEach((qualifier) => {
          claims[claim.value.property].qualifiers[qualifier.property] = qualifier.value
        })
      })

      return claims
    },
    onChangeProperty (property, claim) {
      claim.property = property
      claim.value.property = property.id
      claim.value.datatype = property.datatype
      this.refreshValueSection()
    },
    refreshValueSection () {
      this.showValue = false
      this.$nextTick(() => {
        this.showValue = true
      })
    },
    onNewValue (event, claim) {
      claim.value.datavalue.value = event
    },
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
        value: {
          property: null,
          datatype: null,
          datavalue: {
            value: null
          }
        },
        property: null,
        qualifiers: []
      })
    },
    removeClaim (index) {
      this.claims.splice(index, 1)
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
    async addClaim (index) {
      if (this.claims[index].value.datavalue?.value) {
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
      }
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
        value: value.datavalue.value.id ?? value.datavalue.value,
        qualifiers: Object.keys(formattedQualifiers).length ? formattedQualifiers : undefined
      }, this.$store.getters['auth/getRequestConfig'])
    },
    updateQualifiers (data, key) {
      this.claims[key].qualifiers = data.map((qualifier) => {
        return {
          property: qualifier?.property,
          value: qualifier?.datavalue?.value?.id ?? qualifier.datavalue?.value
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
