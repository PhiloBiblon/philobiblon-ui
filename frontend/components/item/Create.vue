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
              type="number"
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
      <item-claim-create :for-create="true" @update-claims="updateClaims" />
      <v-row dense>
        <v-spacer />
        <v-btn
          class="mt-4"
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
  methods: {
    updateClaims (data) {
      this.claims = data
    },
    async create () {
      try {
        const label = `BETA ${this.table} ${this.label}`

        const data = {
          labels: {
            [this.$i18n.locale]: label
          },
          descriptions: {
            [this.$i18n.locale]: this.description
          },
          claims: {
            P476: label,
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
