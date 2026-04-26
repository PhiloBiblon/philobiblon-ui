<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      style="height: 99vh;"
      color="primary"
      :permanent="!mdAndDown"
      theme="dark"
    >
      <template #prepend>
        <v-list-item v-if="username" lines="two" prepend-icon="mdi-account">
          <v-list-item-title>{{ username }}</v-list-item-title>
        </v-list-item>
      </template>

      <v-divider />

      <v-list class="mainmenu">
        <v-list-item :to="localePath('/wiki/Welcome')" prepend-icon="mdi-apps">
          <v-list-item-title>{{ t('menu.item.welcome.label') }}</v-list-item-title>
        </v-list-item>
        <v-list-group value="search">
          <template #activator="{ props: activatorProps }">
            <v-list-item v-bind="activatorProps" prepend-icon="mdi-magnify">
              <v-list-item-title>{{ t('menu.item.search.label') }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item
            v-for="item in searchItems"
            :key="item.path"
            :to="localePath(item.path)"
            exact
            class="subitem"
          >
            <v-list-item-title>{{ t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <v-list-group v-if="authStore.isLogged" value="create">
          <template #activator="{ props: activatorProps }">
            <v-list-item v-bind="activatorProps" prepend-icon="mdi-plus">
              <v-list-item-title>{{ t('item.create.button.text') }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item
            v-for="item in createItems"
            :key="item.path"
            :to="localePath(item.path)"
            exact
            class="subitem"
          >
            <v-list-item-title>{{ t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      theme="dark"
    >
      <template #image>
        <v-img
          src="/img/header_page-opacity15_2.gif"
          gradient="to top right, rgba(33,33,33,.7), rgba(250,250,250,.7)"
          cover
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
        v-if="authStore.isLogged"
        variant="text"
        class="lowercase"
        @click="logout"
      >
        {{ t('auth.logout.label') }}
      </v-btn>
      <v-btn
        v-else
        variant="text"
        class="lowercase"
        @click="login"
      >
        {{ t('auth.login.label') }}
      </v-btn>
    </v-app-bar>
    <v-main class="min-height-full-display">
      <v-container fluid class="content-container">
        <v-breadcrumbs :items="breadcrumbStore.items" :class="breadcrumbStore.class" />
        <slot />
      </v-container>
      <philo-footer />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/stores/auth'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const { $notification, $wikibase } = useNuxtApp()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const { mdAndDown } = useDisplay()
const authStore = useAuthStore()
const breadcrumbStore = useBreadcrumbStore()

const previousPathCookie = useCookie('previous-path', { path: '/', maxAge: 5 * 60 })
const oauthCookie = useCookie('oauth')

const title_1 = 'Philo'
const title_2 = 'Biblon'
const drawer = ref(false)
// In Vuetify 3, v-model overrides permanent; open drawer automatically on desktop
watch(mdAndDown, (isMobile) => { if (!isMobile) drawer.value = true }, { immediate: true })

const searchItems = [
  { path: '/search/texid/query', label: 'menu.item.search.item.texid.label' },
  { path: '/search/libid/query', label: 'menu.item.search.item.libid.label' },
  { path: '/search/insid/query', label: 'menu.item.search.item.insid.label' },
  { path: '/search/bioid/query', label: 'menu.item.search.item.bioid.label' },
  { path: '/search/bibid/query', label: 'menu.item.search.item.bibid.label' },
  { path: '/search/manid/query', label: 'menu.item.search.item.manid.label' },
  { path: '/search/geoid/query', label: 'menu.item.search.item.geoid.label' },
  { path: '/search/subid/query', label: 'menu.item.search.item.subid.label' }
]
const createItems = [
  { path: '/item/texid/create', label: 'menu.item.create.item.texid.label' },
  { path: '/item/libid/create', label: 'menu.item.create.item.libid.label' },
  { path: '/item/insid/create', label: 'menu.item.create.item.insid.label' },
  { path: '/item/bioid/create', label: 'menu.item.create.item.bioid.label' },
  { path: '/item/bibid/create', label: 'menu.item.create.item.bibid.label' },
  { path: '/item/manid/create', label: 'menu.item.create.item.manid.label' },
  { path: '/item/geoid/create', label: 'menu.item.create.item.geoid.label' },
  { path: '/item/subid/create', label: 'menu.item.create.item.subid.label' },
  { path: '/item/cnum/create', label: 'menu.item.create.item.cnum.label' },
  { path: '/item/copid/create', label: 'menu.item.create.item.copid.label' }
]

const username = computed(() => authStore.username || '')

onMounted(() => {
  $wikibase.$oauth.autoLoginByCookie()
  window.addEventListener('keydown', keyDownHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyDownHandler)
})

function keyDownHandler (event) {
  if (event.code === 'Escape') {
    drawer.value = false
  }
  if (event.code === 'F1') {
    drawer.value = !drawer.value
  }
}

function goTo (path) {
  router.push(localePath(path))
}

function login () {
  previousPathCookie.value = route.path
  $wikibase.$oauth.step1()
}

function logout () {
  authStore.logout()
  $notification.success(t('auth.logout.success'))
  oauthCookie.value = null
}
</script>

<style scoped>
.mainmenu :deep(.v-list-item--active) {
  color: white;
}
.subitem :deep(.v-list-item-title) {
  padding-left: 10px;
}
.min-height-full-display {
}

:deep(.large-font-breadcrumb) li {
  font-size: large !important;
}

.lowercase {
  text-transform: lowercase;
}
</style>
