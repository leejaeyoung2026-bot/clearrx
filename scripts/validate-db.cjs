#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const dbPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '../public/data/drug-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const VALID_SEVERITY = new Set(['contraindicated', 'serious', 'moderate', 'minor', 'none']);
const VALID_EVIDENCE = new Set(['established', 'probable', 'suspected', 'theoretical']);
const VALID_SOURCE = new Set(['bundle', 'openfda', 'derived']);

const errors = [];
const ids = new Set();
db.drugs.forEach((d) => {
  if (ids.has(d.id)) errors.push(`duplicate drug id: ${d.id}`);
  ids.add(d.id);
  if (typeof d.interactionRiskScore !== 'number' || d.interactionRiskScore < 0 || d.interactionRiskScore > 10)
    errors.push(`riskScore out of 0-10: ${d.id} (${d.interactionRiskScore})`);
});

const pairKeys = new Set();
const interactionByPairKey = new Map();
db.interactions.forEach((i) => {
  interactionByPairKey.set(i.pairKey, i);
  if (!ids.has(i.drugA_id)) errors.push(`dangling drugA_id: ${i.drugA_id} (${i.pairKey})`);
  if (!ids.has(i.drugB_id)) errors.push(`dangling drugB_id: ${i.drugB_id} (${i.pairKey})`);
  const expect = [i.drugA_id, i.drugB_id].sort().join('::');
  if (i.pairKey !== expect) errors.push(`pairKey != sorted(A,B): ${i.pairKey} expected ${expect}`);
  if (i.drugA_id === i.drugB_id) errors.push(`self-pair: ${i.pairKey}`);
  if (pairKeys.has(i.pairKey)) errors.push(`duplicate pairKey: ${i.pairKey}`);
  pairKeys.add(i.pairKey);
  if (!VALID_SEVERITY.has(i.severity)) errors.push(`invalid severity: ${i.severity} (${i.pairKey})`);
  if (!VALID_EVIDENCE.has(i.evidenceLevel)) errors.push(`invalid evidenceLevel: ${i.evidenceLevel} (${i.pairKey})`);
  if (!VALID_SOURCE.has(i.source)) errors.push(`invalid source: ${i.source} (${i.pairKey})`);
});

// Curation reconciliation: a pair the operator curated must not be silently absent from the
// shipped DB. Catches the silent-drop where a curated pair references a drug id missing from
// drug-db.json (the gate previously only checked the shape of what shipped).
const curationPath = path.join(__dirname, 'curation-list.json');
if (fs.existsSync(curationPath)) {
  const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const curated = [
    ...(curation.classRulePairs || []).map((p) => ({ ...p, list: 'classRulePairs' })),
    ...(curation.openfdaConfirmedPairs || []).map((p) => ({ ...p, list: 'openfdaConfirmedPairs' })),
  ];
  curated.forEach((p) => {
    if (pairKeys.has(p.pairKey)) {
      // shipped — verify the curated severity actually reached the DB (no silent downgrade)
      const shipped = interactionByPairKey.get(p.pairKey);
      if (p.severity && shipped && shipped.severity !== p.severity)
        errors.push(`curated ${p.list} severity mismatch: ${p.pairKey} curated [${p.severity}] shipped [${shipped.severity}]`);
      return;
    }
    const missing = [!ids.has(p.drugA_id) && p.drugA_id, !ids.has(p.drugB_id) && p.drugB_id]
      .filter(Boolean).join(', ');
    if (missing)
      errors.push(`curated ${p.list} pair dropped — drug id absent (${missing}): ${p.pairKey}${p.severity ? ` [${p.severity}]` : ''}`);
    else
      errors.push(`curated ${p.list} pair missing from db despite both drugs present: ${p.pairKey}`);
  });
}

console.log('=== VALIDATION ===');
console.log('File:', dbPath);
console.log('Drugs:', db.drugs.length, '| Interactions:', db.interactions.length);
const sev = {};
db.interactions.forEach((i) => { sev[i.severity] = (sev[i.severity] || 0) + 1; });
console.log('By severity:', JSON.stringify(sev));

if (errors.length) {
  console.error(`\n❌ ${errors.length} ERROR(S):`);
  errors.slice(0, 50).forEach((e) => console.error('  -', e));
  process.exit(1);
}
console.log('\n✅ All integrity checks passed.');
process.exit(0);
