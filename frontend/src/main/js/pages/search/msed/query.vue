<template>
  <query-base
    table="manid"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script>
export default {
  data () {
    return {
      breadcrumb_items: [
        {
          text: this.$i18n.t('menu.item.search.label'),
          disabled: true
        },
        {
          text: this.$i18n.t('menu.item.search.item.msed.label'),
          disabled: true
        }
      ],
      form: {
        group: {
          permanent: true,
          value: 'ALL',
          disabled: false
        },
        simple_search: {
          active: true,
          label: 'search.form.common.simple_search.label',
          hint: 'search.form.common.simple_search.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        city: {
          active: false,
          label: 'search.form.msed.city.label',
          hint: 'search.form.common.place.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        library: {
          active: false,
          label: 'search.form.msed.library.label',
          hint: 'search.form.msed.library.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        collection_shelfmark: {
          active: false,
          label: 'search.form.msed.shelfmark.label',
          hint: 'search.form.msed.shelfmark.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        date: {
          active: false,
          label: 'search.form.msed.date.label',
          hint: 'search.form.msed.date.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        place_production: {
          active: false,
          label: 'search.form.msed.place_production.label',
          hint: 'search.form.msed.place_production.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        scribe_printer: {
          active: false,
          label: 'search.form.msed.scribe_printer.label',
          hint: 'search.form.msed.scribe_printer.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        publisher_patron: {
          active: false,
          label: 'search.form.msed.publisher_patron.label',
          hint: 'search.form.msed.publisher_patron.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        previous_owner: {
          active: false,
          label: 'search.form.msed.previous_owner.label',
          hint: 'search.form.msed.previous_owner.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        associated_person: {
          active: false,
          label: 'search.form.msed.associated_person.label',
          hint: 'search.form.msed.associated_person.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        subject: {
          active: false,
          label: 'search.form.common.subject.label',
          hint: 'search.form.common.subject.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        search_type: {
          permanent: true,
          value: true,
          disabled: false
        }
      }
    }
  }
}
</script>
