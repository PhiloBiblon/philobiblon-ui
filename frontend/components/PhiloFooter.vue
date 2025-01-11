<template>
  <v-footer color="white" class="over-menu mt-10" padless>
    <v-row dense>
      <v-col cols="12" sm="3" class="text-center" align-self="center">
        <span class="text-black text-h4">Philo</span>
        <a class="footer_a" target="_blank" href="https://update.lib.berkeley.edu/Topics/philobiblon/">
          <span class="font-weight-light text-h4">BLOG</span>
        </a>
      </v-col>
      <v-col cols="12" sm="3">
        <v-list dense>
          <v-list-item-group>
            <v-list-item v-for="(item, index) in links_col_1" :key="index" link @click="goTo(item.link)">
              <v-list-item-title class="text-subtitle-2">
                {{ item.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="12" sm="3">
        <v-list dense>
          <v-list-item-group>
            <v-list-item v-for="(item, index) in links_col_2" :key="index" link @click="goTo(item.link)">
              <v-list-item-title class="text-subtitle-2">
                {{ item.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="12" sm="3">
        <v-container>
          <v-row dense>
            <v-col>
              <a href="https://facebook.com/pages/PhiloBiblon/289959314407502" class="me-3">
                <icons-social-fb-icon />
              </a>
              <a href="https://twitter.com/PPhiloBiblon" class="me-3">
                <icons-social-twitter-icon />
              </a>
              <a href="https://youtube.com/channel/UCOVWrLQiC1bPvt57pYQQeJQ/videos" class="me-3">
                <icons-social-youtube-icon />
              </a>
              <a href="https://instagram.com/p/B6Ihdigpv1G/" class="me-3">
                <icons-social-instagram-icon />
              </a>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <a role="button" class="footer_a text-body-2" @click="goTo('/wiki/Citation')">
                How to cite PhiloBiblon
              </a>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col class="text-caption">
              Volume 2024, Number 3 (March) ISSN 1096-6609
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="12" class="text-center">
        <v-container fluid>
          <v-row dense>
            <v-col>
              <img src="img/footer/universitat_barcelona.png">
            </v-col>
            <v-col>
              <img src="img/footer/upf.png">
            </v-col>
            <v-col>
              <img src="img/footer/the_bancroft.png">
            </v-col>
            <v-col>
              <img src="img/footer/ilf.png">
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col class="text-center text-caption">
        &copy; {{ new Date().getFullYear() }}
        <span class="version">
          v.{{ $config.version }}
        </span>
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              <a class="version" @click="goTo('/privacy-policy')">
                {{ $i18n.t('privacyPolicy.label') }}
              </a>
            </span>
          </template>
          <p class="tooltip">
            {{ $i18n.t('privacyPolicy.tooltip') }}
          </p>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
export default {
  data () {
    return {
      links_col_1: [
        { label: 'ABOUT PhiloBiblon', link: '/wiki/About' },
        { label: 'HELP', link: '/wiki/Help' },
        { label: 'RESOURCES', link: '/wiki/Resources' },
        { label: 'COLLABORATE', link: '/wiki/Collaborate' }
      ],
      links_col_2: [
        { label: 'BETA', link: '/wiki/Beta' },
        { label: 'BIPA', link: '/wiki/Bipa' },
        { label: 'BITAGAP', link: '/wiki/Bitagap' },
        { label: 'BITECA', link: '/wiki/Biteca' }
      ]
    }
  },
  methods: {
    goTo (path) {
      this.$router.push(this.localePath(path))
    }
  }
}
</script>

<style scoped>
.over-menu {
  z-index: 7;
}
.footer_a {
  text-decoration: none;
}
.footer_a:hover {
  border-bottom: 1px solid white;
}
.version {
  float: right;
  margin-right: 20px;
}
.v-tooltip__content {
  width: 500px!important;
  left: unset!important;
  right: 0!important;
}
</style>
