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
              <v-icon
                color="primary"
                v-bind="attrs"
                v-on="on"
              >
                mdi-reply
              </v-icon>
            </template>
            <span>{{ $t('search.item.back') }}</span>
          </v-tooltip>
        </a>
      </v-row>
      <v-row>
        <v-col>
          <span class="text-h4">{{ $wikibase.getValueByLang(item.labels, $i18n.locale) }}</span>
          &nbsp;
          <a class="text-subtitle-2 link" :href="$config.wikibaseBaseUrl+'/wiki/Item:'+item.id" target="_blank">{{ item.id }}</a>
        </v-col>
      </v-row>
      <v-row class="pb-5">
        <v-col class="text-subtitle-1">
          {{ $wikibase.getValueByLang(item.descriptions, $i18n.locale) }}
        </v-col>
      </v-row>
      <claim-viewer
        v-for="(claim, index) in claimsOrdered"
        :key="'c-'+index"
        :claim="claim"
      />
    </v-container>
  </div>
</template>

<script>
const TABLEID_TO_NAME = {
  insid: 'institution',
  libid: 'library',
  manid: 'msed',
  bioid: 'person',
  bibid: 'reference',
  texid: 'work'
}

// TODO use order defined in wikibase
const CLAIM_P_ORDER = [
  'P2', // Instance of
  'P476', // PhiloBiblon ID
  'P34', // Name history
  'P137', // History
  'P47', // Localisation
  'P232', // Institution(s) mentioned
  'P12', // Research literature
  'P143', // Mentioned in
  'P146', // Online information
  'P634', // DOI
  'P438', // Online catalogue
  'P744', // URN formatter
  'P722', // Email address
  'P703', // Associated persons
  'P422', // Subject heading
  'P73', // Note
  'P799', // Dataset status
  'P817', // Notes
  'P17' // Dataset complaint
]

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
      showItem: false,
      claimsOrdered: []
    }
  },

  async mounted () {
    if (this.id) {
      try {
        await this.$wikibase.getEntity(this.id, this.$i18n.locale).then((entity) => {
          this.item = entity
          this.claimsOrdered = this.orderClaims(this.item.claims)
          this.showItem = true
          this.$store.commit('breadcrumb/setItems', this.getBreadcrumbItems(entity))
        })
      } catch (err) {
        this.$notification.error(err)
      }
    }
  },

  methods: {
    getBreadcrumbItems (entity) {
      const pbid = this.$wikibase.getPBID(entity)
      const { groups: { tableid } } = this.$wikibase.getPBIDPattern().exec(pbid)
      const table = TABLEID_TO_NAME[tableid]
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

    orderClaims (claims) {
      const claimPs = Object.keys(claims)
      claimPs.sort(function (x, y) {
        const posX = CLAIM_P_ORDER.indexOf(x)
        const posY = CLAIM_P_ORDER.indexOf(y)
        if (posY === -1) {
          return -1
        }
        if (posX < posY) {
          return -1
        }
        if (posX > posY) {
          return 1
        }
        return 0
      })
      const claimsOrdered = []
      claimPs.forEach((claimP) => {
        claimsOrdered.push({ property: claimP, values: claims[claimP] })
      })
      return claimsOrdered
    }
  }
}
</script>

<style scoped>
.all-width {
  max-width: 100% !important
}
.link {
  text-decoration: none
}
.back {
  font-size: 12px;
  height: 15px;
}
</style>
