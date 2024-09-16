export default {
  bind (el, binding) {
    el.innerHTML = binding.value
  },
  update (el, binding) {
    el.innerHTML = binding.value
  }
}
