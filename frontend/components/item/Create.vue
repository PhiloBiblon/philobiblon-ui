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
        <item-claim-create v-if="initialClaimsLoaded" :for-create="true" :initial-claims="initialClaims" @update-claims="updateClaims" />
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
        Object.values(this.claims).some(claim =>
          !claim.value || Object.values(claim.qualifiers || {}).includes(null)
        )
      )
    },
    pbid () {
      return this.claims[this.$wikibase.constructor.PROPERTY_PBID].value
    }
  },
  created () {
    this.getLastItem()
  },
  methods: {
    getLastItem () {
      this.$wikibase.getTableLastItem(this.database, this.table).then(async (res) => {
        if (res && res.length && res[0]) {
          this.initialClaims = [
            {
              property: await this.getClaimProperty('P476'),
              value: {
                property: 'P476',
                datatype: 'external-id',
                datavalue: {
                  value: this.generatePbId(res[0].item_number)
                }
              }
            },
            {
              property: await this.getClaimProperty('P131'),
              value: {
                datatype: 'wikibase-item',
                datavalue: {
                  value: {
                    id: 'Q4'
                  }
                }
              },
              qualifiers: [
                {
                  property: 'P700',
                  datatype: 'wikibase-item',
                  datavalue: {
                    value: {
                      id: 'Q6'
                    }
                  }
                }
              ]
            }
          ]
          this.initialClaimsLoaded = true
        }
      }).catch((error) => {
        this.$notification.error(error.body.error.info ?? this.$t('messages.error.something_went_wrong'))
      })
    },
    getClaimProperty (id) {
      return this.$wikibase
        .getEntity(id, this.$i18n.locale)
        .then((entity) => {
          const value = this.$wikibase.getValueByLang(entity.labels, this.$i18n.locale).value
          return {
            id: entity.id,
            label: value,
            datatype: entity.datatype
          }
        })
    },
    generatePbId (lastItemPbId) {
      return `${this.database} ${this.table} ${parseInt(lastItemPbId) + 1}`
    },
    updateClaims (data) {
      this.claims = this.generateClaimsData(data)
    },
    generateClaimsData (data) {
      const claims = {}
      data.forEach((claim) => {
        if (claim.property) {
          const claimKey = claim.property.id
          claims[claimKey] = {
            value: claim.value.datavalue.value?.id ?? claim.value.datavalue.value,
            qualifiers: {}
          }
          claim.qualifiers?.forEach((qualifier) => {
            claims[claimKey].qualifiers[qualifier.property] = qualifier.value
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
