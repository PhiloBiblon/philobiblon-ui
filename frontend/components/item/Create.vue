<template>
  <v-container class="all-width">
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
              readonly
              :loading="loading"
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
      <item-claim-create :key="table" :for-create="true" :table="table" @update-claims="updateClaims" />
      <v-row dense>
        <v-spacer />
        <v-btn
          class="mt-4"
          small
          elevation="2"
          :disabled="isCreateDisabled || loading"
          @click="create"
        >
          {{ $t('common.create') }}
        </v-btn>
      </v-row>
    </template>
  </v-container>
</template>

<script>
export default {
  props: {
    table: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      label: '',
      claims: [],
      loading: true,
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
        Object.values(this.claims).some(claim =>
          !claim.value || Object.values(claim.qualifiers || {}).includes(null)
        )
      )
    }
  },
  async mounted () {
    if (!this.isUserLogged) {
      return this.$router.push(this.localePath('/'))
    } else {
      await this.getLastItem()
    }
  },
  methods: {
    async getLastItem () {
      this.loading = true
      await this.$wikibase.getTableLastItem(this.table).then((res) => {
        if (res && res.length && res[0]) {
          this.label = this.generatePbId(res[0].item_pbid)
        }
        this.loading = false
      }).catch((error) => {
        this.loading = false
        this.$notification.error(error.body.error.info ?? this.$t('messages.error.something_went_wrong'))
      })
    },
    generatePbId (lastItemPbId) {
      const match = lastItemPbId.match(/(\d+)$/)
      if (!match) {
        return null
      }

      const lastNumber = parseInt(match[1], 10)
      const newNumber = lastNumber + 1

      return lastItemPbId.replace(/\d+$/, newNumber)
    },
    updateClaims (data) {
      this.claims = data
    },
    async create () {
      try {
        const data = {
          labels: {
            [this.$i18n.locale]: this.label
          },
          descriptions: {
            [this.$i18n.locale]: this.description
          },
          claims: {
            P476: this.label,
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
