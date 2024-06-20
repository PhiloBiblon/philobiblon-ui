<template>
  <div class="container">
    <h2>Privacy Policy</h2>
    <h4>Data collected on the basis of consent</h4>
    <p>
      Upon your request and expression of consent, we collect the following data for the purpose of providing services
      to you. Your data is not used for any other purposes or shared with third parties. It is removed upon your
      withdrawal of consent or your request to terminate theses services.
    </p>
    <h4>Comments</h4>
    <p>
      <strong>Name, email address, content of the comment:</strong> this data is collected when you leave a comment and
      displayed on the Website.
    </p>
    <p>
      If you leave a comment on the Website, your name and email address will also be saved in cookies. These are for
      your convenience so that you do not have to fill in your details again when you leave another comment. These
      cookies will be saved on your computer until you delete them.</p>
    <p>
      <strong>IP and browser user agent string:</strong> this data is collected when you leave a comment.
    </p>
    <p>
      <strong>Retention period:</strong> the aforementioned data is retained indefinitely so we can recognize and
      approve any follow-up comments automatically instead of holding them in a moderation queue.
    </p>
    <h4>Data collected on the basis of legitimate interest</h4>
    <p>
      Based on our <strong>legitimate interests</strong>, we collect the following data for the purpose of running this
      website. Your data is not used for any other purposes or shared with third parties. It is removed upon your
      request.
    </p>
    <h4>Statistics</h4>
    <p>
      The website uses a minimal build of Google Analytics, a service which transmits website traffic data to Google
      servers in the United States and allows us to notice trends to improve the user experience on our website. This
      minimal build processes personal data such as: the unique User ID set by Google Analytics, the date and time, the
      title of the page being viewed, the URL of the page being viewed, the URL of the page that was viewed prior to the
      current page, the screen resolution, the time in local timezone, the files that were clicked on and downloaded,
      the links clicked on to an outside domain, the type of device, and the country, region, and city.
    </p>
    <p>
      You may opt out of this tracking at any time by activating the “Do Not Track” setting in your browser.
    </p>
    <h4>Embedded content from other websites</h4>
    <p>
      Articles on the Website may include embedded content (e.g. videos, charts, etc.). Embedded content from other
      websites behaves in the exact same way as if the visitor had visited the other website.
    </p>
    <p>
      These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your
      interaction with that embedded content, including tracing your interaction with the embedded content if you have
      an account and are logged in to that website.
    </p>
    <h4>Your rights pertaining your data</h4>
    <p>
      If you have left comments on the Website, you can request to receive an exported file of the personal data we
      hold about you, including any data you have provided to us. You can also request that we rectify or erase any
      personal data we hold about you. Please send your request to
      <a href="mailto:legal@gdpr.eu">legal@gdpr.eu</a>
    </p>
    <p>
      • The right to withdraw consent
      <br>
      • The right of access
      <br>
      • The right to erasure
      <br>
      • The right to rectification
      <br>
      • The right to data portability
      <br>
      • The right to object
      <br>
      • Notification of data breaches
      <br>
      • The right to lodge a complaint with a supervisory authority
    </p>
  </div>
</template>

<script>
export default {
  props: {
    breadcrumbItems: {
      type: Array,
      default: null
    }
  },
  mounted () {
    this.$store.commit('breadcrumb/setItems', this.breadcrumbItems)
  },
}
</script>