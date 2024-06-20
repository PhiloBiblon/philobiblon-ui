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
            <item-util-edit-text-field :save="editLabel" :value="label.value" class="text-h4">
              <template #append-outer>
                &nbsp;
                <a
                  class="text-subtitle-2 link"
                  :href="$config.wikibaseBaseUrl + '/wiki/Item:' + item.id"
                  target="_blank"
                >{{ item.id }}</a>
              </template>
            </item-util-edit-text-field>
          </span>
          <span v-else class="text-h4">
            <item-util-view-text-lang :value="label" />
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
          <item-util-edit-text-field :save="editDescription" :value="description.value" class="text-subtitle-1" />
        </span>
        <span v-else class="text-subtitle-1">
          <v-col class="text-subtitle-1">
            <item-util-view-text-lang :value="description" />
          </v-col>
        </span>
      </v-row>
      <item-claim
        v-for="(claim, index) in claimsOrdered"
        :key="'c-' + index"
        :claim="claim"
      />
      <item-value-type-cnum
        v-for="(cnum, index) in cnums"
        :key="'cnum-' + index"
        :value-to-view="cnum"
      />

      <item-value-type-copid
        class="mt-5"
        v-for="(copid, index) in copids"
        :key="'copid-' + index"
        :value-to-view="copid"
      />
    </v-container>
    <div v-else class="loader">
      <v-progress-circular
        size="50"
        width="5"
        indeterminate
        color="primary"
      />
    </div>
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
      cnums: [],
      copids: [],
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
            await this.getAnalyticItems(tableid);
            this.showItem = true
          })
      } catch (err) {
        this.$notification.error(err)
      }
    },
    async getAnalyticItems(table) {
      if (table === 'manid' || table === 'texid') {
        this.cnums = await this.getCnums('cnum', this.label.value, this.label.language);

        const sentence = this.extractSentencesAfterColon(this.label.value);
        const subSentence = this.extractFirstSentence(sentence);
        this.copids = await this.getItemsByLabel('copid',  subSentence , this.label.language);
      }
      if (table === 'cnum') {
        const sentence = this.extractSentencesAfterColon(this.label.value);
        const subSentence = this.extractFirstSentence(sentence);
        const work = await this.getWork(subSentence, this.label.language);

        this.cnums.push(work);
      }
    },
    async getItemsByLabel(table, label, lang) {
      let form = {
        language: lang,
        table: table,
        search_type: {
          value: true,
        },
        simple_search: {
          value: this.extractSentencesAfterColon(label),
        },
      }

      return await this.$wikibase.getItemsByLabel(form);
    },
    async getCnums(table, label, lang) {
      const cnums = await this.getItemsByLabel(table, label, lang);

      return await Promise.all(cnums.map(async (cnum) => {
        const sentence = this.extractSentencesAfterColon(cnum.label);
        const subSentence = this.extractFirstSentence(sentence);

        const work = await this.getWork(subSentence, lang);

        return {
          ...cnum,
          work: work ?? null,
          title: 'Specific witness ID - ',
        };
      }));
    },
    async getWork(label, lang) {
      const response = await this.$wikibase.searchEntityByName(label, lang, lang);

      if (response && response.length) {
        const data = await this.$wikibase.getEntity(response[0].id);

        return {
          item: data.id,
          language: lang,
          title: 'Uniform Title IDno :',
          label: data.labels[lang].value,
          pbid: data.aliases[lang][0].value,
        };
      }
    },
    extractSentencesAfterColon(text) {
      let match;
      const matches = [];
      const regex = /:\s*([^:.]*\.[^:.]*\.)/g;

      while ((match = regex.exec(text)) !== null) {
        matches.push(match[1].trim());
      }

      return matches?.[0] ?? text;
    },
    extractFirstSentence(text) {
      const regex = /[^.!?]*[.!?]/;
      const match = text.match(regex);

      if (match) {
        return match[0].trim();
      } else {
        return text;
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

.loader {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  top: 50%;
  transform: translateY(-50%);
  max-width: max-content;
}
</style>
