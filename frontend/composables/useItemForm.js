import { getItemForm } from '~/service/item-forms/index.js'
import * as engine from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'

// Thin Vue/i18n/Wikibase adapter around the pure item-forms engine (see
// service/item-forms/engine.js's header comment). The engine never imports
// Vue or translates -- this is the only place that does.
export function useItemForm () {
  const { $wikibase } = useNuxtApp()
  const { t } = useI18n()

  function buildCtx (entityLocale) {
    return {
      // Resolves Source.cascadeThrough: reads `entityId`'s own `viaProperty`
      // claim and returns that referenced entity's label (bibid's surname
      // cascade, #574) -- see the P247/P21 example in bibid.js.
      async cascadeLabel (entityId, viaProperty) {
        try {
          const entity = await $wikibase.getEntity(entityId, entityLocale)
          const targetId = entity?.claims?.[viaProperty]?.[0]?.mainsnak?.datavalue?.value?.id
          if (!targetId) return null
          const label = await $wikibase.getEntityLabel(null, targetId, entityLocale)
          const text = label?.value || targetId
          return typeof text === 'string' ? text.trim() : text
        } catch {
          return null
        }
      }
    }
  }

  async function generateLabel (table, initialClaims, entityLocale) {
    const form = getItemForm(table)
    if (!form) return null
    const snapshot = normalizeClaims(initialClaims)
    return await engine.buildLabel(form, snapshot, buildCtx(entityLocale))
  }

  // Returns a translated tooltip reason, or null when the form is valid.
  function validateRequired (table, initialClaims) {
    const form = getItemForm(table)
    if (!form) return null

    const snapshot = normalizeClaims(initialClaims)
    const result = engine.validateItemForm(form, snapshot)
    if (!result) return null

    const initialClaim = initialClaims.find(c => c.property?.id === result.propertyId)
    const propertyLabel = initialClaim?.property?.label || result.propertyId
    return t(`messages.error.inputs.${result.code}`, { propertyLabel })
  }

  async function getAliases (table, initialClaims, entityLocale) {
    const form = getItemForm(table)
    if (!form) return []
    const snapshot = normalizeClaims(initialClaims)
    return await engine.getAliasValues(form, snapshot, buildCtx(entityLocale))
  }

  return { getItemForm, generateLabel, validateRequired, getAliases }
}
