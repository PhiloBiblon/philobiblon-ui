/**
 * table -> item-form module registry. Static imports, mirroring how
 * service/search-forms/<table>.js modules are consumed directly by their
 * query.vue pages. All 10 item tables are registered now; components/
 * item/Create.vue's legacy per-table label/validation switch (kept as a
 * fallback for any table absent from this registry) is dead code as of
 * this commit and removed in the next one.
 */
import bibid from './bibid.js'
import bioid from './bioid.js'
import cnum from './cnum.js'
import copid from './copid.js'
import geoid from './geoid.js'
import insid from './insid.js'
import libid from './libid.js'
import manid from './manid.js'
import subid from './subid.js'
import texid from './texid.js'

const REGISTRY = { bibid, bioid, cnum, copid, geoid, insid, libid, manid, subid, texid }

export function getItemForm (table) {
  const factory = REGISTRY[table]
  return factory ? factory() : null
}
