<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      :permanent="!$vuetify.breakpoint.sm && !$vuetify.breakpoint.xs && !$vuetify.breakpoint.md"
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
          <v-list-item class="subitem" link @click="goTo('/search/texid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.texid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/libid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.libid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/insid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.insid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/bioid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.bioid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/bibid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.bibid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/manid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.manid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/geoid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.geoid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="subitem" link @click="goTo('/search/subid/query')">
            <v-list-item-content>
              <v-list-item-title>{{ $t('menu.item.search.item.subid.label') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
      dark
    >
      <template #img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(33, 33, 33,.7), rgba(250, 250, 250,.7)"
        />
      </template>
      <v-app-bar-nav-icon class="d-lg-none" @click.stop="drawer = !drawer" />
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
    <philo-footer />
  </v-app>
</template>

<script>

export default {
  data () {
    return {
      title_1: 'Philo',
      title_2: 'Biblon',
      drawer: false
    }
  },
  computed: {
    username () {
      return this.$store.state.auth.username ? this.$store.state.auth.username : ''
    }
  },
  mounted () {
    this.$wikibase.$oauth.autoLoginByCookie()
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
      this.$cookies.set('previous-path', this.$route.path, {
        path: '/',
        maxAge: 5 * 60
      })
      this.$wikibase.$oauth.step1()
    },
    logout () {
      this.$store.commit('auth/logout')
      this.$notification.success(this.$i18n.t('auth.logout.success'))
      this.$cookies.remove('oauth')
    }
  }
}
</script>

<style scoped>
.mainmenu >>> .v-list-item--active {
  color: white;
}
.subitem {
  padding-left: 35%;
}
</style>
