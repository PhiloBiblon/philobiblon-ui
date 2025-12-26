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
          <v-btn
            class="mt-4 mr-2"
            color="grey"
            small
            elevation="2"
            outlined
            @click="$router.go(-1)"
          >
            {{ $t('common.cancel') }}
          </v-btn>
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
    this.$nextTick(() => {
      if (!this.isUserLogged || !this.database) {
        return this.$router.push(this.localePath('/'))
      } else {
        this.loadInitialClaims()
      }
    })
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
          initialClaim?.property?.id === 'P476' ||
          (this.table === 'cnum' && initialClaim?.property?.id === 'P590') ||
          (this.table === 'copid' && initialClaim?.property?.id === 'P839')
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
        // eslint-disable-next-line no-console
        console.error(error)
        this.$notification.error(
          error?.body?.error?.info || this.$t('messages.error.something_went_wrong')
        )
      }
    },
    buildClaim (entity, qualifiers = [], value = null, removable = true) {
      const label =
        this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale)
          ?.value || entity.id
      return {
        default: true,
        removable,
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
        this.$i18n.locale
      )
      const qualifiersArr = await this.$wikibase.getEntities(
        qualifiersProperties,
        this.$i18n.locale
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
            claim = this.buildClaim(entity, [], this.generatePbId(itemNumber), false)
          } else if (entity.id === 'P131') {
            // Set default bibliography based on database
            // BETA: Q254471, BITECA: Q256810, BITAGAP: Q256809
            const bibliographyMap = {
              BETA: 'Q254471',
              BITECA: 'Q256810',
              BITAGAP: 'Q256809'
            }
            const bibliographyId = bibliographyMap[this.database] || null

            // P700 (statement refers to) qualifier = Q447226 (PhiloBiblon object)
            const qualifiers = [
              {
                default: true,
                property: 'P700',
                datatype: 'wikibase-item',
                datavalue: {
                  value: {
                    id: 'Q447226'
                  }
                }
              }
            ]

            claim = this.buildClaim(entity, qualifiers, bibliographyId ? { id: bibliographyId } : null)
          } else if (this.table === 'cnum' && entity.id === 'P590') {
            claim = this.buildClaim(entity, qualifiers, null, false)
          } else if (this.table === 'copid' && entity.id === 'P839') {
            claim = this.buildClaim(entity, qualifiers, null, false)
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
      this.generateLabelFromClaims()
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

          claims[claimKey].push(createClaim(claim.value, qualifiers))

          const values = Object.values(claim.claimsValues || {}) || []
          values.forEach((v) => {
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
        this.$notification.error(this.$t('messages.error.creation.pbid_already_exists', {
          pbid: this.pbid,
          item: `&nbsp;<a target="_blank" style="color: #ffffff; font-weight: bold;" href="${this.$wikibase.getQItemUrl(existingPBID)}">${existingPBID}</a>`
        })
        )
      }
    },
    formatTime (raw) {
      const cleaned = raw.replace(/^\+/, '')
      const date = new Date(cleaned)
      return new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    },
    getClaimValue (pbid) {
      const claim = this.initialClaims.find(cl => cl.property?.id === pbid)
      const val = claim?.value?.datavalue?.value

      if (!val) {
        return null
      }
      return typeof val === 'object'
        ? val.label || val.text || this.formatTime(val.time) || val.id
        : val
    },
    generateLabelFromClaims () {
      let label = ''
      switch (this.table) {
        case 'texid': {
          const author = this.getClaimValue('P21')
          const title = this.getClaimValue('P11')
          if (author && title) {
            label = `${author}. ${title}`
          }
          break
        }
        case 'cnum': {
          const work = this.getClaimValue('P590')
          const partOf = this.getClaimValue('P8')
          if (work && partOf) {
            label = `Witness of ${work}, part of ${partOf}`
          }
          break
        }
        case 'bibid': {
          const creator =
            this.getClaimValue('P1134') || this.getClaimValue('P21')
          const title = this.getClaimValue('P11')
          if (creator && title) {
            label = `${creator}. ${title}`
          }
          break
        }
        case 'bioid': {
          const fallbackProps = ['P34', 'P77', 'P173', 'P291', 'P165', 'P746']
          for (const pbid of fallbackProps) {
            const val = this.getClaimValue(pbid)
            if (val) {
              label = val
              break
            }
          }
          break
        }
        case 'manid': {
          const holding = this.getClaimValue('P329')
          const position = this.getClaimValue('P10')
          if (holding && position) {
            label = `${holding}, ${position}`
          }
          break
        }
        case 'copid': {
          const holding = this.getClaimValue('P329')
          const position = this.getClaimValue('P10')
          const edition = this.getClaimValue('P839')
          if (holding && position && edition) {
            label = `${holding}, ${position} (${edition})`
          }
          break
        }
        case 'geoid':
        case 'insid': {
          const name = this.getClaimValue('P34')
          const region = this.getClaimValue('P297')
          if (name && region) {
            label = `${name}, ${region}`
          }
          break
        }
        case 'libid': {
          const name = this.getClaimValue('P34')
          const location = this.getClaimValue('P47')
          if (name && location) {
            label = `${name}, ${location}`
          }
          break
        }
        case 'subid': {
          const name = this.getClaimValue('P34')
          if (name) {
            label = name
          }
          break
        }
        default:
          break
      }

      this.label = label || ''
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
