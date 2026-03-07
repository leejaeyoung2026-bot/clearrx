#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'public/data/drug-db.json'), 'utf8'));

// Build search index: matches SearchEntry interface in search-engine.ts
// { id, name, aliases } — name = genericName, aliases = all brand names
const index = db.drugs.map(drug => ({
  id: drug.id,
  name: drug.genericName,
  aliases: drug.brandNames,
}));

fs.writeFileSync(
  path.join(root, 'public/data/drug-search-index.json'),
  JSON.stringify(index, null, 2)
);

// Update version.json
const version = {
  version: '2.0.0',
  updated: '2026-03-08'
};
fs.writeFileSync(
  path.join(root, 'public/data/version.json'),
  JSON.stringify(version, null, 2)
);

console.log('Search index rebuilt:', index.length, 'entries');
console.log('Version updated to 2.0.0');
