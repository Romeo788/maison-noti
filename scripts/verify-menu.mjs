#!/usr/bin/env node
/**
 * verify-menu.mjs — Compare a menu JSON (file or RPC output) to the
 * reference data/enzo-menu.json.  Reports conformity per item.
 *
 * Usage:
 *   node scripts/verify-menu.mjs                         # compare reference to itself (sanity)
 *   node scripts/verify-menu.mjs path/to/actual.json     # compare a file
 *   node scripts/verify-menu.mjs --live                  # fetch from RPC and compare
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REF_PATH = resolve(__dirname, '..', 'data', 'enzo-menu.json');

/* ── Load reference ──────────────────────────────────────────────── */
const reference = JSON.parse(readFileSync(REF_PATH, 'utf-8'));

/* ── Load actual ─────────────────────────────────────────────────── */
async function loadActual() {
  const arg = process.argv[2];

  if (arg === '--live') {
    const SB  = 'https://dboiktvuuzimvoukmfen.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRib2lrdHZ1dXppbXZvdWttZmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjUzNDIsImV4cCI6MjEwNDU0MTM0Mn0.TKu7hNo4rmcuQeCEUAOBv2Nz5dKm4vjl6PcIhfivxN4';
    const res = await fetch(`${SB}/rest/v1/rpc/get_site_content`, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_slug: 'enzo-pizza' }),
    });
    if (!res.ok) throw new Error(`RPC returned ${res.status}`);
    const data = await res.json();
    return data.menu;
  }

  if (arg) {
    const raw = JSON.parse(readFileSync(resolve(arg), 'utf-8'));
    // Support both { menu: { categories, supplements } } and { categories, supplements }
    return raw.menu || raw;
  }

  // Default: compare reference to itself (sanity check)
  return reference;
}

/* ── Deep-equal helper (handles arrays, nulls, primitives) ───────── */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (!deepEqual(ka, kb)) return false;
    return ka.every(k => deepEqual(a[k], b[k]));
  }
  return false;
}

/* ── Compare ─────────────────────────────────────────────────────── */
async function main() {
  const actual = await loadActual();
  const diffs = [];
  let total = 0;
  let ok = 0;

  // Compare categories count
  const refCats = reference.categories;
  const actCats = actual.categories || [];

  if (refCats.length !== actCats.length) {
    diffs.push(`Nombre de catégories : attendu ${refCats.length}, trouvé ${actCats.length}`);
  }

  // Compare each category
  for (let ci = 0; ci < refCats.length; ci++) {
    const rc = refCats[ci];
    const ac = actCats.find(c => c.id === rc.id);
    if (!ac) {
      diffs.push(`Catégorie manquante : ${rc.id}`);
      total += rc.items.length;
      continue;
    }

    // Category name & tagline
    if (rc.name !== ac.name) {
      diffs.push(`[${rc.id}] name : attendu "${rc.name}", trouvé "${ac.name}"`);
    }
    if (rc.tagline !== ac.tagline) {
      diffs.push(`[${rc.id}] tagline : attendu "${rc.tagline}", trouvé "${ac.tagline}"`);
    }

    // Items count
    if (rc.items.length !== (ac.items || []).length) {
      diffs.push(`[${rc.id}] nombre d'items : attendu ${rc.items.length}, trouvé ${(ac.items || []).length}`);
    }

    // Compare items in order
    for (let ii = 0; ii < rc.items.length; ii++) {
      total++;
      const ri = rc.items[ii];
      const ai = (ac.items || [])[ii];

      if (!ai) {
        diffs.push(`[${rc.id}] item #${ii + 1} manquant (attendu : ${ri.name})`);
        continue;
      }

      const itemDiffs = [];
      for (const key of ['id', 'name', 'description', 'price', 'priceNote', 'available']) {
        if (!deepEqual(ri[key], ai[key])) {
          itemDiffs.push(`  ${key} : attendu ${JSON.stringify(ri[key])}, trouvé ${JSON.stringify(ai[key])}`);
        }
      }
      if (!deepEqual(ri.tags, ai.tags)) {
        itemDiffs.push(`  tags : attendu ${JSON.stringify(ri.tags)}, trouvé ${JSON.stringify(ai.tags)}`);
      }

      if (itemDiffs.length) {
        diffs.push(`[${rc.id}/${ri.id}] ${ri.name} :\n${itemDiffs.join('\n')}`);
      } else {
        ok++;
      }
    }
  }

  // Check for extra categories in actual
  for (const ac of actCats) {
    if (!refCats.find(rc => rc.id === ac.id)) {
      diffs.push(`Catégorie en trop : ${ac.id} ("${ac.name}")`);
    }
  }

  // Compare supplements
  const refSups = reference.supplements || [];
  const actSups = actual.supplements || [];

  if (refSups.length !== actSups.length) {
    diffs.push(`Nombre de suppléments : attendu ${refSups.length}, trouvé ${actSups.length}`);
  }

  for (let si = 0; si < refSups.length; si++) {
    total++;
    const rs = refSups[si];
    const as_ = actSups[si];

    if (!as_) {
      diffs.push(`Supplément #${si + 1} manquant (attendu : ${rs.name})`);
      continue;
    }

    const supDiffs = [];
    for (const key of ['id', 'name', 'price']) {
      if (!deepEqual(rs[key], as_[key])) {
        supDiffs.push(`  ${key} : attendu ${JSON.stringify(rs[key])}, trouvé ${JSON.stringify(as_[key])}`);
      }
    }
    if (supDiffs.length) {
      diffs.push(`[sup/${rs.id}] ${rs.name} :\n${supDiffs.join('\n')}`);
    } else {
      ok++;
    }
  }

  // Check for extra supplements
  for (let si = refSups.length; si < actSups.length; si++) {
    diffs.push(`Supplément en trop : ${actSups[si].id} ("${actSups[si].name}")`);
  }

  // Report
  console.log(`\n=== Vérification de la carte ===`);
  console.log(`${ok}/${total} conformes`);

  if (diffs.length) {
    console.log(`\n--- Écarts (${diffs.length}) ---`);
    diffs.forEach(d => console.log(d));
    console.log('');
    process.exit(1);
  } else {
    console.log('100 % de conformité.\n');
  }
}

main().catch(err => { console.error(err); process.exit(2); });
