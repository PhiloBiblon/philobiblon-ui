<template>
  <div class="all-width">
    <v-container v-if="showItem">
      <!--
      <v-row>
        {{ item }}
      </v-row>
      -->
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
      <v-row>
        <v-col>
          <span v-if="isUserLogged">
            <edit-text-field :save="editLabel" :value="label.value" class="text-h4">
              <template #append-outer>
                &nbsp;
                <a
                  class="text-subtitle-2 link"
                  :href="$config.wikibaseBaseUrl + '/wiki/Item:' + item.id"
                  target="_blank"
                >{{ item.id }}</a>
              </template>
            </edit-text-field>
          </span>
          <span v-else class="text-h4">
            <text-lang :value="label" />
            &nbsp;
            <a
              class="text-subtitle-2 link"
              :href="$config.wikibaseBaseUrl + '/wiki/Item:' + item.id"
              target="_blank"
            >{{ item.id }}</a>
          </span>
        </v-col>
      </v-row>
      <v-row class="pb-5">
        <span v-if="isUserLogged" class="full-width">
          <edit-text-field :save="editDescription" :value="description.value" class="text-subtitle-1" />
        </span>
        <span v-else class="text-subtitle-1">
          <v-col class="text-subtitle-1">
            <text-lang :value="description" />
          </v-col>
        </span>
      </v-row>
      <claim-viewer
        v-for="(claim, index) in claimsOrdered"
        :key="'c-' + index"
        :claim="claim"
      />
    </v-container>
  </div>
</template>

<script>

export default {
  props: {
    id: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      item: null,
      label: null,
      showItem: false,
      claimsOrdered: []
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },

  async mounted () {
    if (this.id) {
      await this.getClaims()
    }
  },

  methods: {
    async getClaims () {
      try {
        await this.$wikibase
          .getEntity(this.id, this.$i18n.locale)
          .then(async (entity) => {
            const tableid = this.getRelatedTable(entity)
            this.$store.commit('breadcrumb/setItems', this.getBreadcrumbItems(tableid, entity))
            this.item = entity
            this.label = this.$wikibase.getValueByLang(
              this.item.labels,
              this.$i18n.locale
            )
            this.description = this.$wikibase.getValueByLang(this.item.descriptions, this.$i18n.locale)
            this.claimsOrdered = await this.getOrderedClaims(tableid, this.item.claims)
            this.showItem = true
          })
      } catch (err) {
        this.$notification.error(err)
      }
    },
    getRelatedTable (entity) {
      const pbid = this.$wikibase.getPBID(entity)
      const {
        groups: { tableid }
      } = this.$wikibase.getPBIDPattern().exec(pbid)
      return tableid
    },
    getBreadcrumbItems (table, entity) {
      return [
        {
          text: this.$i18n.t('menu.item.search.label'),
          disabled: true
        },
        {
          text: this.$i18n.t('menu.item.search.item.' + table + '.label'),
          disabled: false,
          to: this.localePath('/search/' + table + '/query')
        },
        {
          text: this.$wikibase.getPBID(entity),
          disabled: true
        }
      ]
    },
    getOrderedQualifiers (qualifiers, qualifiersOrder) {
      return qualifiersOrder.reduce((result, key) => {
        if (Object.prototype.hasOwnProperty.call(qualifiers, key)) {
          result[key] = qualifiers[key]
        }
        return result
      }, {})
    },
    getOrderedValues (values, qualifiersOrder) {
      return values.map((value) => {
        if (value.qualifiers) {
          const clonedValue = { ...value }
          clonedValue.qualifiers = this.getOrderedQualifiers(clonedValue.qualifiers, qualifiersOrder)
          return clonedValue
        } else {
          return value
        }
      })
    },
    async getOrderedClaims (table, claims) {
      let order = await this.$wikibase.getClaimsOrder(table)
      if (!order) {
        order = Object.keys(claims)
      }
      return Object.keys(order).filter(key => Object.prototype.hasOwnProperty.call(claims, key)).map(key => ({ property: key, values: this.getOrderedValues(claims[key], order[key]) }))
    },
    editLabel (label) {
      return this.$wikibase
        .getWbEdit()
        .label.set(
          { id: this.item.id, language: this.$i18n.locale, value: label },
          this.$store.getters['auth/getRequestConfig']
        )
    },
    editDescription (description) {
      return this.$wikibase
        .getWbEdit()
        .description.set(
          { id: this.item.id, language: this.$i18n.locale, value: description },
          this.$store.getters['auth/getRequestConfig']
        )
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
  height: 15px;
}
.full-width {
  width: 100%;
}
</style>
