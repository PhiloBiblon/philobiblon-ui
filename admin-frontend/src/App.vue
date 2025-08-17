<template>
  <div class="grid grid-cols-12 h-[100vh] app-color">
    <sidebar class="col-span-2 " />
    <div  class="col-span-10 bg-gray-50 dark:bg-gray-800 p-5">
      <router-view/>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUserStore } from "./store/UserStore.js";
import sidebar from "./components/Layouts/Sidebar.vue";

const userStore = useUserStore();

onMounted( () => {
  userStore.getAuth()
})
</script>

<style scoped>
.app-color {
    background-color: rgb(31 41 55 / var(--tw-bg-opacity));
}
</style>