<template>
  <div class="claim">
    <v-row
      v-for="(claim, key) in claims"
      :key="claim?.property?.id"
      class="even-row text-center pt-5"
      no-gutters
      dense
    >
      <v-col class="p-0 pr-3 mt-3">
        <v-subheader class="claim-header grey--text">
          <v-autocomplete
            v-model="claim.property"
            required
            :readonly="claim?.default"
            :items="properties[key]"
            item-text="label"
            return-object
            :label="$t('common.property')"
            variant="outlined"
            :filter="acceptAll"
            @change="onChangeProperty($event, claim)"
            @update:search-input="onInput($event, 'property', key)"
          />
        </v-subheader>
      </v-col>
      <v-col class="p-0 pr-3 d-flex justify-end max-w-100">
        <v-btn v-if="!forCreate" :disabled="!canCreate(key)" text icon @click.stop="addClaim(key)">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">
                mdi-check
              </v-icon>
            </template>
            <span>{{ $t("common.save") }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn v-if="claim?.property?.id !== pbid" text icon @click.stop="removeClaim(key)">
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
      <v-container class="claim-values elevation-1">
        <div v-if="claim?.property?.id || claim.default">
          <item-value-base
            :key="`${claim.property?.id}-${key}`"
            :claim="claim"
            :value="claim.value"
            type="claim"
            mode="creation"
            @new-value="onNewValue($event, claim)"
          />
          <item-qualifier-create
            :key="claim?.property?.id"
            :claim="claim"
            :for-create="forCreate"
            :initial-qualifiers="claim.qualifiers"
            @update-qualifiers="updateQualifiers($event, key)"
          />
        </div>
      </v-container>
      <item-claim-add-value
        v-if="forCreate"
        :key="key"
        class="add-claim-value mb-2"
        :item="item"
        :value="claim.value"
        :for-create="forCreate"
        @update-claims-values="updateClaimValues($event, key)"
      />
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
    initialClaims: {
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
      claims: [],
      properties: []
    }
  },
  computed: {
    pbid () {
      return this.$wikibase.constructor.PROPERTY_PBID
    }
  },
  watch: {
    claims: {
      handler (newValue) {
        if (this.forCreate) {
          this.$emit('update-claims', newValue)
        }
      },
      deep: true
    }
  },
  created () {
    if (this.initialClaims) {
      this.initialClaims.forEach((claim, index) => {
        this.$set(this.properties, index, [claim.property])
        this.claims.push(claim)
      })
    }
  },
  methods: {
    onChangeProperty (property, claim) {
      claim.property = property ?? null
      claim.value.datavalue.value = null
      claim.value.property = property?.id ?? null
      claim.mainsnak.property = property?.id ?? null
      claim.value.datatype = property?.datatype ?? null
    },
    onNewValue (event, claim) {
      claim.value.datavalue.value = event
    },
    canCreate (index) {
      const c = this.claims[index]
      const v = c?.value?.datavalue?.value

      return !!(c?.property && v && (typeof v !== 'object' || Object.values(v).every(val => val != null && val !== '')) &&
        c.qualifiers?.every(q =>
          q?.property && q?.value &&
          (typeof q.value === 'string' ? q.value.trim() : Object.values(q.value).every(v => v != null && v !== ''))
        ))
    },
    addNewClaim () {
      this.claims.push({
        default: false,
        value: {
          property: null,
          datatype: null,
          datavalue: {
            value: null
          }
        },
        claimsValues: [],
        mainsnak: {
          property: null
        },
        property: null,
        qualifiers: []
      })
    },
    removeClaim (index) {
      this.claims.splice(index, 1)
      this.properties.splice(index, 1)
    },
    async onInput (value, type, index) {
      if (value && typeof value === 'string') {
        const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale, type)
        if (search && search.length) {
          this.$set(this.properties, index, search)
        }
      }
    },
    updateClaimValues (data, key) {
      this.claims[key].claimsValues = data
      this.$emit('update-claims', this.claims)
    },
    async addClaim (index) {
      if (this.claims[index]?.value?.datavalue?.value) {
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
        if (!this.forCreate) {
          return {
            property: qualifier?.property,
            value: qualifier?.datavalue?.value?.id ?? qualifier.datavalue?.value
          }
        } else {
          return qualifier
        }
      })
    },
    updateClaims (res) {
      const data = {
        values: [res.claim],
        hasQualifiers: res.claim?.qualifiers,
        property: res.claim.mainsnak.property,
        datatype: res.claim.mainsnak.datatype,
        qualifiersOrder: res.claim['qualifiers-order'] ?? false
      }
      this.$emit('update-claims', data)
    },
    acceptAll (item, queryText, itemText) {
      // We accept all the items because they are already filtered
      return true
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

::v-deep .add-claim-value {
  .add-value {
    margin-top: 0;
  }
  .even-row {
    margin: 1px 0 0 0;
  }
  margin-top: 0;
}
</style>
