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
            <span>{{ $t('item.back') }}</span>
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
                :label="$t('common.label')"
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
        <item-claim-create
          v-if="initialClaimsLoaded"
          :for-create="true"
          :initial-claims="initialClaims"
          @update-claims="updateClaims"
        />
        <v-row class="mt-2" dense>
          <v-spacer />
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
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
              </div>
            </template>
            <span class="text-no-wrap">
              {{
                getCreateDisabledReason() || $t('item.create.button.enabled')
              }}
            </span>
          </v-tooltip>
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
      return !!this.getCreateDisabledReason()
    },
    pbid () {
      return this.initialClaims.find(
        item => item.property.id === this.$wikibase.constructor.PROPERTY_PBID
      ).value
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
    getCreateDisabledReason () {
      if (!this.label) {
        return this.$t('messages.error.inputs.label')
      }

      if (!this.initialClaimsLoaded) {
        return this.$t('messages.error.inputs.initial_claims')
      }

      const claims = Object.entries(this.claims)

      for (let propIndex = 0; propIndex < claims.length; propIndex++) {
        const [, claimArray] = claims[propIndex]
        const initialClaim = this.initialClaims[propIndex]
        const propertyLabel = initialClaim?.property?.label

        if (
          initialClaim?.property?.id === 'P2' ||
          initialClaim?.property?.id === 'P476'
        ) {
          for (const item of claimArray) {
            if (item?.value == null || item?.value === '') {
              return this.$t('messages.error.inputs.claim_value_missing', {
                propertyLabel
              })
            }

            const claimLabel =
              initialClaim?.value?.datavalue?.value?.label || propertyLabel

            for (const [qualifierKey, qualifierVal] of Object.entries(
              item.qualifiers || {}
            )) {
              if (!qualifierKey || qualifierKey === 'null') {
                return this.$t('messages.error.inputs.qualifier_key_missing', {
                  claimLabel,
                  propertyLabel
                })
              }
              if (!qualifierVal || qualifierVal === 'null') {
                return this.$t(
                  'messages.error.inputs.qualifier_value_missing',
                  { claimLabel, propertyLabel }
                )
              }
            }
          }
        }
      }

      return null
    },
    async loadInitialClaims () {
      try {
        const res = await this.$wikibase.getTableLastItem(
          this.database,
          this.table
        )
        if (res?.length && res[0]) {
          await this.getDefaultClaims(res[0].item_number)
          this.initialClaimsLoaded = true
        }
      } catch (error) {
        this.$notification.error(
          error?.body?.error?.info || this.$t('messages.error.something_went_wrong')
        )
      }
    },
    buildClaim (entity, qualifiers = [], value = null) {
      const label =
        this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
          ?.value || entity.id
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
        claimsValues: [],
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
      const res = await this.$wikibase.getClaimsOrderForNewItem(this.table)
      const propertyIds = [...new Set([...def, ...Object.keys(res)])]
      const qualifiersProperties = [...new Set(Object.values(res).flat())]
      const entities = await this.$wikibase.getEntities(
        propertyIds,
        this.$i18n.locale,
        this.table === 'bibid'
      )
      const qualifiersArr = await this.$wikibase.getEntities(
        qualifiersProperties,
        this.$i18n.locale,
        this.table === 'bibid'
      )

      Object.values(entities).forEach((entity) => {
        if (this.isValidPropertyEntity(entity)) {
          const qualifiers = []

          res[entity.id]?.forEach((property) => {
            if (this.isValidPropertyEntity(qualifiersArr[property])) {
              qualifiers.push(
                this.buildQualifier(entity, qualifiersArr[property])
              )
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
          const claimKey = claim?.property?.id

          claims[claimKey] = claims[claimKey] || []
          const extractValue = v =>
            v?.datavalue?.value?.id ?? v?.datavalue?.value

          const createClaim = (val, qualifiers = {}) => ({
            value: extractValue(val),
            qualifiers
          })

          const qualifiers = Object.fromEntries(
            (claim.qualifiers || []).map(q => [q.property, extractValue(q)])
          )

          claims[claimKey].push(createClaim(claim.value, qualifiers));
          (Object.values(claim.claimsValues || {}) || []).forEach((v) => {
            claims[claimKey].push(createClaim(v))
          })
        }
      })
      return claims
    },
    cleanClaims (claims) {
      const cleanedClaims = {}

      for (const [propertyId, claimArray] of Object.entries(claims)) {
        const cleanedClaimArray = []

        for (const claim of claimArray) {
          const value = claim?.value
          if (value == null || value === '') {
            continue
          }

          const cleanedQualifiers = {}
          for (const [qualKey, qualVal] of Object.entries(
            claim.qualifiers || {}
          )) {
            if (
              qualKey &&
              qualKey !== 'null' &&
              qualVal != null &&
              qualVal !== 'null' &&
              qualVal !== ''
            ) {
              cleanedQualifiers[qualKey] = qualVal
            }
          }

          cleanedClaimArray.push({
            value,
            qualifiers: cleanedQualifiers
          })
        }

        if (cleanedClaimArray.length) {
          cleanedClaims[propertyId] = cleanedClaimArray
        }
      }

      return cleanedClaims
    },
    async create () {
      const existingPBID = await this.$wikibase.getEntityFromPBID(this.pbid)
      if (existingPBID === null) {
        try {
          const claims = this.cleanClaims(this.claims)

          const data = {
            labels: {
              [this.$i18n.locale]: this.label
            },
            descriptions: {
              [this.$i18n.locale]: this.description || ' '
            },
            claims: {
              ...claims
            }
          }

          const response = await this.$wikibase
            .getWbEdit()
            .entity.create(data, this.$store.getters['auth/getRequestConfig'])

          if (response.success) {
            await this.$router.push(
              this.localePath('/item/' + response.entity.id)
            )
          } else {
            this.$notification.error(
              this.$t('messages.error.something_went_wrong')
            )
          }
        } catch (error) {
          this.$notification.error(
            error.body.error.info ??
              this.$t('messages.error.something_went_wrong')
          )
        }
      } else {
        this.$notification.error(
          this.$t('messages.error.creation.pbid_already_exists', {
            pbid: this.pbid,
            item: `&nbsp;<a target="_blank" style="color: #ffffff; font-weight: bold;" href="${this.$wikibase.getQItemUrl(existingPBID)}">${existingPBID}</a>`
          })
        )
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
