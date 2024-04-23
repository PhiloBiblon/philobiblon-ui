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

      <v-divider/>

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
      <v-app-bar-nav-icon class="d-lg-none" @click.stop="drawer = !drawer"/>
      <v-toolbar-title
        class="text-h4"
        style="cursor: pointer"
        @click="goTo('/')"
      >
        {{ title_1 }}<span class="font-weight-light">{{ title_2 }}</span>
      </v-toolbar-title>
      <v-spacer/>
      <languages-menu/>
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
    <v-footer color="white" class="pa-10 pb-8 z-index-100">
      <div class="d-flex justify-space-between w-100">
        <div class="d-flex justify-space-around footer-content w-100">
          <div class="footer-col pt-3">
            <div class="v-toolbar-title">
              {{ title_1 }}<span class="font-weight-light">{{ title_2 }}</span>
            </div>
            <p class="text-center">
              <a class="footer_a" href="https://update.lib.berkeley.edu/Topics/philobiblon/">
                Read PhiloBlog
              </a>
            </p>
          </div>
          <v-list color="transparent" class="footer-col pa-0" dense>
            <v-list-item v-for="(item, index) in links" :key="index" link>
              <v-list-item-title class="link" @click="goTo(item.link)">{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list color="transparent" class="footer-col pa-0" dense>
            <v-list-item v-for="(item, index) in linksSecond" :key="index" link>
              <v-list-item-title class="link" @click="goTo(item.link)">{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <div class="transparent-card footer-col">
            <div class="d-flex mb-10">
              <div class="d-flex py-2 pr-2 border-right align-center">
                <a href="https://facebook.com/pages/PhiloBiblon/289959314407502" class="me-3">
                  <IconsSocialFbIcon/>
                </a>
                <a href="https://twitter.com/PPhiloBiblon" class="me-3">
                  <IconsSocialTwitterIcon/>
                </a>
                <a href="https://youtube.com/channel/UCOVWrLQiC1bPvt57pYQQeJQ/videos" class="me-3">
                  <IconsSocialYoutubeIcon/>
                </a>
                <a href="https://instagram.com/p/B6Ihdigpv1G/" class="me-3">
                  <IconsSocialInstagramIcon/>
                </a>
              </div>
              <ul class="d-flex align-center py-2 px-3 cite">
                <li class="hl__linked-list__item">
                    <a class="footer_a" href="https://bancroft.berkeley.edu/philobiblon/citation_en.html">
                      How to cite {{ title_1 }}{{ title_2 }}
                    </a>
                </li>
              </ul>
            </div>
            <div class="d-flex align-center mb-4">
              <p class="mb-0 footer-desc">
                Volume 2024, Number 3 (March) ISSN 1096-6609
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-space-between align-center pt-8 w-100">
        <img src="/img/footer/universitat_barcelona.png" alt="universitat_barcelona">
        <img src="/img/footer/upf.png" alt="upf">
        <img src="/img/footer/the_bancroft.png" alt="the_bancroft">
        <img src="/img/footer/ilf.png" alt="ilf">
      </div>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  data () {
    return {
      title_1: 'Philo',
      title_2: 'Biblon',
      version: '0.6.0',
      drawer: false,
      links: [
        {label: 'SEARCH', link: '/search_en'},
        {label: 'ABOUT PhiloBiblon', link: '/about_en'},
        {label: 'HELP', link: '/help_enl'},
        {label: 'RESOURCES', link: '/resources_en'},
        {label: 'COLLABORATE', link: '/collaborate_en'},
      ],
      linksSecond: [
        {label: 'BETA', link: '/beta'},
        {label: 'BIPA', link: '/bipa'},
        {label: 'BITAGAP', link: '/bitagap'},
        {label: 'BITECA', link: '/biteca_en'},
      ],
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
.link {
  color: black !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 27px !important;
  letter-spacing: 1.87px !important;
  text-transform: uppercase !important;
}
.w-100 {
  width: 100%;
}
.z-index-100 {
  z-index: 100;
}
.v-toolbar-title {
  cursor: pointer;
  color: black;
  font-size: 40px;
  font-weight: bold;

  > span {
    font-weight: semibold;
    color: #b71c1c;
  }
}
.transparent-card {
  background-color: transparent !important;
}
.border-right {
  border-right: 1px solid gray;
}
.footer_a {
  text-decoration: none;
}
.footer_a:hover {
  border-bottom: 1px solid white;
}
.cite {
  list-style: none;
  gap: 34px;
}
.footer-desc {
  color: black;
  padding-left: 10px;
}
@media (max-width: 1290px) and (min-width: 1150px) {
  .link {
    font-size: 12px !important
  }
}
@media (max-width: 1150.98px) and (min-width: 991px) {
  .link {
    font-size: 10px !important
  }
}
@media (max-width: 991px) {
  .v-footer--fixed {
    position: relative!important;
  }
}

@media (max-width: 1263px) {
  footer {
    z-index: unset!important;
  }
}

@media (min-width: 691.98px) and (max-width: 990.98px) {
  .footer-col {
    width: 45%;
  }
  .footer-content {
    flex-wrap: wrap;
    gap: 30px;
  }
}

@media (max-width: 691.98px) {
  .footer-col {
    width: 100%;
  }
  .footer-content {
    flex-wrap: wrap;
    gap: 30px;
  }
}
</style>
