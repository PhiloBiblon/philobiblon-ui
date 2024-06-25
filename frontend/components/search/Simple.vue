<template>
  <div class="search-container">
    <v-autocomplete
      rounded
      item-props
      :items="items"
      item-value="id"
      item-text="title"
      class="search-bar"
      :loading="loading"
      @change="onItemSelected"
      :search-input.sync="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search PhiloBiblon"
      append-inner-icon="mdi-microphone"
    />
  </div>
</template>

<script>
export default {
  name: "Simple",
  data () {
    return {
      items: [],
      search: '',
      loading: false,
    };
  },
  watch: {
    search(val) {
      if (val) this.searchItems(val);
    }
  },
  methods: {
    async searchItems(search) {
      if (search.length < 2) {
        this.items = [];
        return;
      }

      this.loading = true;

      try {
        const items = await this.$wikibase.searchEntityByName(search, this.$i18n.locale, this.$i18n.locale);

        this.items = this.customizeSearchData(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        this.loading = false;
      }
    },
    customizeSearchData(items) {
      return items.map(item => {
        return {
          id: item.id,
          title: item.match.text,
        }
      })
    },
    onItemSelected(id) {
      if (id) this.$router.push(this.localePath(`/item/${id}`));
    },
  },
}
</script>

<style scoped>
.search-container {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.search-bar {
  width: 100%;
  max-width: 600px;
}

::v-deep .v-autocomplete .v-input__control {
  background-color: white !important;
  border: 1px solid #dcdcdc !important;
  border-radius: 24px !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

::v-deep .v-autocomplete .v-input__append-inner,
::v-deep .v-autocomplete .v-input__prepend-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep .v-autocomplete .v-input__append-inner .v-icon,
::v-deep .v-autocomplete .v-input__prepend-inner .v-icon {
  color: rgba(0, 0, 0, 0.54);
}

::v-deep .v-autocomplete .v-input__control .v-input__slot {
  padding-top: 20px;
  border-radius: 24px;
}

::v-deep .v-autocomplete .v-input__control:hover,
::v-deep .v-autocomplete .v-input__control:focus-within {
  border-color: #4285f4 !important;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28) !important;
}

::v-deep .v-autocomplete .v-list-item__title {
  color: black;
}
</style>