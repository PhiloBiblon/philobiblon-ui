<template>
  <div class="all-width">
    <v-container>
      <v-row class="back">
        <a class="link" @click="$router.go(-1)">
          <v-tooltip right>
            <template #activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on">
                mdi-reply
              </v-icon>
            </template>
            <span>{{ $t("item.back") }}</span>
          </v-tooltip>
        </a>
      </v-row>
      <template v-if="isUserLogged">
        <v-row>
          <v-col>
            <v-form ref="form">
              <v-text-field
                v-model="label"
                type="text"
                class="text-h4"
                :label="$t('item.title')"
              />
              <v-text-field
                v-model="description"
                type="text"
                class="text-subtitle-1"
                :label="$t('item.description')"
              />
            </v-form>
          </v-col>
        </v-row>
        <v-alert v-if="!initialClaimsLoaded" type="info">
          {{ $t('item.create.calculating_new_pbid') }}
        </v-alert>
        <item-claim-create v-if="initialClaimsLoaded" :key="initialClaims.length" :for-create="true" :initial-claims="initialClaims" @update-claims="updateClaims" />
        <v-row dense>
          <v-spacer />
          <v-btn
            class="mt-4"
            color="primary"
            small
            elevation="2"
            :disabled="isCreateDisabled"
            @click="create"
          >
            {{ $t('common.create') }}
          </v-btn>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script>
export default {
  props: {
    database: {
      type: String,
      required: true
    },
    table: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      label: '',
      initialClaimsLoaded: false,
      initialClaims: [],
      claims: [],
      disabled: true,
      description: ''
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    isCreateDisabled () {
      return (
        !this.label ||
        !this.description ||
        !this.initialClaimsLoaded ||
        Object.values(this.initialClaims).some(claim =>
          !claim?.value?.datavalue?.value ||
          Object.values(claim?.value?.datavalue?.value).some(val => val == null || val === '') ||
          Object.values(claim.qualifiers || {}).some((q) => {
            return !q?.datavalue?.value || Object.values(q?.datavalue?.value).some(val => val == null || val === '')
          })
        )
      )
    },
    pbid () {
      return this.initialClaims.find(item => item.property.id === this.$wikibase.constructor.PROPERTY_PBID).value
    }
  },
  created () {
    if (!this.isUserLogged || this.database === 'All') {
      return this.$router.push(this.localePath('/'))
    } else {
      this.loadInitialClaims()
    }
  },
  methods: {
    async loadInitialClaims () {
      try {
        const res = await this.$wikibase.getTableLastItem(this.database, this.table)
        if (res?.length && res[0]) {
          await this.getDefaultClaims(res[0].item_number)
          this.initialClaimsLoaded = true
        }
      } catch (error) {
        this.$notification.error(error?.body?.error?.info || this.$t('messages.error.something_went_wrong'))
      }
    },
    buildClaim (entity, qualifiers = [], value = null) {
      const label = this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)?.value || entity.id
      return {
        default: true,
        property: {
          label,
          id: entity.id,
          datatype: entity.datatype
        },
        mainsnak: {
          property: entity.id
        },
        value: {
          property: entity.id,
          datatype: entity.datatype,
          datavalue: {
            default: true,
            value
          }
        },
        qualifiers
      }
    },
    buildQualifier (claim, qualifier) {
      return {
        default: true,
        property: qualifier.id,
        datatype: qualifier.datatype,
        datavalue: {
          value: null
        }
      }
    },
    async getDefaultClaims (itemNumber) {
      const def = ['P476', 'P131']
      const res = await this.$wikibase.getClaimsOrder(this.table)
      const propertyIds = [...new Set([...def, ...Object.keys(res)])]
      const qualifiersProperties = [...new Set(Object.values(res).flat())]
      const entities = await this.$wikibase.getEntities(propertyIds, this.$i18n.locale)
      const qualifiersArr = await this.$wikibase.getEntities(qualifiersProperties, this.$i18n.locale)

      Object.values(entities).forEach((entity) => {
        if (this.isValidPropertyEntity(entity)) {
          const qualifiers = []

          res[entity.id]?.forEach((property) => {
            if (this.isValidPropertyEntity(qualifiersArr[property])) {
              qualifiers.push(this.buildQualifier(entity, qualifiersArr[property]))
            }
          })

          let claim = this.buildClaim(entity, qualifiers, null)

          if (entity.id === 'P476') {
            claim = this.buildClaim(entity, [], this.generatePbId(itemNumber))
          } else if (entity.id === 'P131') {
            const qualifiers = [
              {
                default: true,
                property: 'P700',
                datatype: 'wikibase-item',
                datavalue: {
                  value: {
                    id: 'Q6'
                  }
                }
              }
            ]

            claim = this.buildClaim(entity, qualifiers, { id: 'Q4' })
          }

          this.initialClaims.push(claim)
        }
      })
    },
    isValidPropertyEntity (entity) {
      return entity?.title?.startsWith('Property:') && entity?.labels
    },
    generatePbId (lastItemPbId) {
      return `${this.database} ${this.table} ${parseInt(lastItemPbId) + 1}`
    },
    updateClaims (data) {
      this.initialClaims = data
      this.claims = this.generateClaimsData(data)
    },
    generateClaimsData (data) {
      const claims = {}
      data.forEach((claim) => {
        if (claim.property) {
          const claimKey = claim.property.id
          claims[claimKey] = {
            value: claim?.value?.datavalue?.value?.id ?? claim?.value?.datavalue?.value,
            qualifiers: {}
          }
          claim.qualifiers?.forEach((qualifier) => {
            claims[claimKey].qualifiers[qualifier.property] = qualifier?.datavalue?.value?.id ?? qualifier?.datavalue?.value
          })
        }
      })
      return claims
    },
    async create () {
      const existingPBID = await this.$wikibase.getEntityFromPBID(this.pbid)
      if (existingPBID === null) {
        try {
          const data = {
            labels: {
              [this.$i18n.locale]: this.label
            },
            descriptions: {
              [this.$i18n.locale]: this.description
            },
            claims: {
              ...this.claims
            }
          }
          const response = await this.$wikibase.getWbEdit().entity.create(data, this.$store.getters['auth/getRequestConfig'])

          if (response.success) {
            await this.$router.push(this.localePath('/item/' + response.entity.id))
          } else {
            this.$notification.error(this.$t('messages.error.something_went_wrong'))
          }
        } catch (error) {
          this.$notification.error(error.body.error.info ?? this.$t('messages.error.something_went_wrong'))
        }
      } else {
        this.$notification.error(this.$t('messages.error.creation.pbid_already_exists', {
          pbid: this.pbid,
          item: `&nbsp;<a target="_blank" style="color: #ffffff; font-weight: bold;" href="${this.$wikibase.getQItemUrl(existingPBID)}">${existingPBID}</a>`
        }))
      }
    }
  }
}
</script>

<style scoped>
.all-width {
  max-width: 100% !important;
}
.link {
  text-decoration: none;
}
.back {
  font-size: 12px;
  height: 25px;
}
</style>
