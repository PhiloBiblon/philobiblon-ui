# Testing

The frontend has no DOM or component-testing layer. Tests only cover pure,
Vue-free data/logic modules — currently `service/item-forms/`.

## Tooling

[Vitest](https://vitest.dev), `environment: 'node'`, configured in
`frontend/vitest.config.js`. No `@nuxt/test-utils`, `happy-dom`, or
`@vue/test-utils` — none of the tested code touches Vue or the DOM, so none of
that machinery is needed. Tests import `describe`/`it`/`expect` explicitly
(no `globals: true`), so `eslint.config.mjs` doesn't need a test override.

```bash
yarn test           # run once
yarn test:watch     # watch mode
yarn test:coverage  # with coverage (v8 provider)
```

## Layout

```
frontend/test/
  item-forms/          # one spec file per engine concern (see item-forms.md)
  helpers/
    snapshot.js         # ClaimSnapshot builders so specs read as data, not setup code
```

## What belongs here

Only pure logic that's importable from plain Node — no Vue components, no
`useNuxtApp()`/`useI18n()`, no DOM. `service/item-forms/engine.js` and the
table modules qualify because they were designed that way on purpose (see
[item-forms.md](item-forms.md)); the thin Vue adapter
(`composables/useItemForm.js`) is intentionally left untested here since
testing it would require Nuxt/Vue test infrastructure this project doesn't
have.

## CI

`.github/workflows/frontend-ci.yml` runs `yarn lint && yarn test` on every PR
that touches `frontend/**`.
