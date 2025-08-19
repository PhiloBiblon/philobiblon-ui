<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      style="height: 99vh;"
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
        <v-list-item :to="localePath('/wiki/Welcome')">
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
          <v-list-item
            v-for="item in searchItems"
            :key="item.path"
            :to="localePath(item.path)"
            router
            exact
            class="subitem"
          >
            <v-list-item-title>{{ $t(item.label) }}</v-list-item-title>
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
      <v-btn
        v-if="$store.state.auth.isLogged"
        text
        height="0"
        min-width="0"
        class="lowercase"
        @click="logout"
      >
        {{ $t('auth.logout.label') }}
      </v-btn>
      <v-btn
        v-else
        text
        height="0"
        min-width="0"
        class="lowercase"
        @click="login"
      >
        {{ $t('auth.login.label') }}
      </v-btn>
    </v-app-bar>
    <v-main class="min-height-full-display">
      <v-container fluid ma-50>
        <v-breadcrumbs :items="$store.state.breadcrumb.items" :class="$store.state.breadcrumb.class" />
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
      drawer: false,
      searchItems: [
        { path: '/search/texid/query', label: 'menu.item.search.item.texid.label' },
        { path: '/search/libid/query', label: 'menu.item.search.item.libid.label' },
        { path: '/search/insid/query', label: 'menu.item.search.item.insid.label' },
        { path: '/search/bioid/query', label: 'menu.item.search.item.bioid.label' },
        { path: '/search/bibid/query', label: 'menu.item.search.item.bibid.label' },
        { path: '/search/manid/query', label: 'menu.item.search.item.manid.label' },
        { path: '/search/geoid/query', label: 'menu.item.search.item.geoid.label' },
        { path: '/search/subid/query', label: 'menu.item.search.item.subid.label' }
      ]
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
.min-height-full-display {
  min-height: 100vh;
}

::v-deep .large-font-breadcrumb {
  li {
    font-size: large !important;
  }
}

.lowercase {
  text-transform: lowercase;
}
</style>
