<template>
  <v-footer color="white" class="over-menu mt-10">
    <v-row dense>
      <v-col cols="12" sm="3" class="text-center" align-self="center">
        <span class="text-black text-h4">Philo</span>
        <a class="footer_a blog-link" target="_blank" href="https://update.lib.berkeley.edu/Topics/philobiblon/">
          <span class="font-weight-light text-h4">BLOG</span>
        </a>
      </v-col>
      <v-col cols="12" sm="3">
        <v-list density="compact">
          <v-list-item v-for="(item, index) in links_col_1" :key="index" link @click="goTo(item.link)">
            <v-list-item-title class="footer-nav-link">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="12" sm="3">
        <v-list density="compact">
          <v-list-item v-for="(item, index) in links_col_2" :key="index" link @click="goTo(item.link)">
            <v-list-item-title class="footer-nav-link">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="12" sm="3">
        <v-container>
          <v-row dense>
            <v-col>
              <a href="https://bsky.app/profile/philobiblon.bsky.social" class="me-3">
                <icons-social-bluesky-icon />
              </a>
              <a href="https://hcommons.social/@PhiloBiblon_Berkeley" class="me-3">
                <icons-social-mastodon-icon />
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
              <a role="button" class="footer_a text-body-2 cite-link" @click="goTo('/wiki/Citation')">
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
              <img src="/img/footer/universitat_barcelona.png">
            </v-col>
            <v-col>
              <img src="/img/footer/upf.png">
            </v-col>
            <v-col>
              <img src="/img/footer/the_bancroft.png">
            </v-col>
            <v-col>
              <img src="/img/footer/ilf.png">
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col class="text-center text-caption">
        &copy; {{ new Date().getFullYear() }}
        <span class="version">
          v.{{ config.version }}
        </span>
        <v-tooltip location="top" content-class="privacy-tooltip">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <a class="version footer_a" @click="goTo('/privacy-policy')">
                {{ t('privacyPolicy.label') }}
              </a>
            </span>
          </template>
          <p class="tooltip">
            {{ t('privacyPolicy.tooltip') }}
          </p>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const config = useRuntimeConfig().public
const router = useRouter()
const localePath = useLocalePath()

const links_col_1 = [
  { label: 'ABOUT PhiloBiblon', link: '/wiki/About' },
  { label: 'HELP', link: '/wiki/Help' },
  { label: 'RESOURCES', link: '/wiki/Resources' },
  { label: 'COLLABORATE', link: '/wiki/Collaborate' }
]
const links_col_2 = [
  { label: 'BETA', link: '/wiki/Beta' },
  { label: 'BIPA', link: '/wiki/Bipa' },
  { label: 'BITAGAP', link: '/wiki/Bitagap' },
  { label: 'BITECA', link: '/wiki/Biteca' }
]

function goTo (path) {
  router.push(localePath(path))
}
</script>

<style scoped>
.over-menu {
  z-index: 7;
}
:deep(.footer-nav-link) {
  font-weight: 500;
  font-size: 14px;
  letter-spacing: normal;
}
.footer_a {
  text-decoration: none;
  color: #b71c1c;
  cursor: pointer;
}
.footer_a:hover {
  border-bottom: 1px solid #b71c1c;
}
.version {
  float: right;
  margin-right: 20px;
}
</style>
