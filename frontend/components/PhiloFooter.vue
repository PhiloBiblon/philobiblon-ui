<template>
  <v-footer color="white" class="z-index-100">
    <div class="d-flex justify-space-between w-100">
      <div class="d-flex justify-space-around footer-content w-100">
        <div class="footer-col pt-3">
          <span class="text-black text-h4">Philo</span>
          <a class="footer_a" href="https://update.lib.berkeley.edu/Topics/philobiblon/">
            <span class="font-weight-light text-h4">BLOG</span>
          </a>
        </div>
        <v-list color="transparent" class="footer-col pa-0" dense>
          <v-list-item v-for="(item, index) in links_col_1" :key="index" link>
            <v-list-item-title class="link text-subtitle-2" @click="goTo(item.link)">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-list color="transparent" class="footer-col pa-0" dense>
          <v-list-item v-for="(item, index) in links_col_2" :key="index" link>
            <v-list-item-title class="link text-subtitle-2" @click="goTo(item.link)">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <div class="transparent-card footer-col">
          <div class="d-flex mb-10">
            <div class="d-flex border-right align-center">
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
            </div>
            <ul class="d-flex align-center py-2 px-3 cite">
              <li class="hl__linked-list__item">
                <a class="footer_a text-body-2" href="https://bancroft.berkeley.edu/philobiblon/citation_en.html">
                  How to cite PhiloBiblon
                </a>
              </li>
            </ul>
          </div>
          <div class="d-flex align-center mb-4">
            <p class="mb-0 footer-desc text-body-2">
              Volume 2024, Number 3 (March) ISSN 1096-6609
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-center justify-space-between align-center w-100">
      <span class="text-body-2">&copy; {{ new Date().getFullYear() }}</span>
      <img src="/img/footer/universitat_barcelona.png">
      <img src="/img/footer/upf.png">
      <img src="/img/footer/the_bancroft.png">
      <img src="/img/footer/ilf.png">
      <span class="text-body-2">v.{{ version }}</span>
    </div>
  </v-footer>
</template>

<script>
export default {
  data () {
    return {
      version: '0.6.0',
      links_col_1: [
        { label: 'ABOUT PhiloBiblon', link: '/about' },
        { label: 'HELP', link: '/help' },
        { label: 'RESOURCES', link: '/resources' },
        { label: 'COLLABORATE', link: '/collaborate' }
      ],
      links_col_2: [
        { label: 'BETA', link: '/beta' },
        { label: 'BIPA', link: '/bipa' },
        { label: 'BITAGAP', link: '/bitagap' },
        { label: 'BITECA', link: '/biteca' }
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

<style>
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
.w-80 {
  width: 80%;
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
