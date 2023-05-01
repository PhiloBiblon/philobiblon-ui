<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      fixed
      app
      dark
    >
      <template #prepend>
        <v-list-item v-if="username" two-line>
          <v-list-item-avatar>
            <v-icon>
              mdi-account
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            {{ username }}
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider />

      <v-list class="mainmenu">
        <v-list-item :to="localePath('/')">
          <v-list-item-action>
            <v-icon>
              mdi-apps
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('menu.item.welcome.label') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          prepend-icon="mdi-magnify"
        >
          <template #activator>
            <v-list-item-title>{{ $t('menu.item.search.label') }}</v-list-item-title>
          </template>
          <v-list-item class="subitem" link @click="goTo('/search/work/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.work.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/library/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.library.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/institution/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.institution.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/person/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.person.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/reference/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.reference.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/msed/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.msed.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
      dark
      src="/img/header_page-opacity15_2.gif"
    >
      <template #img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(33, 33, 33,.7), rgba(250, 250, 250,.7)"
        />
      </template>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title
        class="text-h4"
        style="cursor: pointer"
        @click="goTo('/')"
      >
        {{ title_1 }}<span class="font-weight-light">{{ title_2 }}</span>
      </v-toolbar-title>
      <v-spacer />
      <languages-menu />
      <v-tooltip
        v-if="$store.state.auth.isLogged"
        bottom
      >
        <template #activator="{ on }">
          <v-icon v-on="on" @click="logout">
            mdi-logout-variant
          </v-icon>
        </template>
        <span>{{ $t('auth.logout.label') }}</span>
      </v-tooltip>
      <v-tooltip
        v-if="!$store.state.auth.isLogged"
        bottom
      >
        <template #activator="{ on }">
          <v-icon v-on="on" @click="login">
            mdi-login-variant
          </v-icon>
        </template>
        <span>{{ $t('auth.login.label') }}</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <v-container fluid ma-50>
        <v-breadcrumbs :items="$store.state.breadcrumb.items" />
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      app
      :padless="true"
    >
      <v-card
        flat
        tile
        width="100%"
        class="text-center"
      >
        <v-card-text class="py-2 font-weight-light">
          &copy; {{ new Date().getFullYear() }}
          <span class="version">
            v.{{ version }}
          </span>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  data () {
    return {
      title_1: 'Philo',
      title_2: 'Biblon',
      version: '0.2.0',
      drawer: false
    }
  },
  computed: {
    username () {
      return this.$store.state.auth.username ? this.$store.state.auth.username : ''
    }
  },
  mounted () {
    window.addEventListener('keydown', this.keyDownHandler)
  },
  destroyed () {
    window.removeEventListener('keydown', this.keyDownHandler)
  },
  methods: {
    keyDownHandler (event) {
      if (event.code === 'Escape') {
        this.drawer = false
      }
      if (event.code === 'F1') {
        this.drawer = !this.drawer
      }
    },
    goTo (path) {
      this.$router.push(this.localePath(path))
    },
    login () {
      this.$wikibase.$oauth.step1()
    },
    logout () {
      this.$store.commit('auth/logout')
      this.$notification.success(this.$i18n.t('auth.logout.success'))
    }
  }
}
</script>

<style scoped>
.mainmenu >>> .v-list-item--active {
  color: white;
}
.version {
  float: right;
  margin-right: 20px;
}
.subitem {
  padding-left: 35%;
}
</style>
