#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/drug-db.json'), 'utf8'));
console.log('=== FINAL VALIDATION ===');
console.log('Version:', db.version);
console.log('Drugs:', db.drugs.length);
console.log('Interactions:', db.interactions.length);

const inducers = db.drugs.filter(d => d.cypInducer && d.cypInducer.length > 0);
console.log('\nCYP Inducer drugs:', inducers.map(d => d.id + ' (' + d.cypInducer.join(',') + ')'));

const coverage = {};
db.interactions.forEach(i => {
  coverage[i.drugA_id] = (coverage[i.drugA_id] || 0) + 1;
  coverage[i.drugB_id] = (coverage[i.drugB_id] || 0) + 1;
});
const top10 = Object.entries(coverage).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log('\nTop 10 most interactive drugs:');
top10.forEach(function(pair) { console.log('  ' + pair[0] + ': ' + pair[1] + ' interactions'); });

const covered = new Set(db.interactions.flatMap(i => [i.drugA_id, i.drugB_id]));
const zero = db.drugs.filter(d => covered.has(d.id) === false);
console.log('\nDrugs with zero interactions:', zero.map(d => d.id));

const sevCount = {};
db.interactions.forEach(i => { sevCount[i.severity] = (sevCount[i.severity] || 0) + 1; });
console.log('\nBy severity:', JSON.stringify(sevCount, null, 2));

const catCount = {};
db.drugs.forEach(d => d.categories.forEach(c => { catCount[c] = (catCount[c] || 0) + 1; }));
console.log('\nDrugs by category:', JSON.stringify(catCount, null, 2));
