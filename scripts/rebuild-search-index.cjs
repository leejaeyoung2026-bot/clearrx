#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'public/data/drug-db.json'), 'utf8'));

// Build search index: each drug gets a searchable entry with all names
const index = db.drugs.map(drug => ({
  id: drug.id,
  genericName: drug.genericName,
  brandNames: drug.brandNames,
  categories: drug.categories,
  // Searchable tokens: generic name words + all brand name words
  tokens: [
    drug.genericName,
    ...drug.genericName.split(/[\s-]+/),
    ...drug.brandNames,
    ...drug.brandNames.flatMap(b => b.split(/[\s-]+/))
  ].map(t => t.toLowerCase()).filter((t, i, arr) => t.length > 1 && arr.indexOf(t) === i)
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
