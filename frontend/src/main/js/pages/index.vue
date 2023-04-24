<script>
export default {
  middleware: [
    function ({ redirect, app }) {
      redirect(app.localePath('/wiki/Welcome'))
    }
  ]
}
</script>
