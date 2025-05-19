<template>
  <v-container class="claim">
    <v-row v-if="showClaimInput" class="even-row" dense>
      <v-col>
        <item-value-base
          :item="item"
          :deletable="false"
          type="claim-creation"
          :value="defaultClaim"
          @create-claim="$emit('create-claim', $event)"
        />
      </v-col>
    </v-row>
    <v-row class="back pr-5 mt-1 add-value" justify="end">
      <a role="button" class="link" @click="showClaimInput = !showClaimInput">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <div class="align-center">
              <v-icon v-if="!showClaimInput" color="primary" v-bind="attrs" v-on="on">
                mdi-plus
              </v-icon>
              <v-icon v-else color="primary" v-bind="attrs" v-on="on">
                mdi-minus
              </v-icon>
              <span v-if="!showClaimInput">{{ $t("common.add_value") }}</span>
              <span v-else>{{ $t("common.cancel") }}</span>
            </div>
          </template>
        </v-tooltip>
      </a>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null
    },
    claim: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      claims: [],
      showClaimInput: false,
      defaultClaim: this.createDefaultClaim()
    }
  },
  methods: {
    createDefaultClaim () {
      const firstClaim = this.claim?.values?.[0]?.mainsnak
      return {
        property: firstClaim?.property || '',
        datatype: firstClaim?.datatype || '',
        datavalue: {
          value: ''
        }
      }
    },
    oninput (value) {
      if (value && typeof value === 'string') {
        this.handleSearchChange(value)
      }
    },
    async handleSearchChange (value) {
      const search = await this.$wikibase.searchEntityByName(value, this.$i18n.locale, this.$i18n.locale)
      if (search && search.length) {
        this.claims = search
      }
    }
  }
}
</script>
<style scoped>
.add-value {
  background-color: white;
}
.claim {
  padding: 0;
}
.even-row {
  background-color: rgb(247, 245, 245);
  padding: 3px;
  margin: 5px;
  border-radius: 5px;
}
</style>
