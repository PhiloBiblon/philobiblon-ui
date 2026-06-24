#!/usr/bin/env node
// Registers/refreshes every QuickSearch filter (see ../service/quickSearchFilters.js) with the
// backend's internal-only /api/search/quick/register endpoint. Run once per deploy as a one-shot
// docker-compose service (see docker-compose.yml's quicksearch-registrar service) — never exposed
// externally, and never run by end-user browsers. Always exits 0: a failed registration just
// means that filter isn't queryable until the next deploy retries it, not a deploy failure.
import { quickSearchFilters } from '../service/quickSearchFilters.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080'
const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 10000

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function registerFilter (filterId, queryTemplate) {
  const body = new URLSearchParams({ filterId, queryTemplate })
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search/quick/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      if (response.ok) {
        const result = await response.json()
        console.log(`Registered QuickSearch filter '${filterId}': ${result.result}`)
        return
      }
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} for filter '${filterId}' failed with status ${response.status}`)
    } catch (error) {
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} for filter '${filterId}' failed: ${error.message}`)
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS)
    }
  }
  console.warn(`WARN: giving up registering QuickSearch filter '${filterId}' after ${MAX_ATTEMPTS} attempts`)
}

for (const { filterId, queryTemplate } of quickSearchFilters) {
  await registerFilter(filterId, queryTemplate)
}

console.log(`QuickSearch filter registration finished (${quickSearchFilters.length} filter(s))`)
