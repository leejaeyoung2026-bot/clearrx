#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'public/data/drug-db.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const curation = JSON.parse(fs.readFileSync(path.join(__dirname, 'curation-list.json'), 'utf8'));
const ids = new Set(db.drugs.map((d) => d.id));
const existingPairs = new Set(db.interactions.map((i) => i.pairKey));

let added = 0;

// 1) class-rule pairs (strip the justification field before storing)
curation.classRulePairs.forEach((p) => {
  if (existingPairs.has(p.pairKey)) return;
  if (!ids.has(p.drugA_id) || !ids.has(p.drugB_id)) return;
  const { classRuleBasis, ...entry } = p; // eslint-disable-line no-unused-vars
  db.interactions.push(entry);
  existingPairs.add(p.pairKey);
  added++;
});

// 2) OpenFDA-evidenced pairs — ONLY those the operator has confirmed and listed
//    in curation-list.openfdaConfirmedPairs[] (a curated allowlist, NOT the raw report).
(curation.openfdaConfirmedPairs || []).forEach((p) => {
  if (existingPairs.has(p.pairKey)) return;
  if (!ids.has(p.drugA_id) || !ids.has(p.drugB_id)) return;
  db.interactions.push({ ...p, source: 'openfda' });
  existingPairs.add(p.pairKey);
  added++;
});

db.interactions.sort((a, b) => a.pairKey.localeCompare(b.pairKey));
db.drugs.sort((a, b) => a.id.localeCompare(b.id));
db.version = '3.1.0';
db.lastUpdated = '2026-05-31';

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`expand-db: added ${added} interactions | total ${db.interactions.length} | version ${db.version}`);
