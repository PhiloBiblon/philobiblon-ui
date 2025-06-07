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
            <item-util-edit-text-field :label="$t('item.title')" :save="editLabel" :value="label.value" class="text-h4">
              <template #append-outer>
                &nbsp;
                <a
                  class="text-subtitle-2 link"
                  :href="$wikibase.getQItemUrl(item.id)"
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
              :href="$wikibase.getQItemUrl(item.id)"
              target="_blank"
            >{{ item.id }}</a>
          </span>
        </v-col>
      </v-row>
      <v-row class="pb-5">
        <span v-if="isUserLogged" class="full-width">
          <item-util-edit-text-field :label="$t('item.description')" :save="editDescription" :value="description.value" class="text-subtitle-1" />
        </span>
        <span v-else class="text-subtitle-1">
          <v-col class="text-subtitle-1">
            <item-util-view-text-lang :value="description" />
          </v-col>
        </span>
      </v-row>
      <item-claims :table="tableid" :claims="item.claims" :item="item" />
      <item-related-tables :item-id="item.id" :table="tableid" />
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
      cnums: [],
      copids: [],
      item: null,
      label: null,
      showItem: false,
      tableid: null
    }
  },

  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    }
  },

  async mounted () {
    if (this.id) {
      await this.getEntity()
    }
  },

  destroyed () {
    this.$store.commit('breadcrumb/setClass', '')
  },

  methods: {
    async getEntity () {
      try {
        await this.$wikibase
          .getEntity(this.id, this.$i18n.locale)
          .then(async (entity) => {
            this.tableid = this.$wikibase.getRelatedTable(entity)
            this.item = entity
            this.label = this.$wikibase.getValueByLang(this.item.labels, this.$i18n.locale)
            this.description = this.$wikibase.getValueByLang(this.item.descriptions, this.$i18n.locale)
            this.setBreadCrumb(this.tableid, entity)
            this.showItem = true
          })
      } catch (err) {
        this.$notification.error(err)
      }
    },
    setBreadCrumb (table, entity) {
      this.$store.commit('breadcrumb/setItems', this.getBreadcrumbItems(table, entity))
      this.$store.commit('breadcrumb/setClass', 'large-font-breadcrumb')
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
  height: 25px;
}
.full-width {
  width: 100%;
}
</style>
