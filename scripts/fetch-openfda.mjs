#!/usr/bin/env node
/**
 * scripts/fetch-openfda.mjs
 *
 * Fetches drug label data from the OpenFDA Drug Labels API for every drug
 * listed in public/data/drug-db.json, extracts drug-drug interaction text,
 * and writes a structured report to scripts/openfda-report.json.
 *
 * Usage:  node scripts/fetch-openfda.mjs
 *
 * OpenFDA API: https://open.fda.gov/apis/drug/label/
 * License:     CC0 Public Domain – free for commercial use
 * Rate limits: 240 req/min, 120 000 req/day (no key required)
 *              With API key: 240 req/min still, but higher daily quota.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH     = join(__dirname, '../public/data/drug-db.json');
const REPORT_PATH = join(__dirname, './openfda-report.json');

// ---------------------------------------------------------------------------
// API config
// ---------------------------------------------------------------------------
const API_BASE = 'https://api.fda.gov/drug/label.json';

/**
 * Optional: set OPENFDA_API_KEY environment variable to raise rate limits.
 * Example: OPENFDA_API_KEY=your_key node scripts/fetch-openfda.mjs
 */
const API_KEY = process.env.OPENFDA_API_KEY ?? null;

/**
 * Delay between successive API requests (milliseconds).
 * 300 ms keeps us well under the 240 req/min ceiling (≈200 ms minimum).
 */
const DELAY_MS = 350;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build a URL for the OpenFDA Drug Labels endpoint.
 * We search for an exact match on openfda.generic_name.
 * Falls back to a brand-name search if no results come back.
 */
function buildUrl(fieldName, searchTerm, limit = 3) {
  const query = `${fieldName}:"${encodeURIComponent(searchTerm)}"`;
  let url = `${API_BASE}?search=${query}&limit=${limit}`;
  if (API_KEY) url += `&api_key=${API_KEY}`;
  return url;
}

/**
 * Single HTTP fetch with a 10-second timeout and graceful error handling.
 * Returns the parsed JSON body or null on any failure.
 */
async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.status === 404) return null; // drug not found in OpenFDA
    if (!response.ok) {
      console.warn(`  HTTP ${response.status} for ${url}`);
      return null;
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn('  Request timed out');
    } else {
      console.warn(`  Network error: ${err.message}`);
    }
    return null;
  }
}

/**
 * Fetch the best-matching drug label from OpenFDA.
 * Strategy:
 *   1. Exact generic name search
 *   2. If no result, try the first brand name (if available)
 *   3. If still no result, try a generic substring search
 *
 * Returns the first result object or null.
 */
async function fetchDrugLabel(drug) {
  // 1. Exact generic name
  let data = await fetchJson(buildUrl('openfda.generic_name', drug.genericName));
  if (data?.results?.length) return { label: data.results[0], matchedOn: 'genericName' };

  // 2. First brand name
  if (drug.brandNames?.length) {
    const brand = drug.brandNames[0];
    data = await fetchJson(buildUrl('openfda.brand_name', brand));
    if (data?.results?.length) return { label: data.results[0], matchedOn: `brandName:${brand}` };
  }

  // 3. Substring / partial match on generic name (no quotes)
  const partial = `${API_BASE}?search=openfda.generic_name:${encodeURIComponent(drug.genericName)}&limit=3`;
  data = await fetchJson(API_KEY ? partial + `&api_key=${API_KEY}` : partial);
  if (data?.results?.length) return { label: data.results[0], matchedOn: 'partialGenericName' };

  return null;
}

/**
 * Pull the drug_interactions section from an OpenFDA label result.
 * The field is an array; we concatenate all entries.
 */
function extractInteractionText(label) {
  const sections = label?.drug_interactions;
  if (!sections || !sections.length) return null;
  return sections.join('\n\n');
}

/**
 * Search the interaction text for mentions of any drug in our database.
 * Matches are case-insensitive.  We check both the generic name and all
 * brand names for each drug.
 */
function findMentionedDrugs(text, allDrugs, currentDrugId) {
  if (!text) return [];

  const lower = text.toLowerCase();
  const mentioned = [];

  for (const drug of allDrugs) {
    if (drug.id === currentDrugId) continue;

    const namesToCheck = [
      drug.genericName,
      ...(drug.brandNames ?? []),
    ];

    const found = namesToCheck.some(name => lower.includes(name.toLowerCase()));
    if (found) {
      mentioned.push(drug.id);
    }
  }

  return mentioned;
}

/**
 * Build a canonical pair key (sorted, joined with "::") identical to the
 * format used in drug-db.json.
 */
function makePairKey(idA, idB) {
  return [idA, idB].sort().join('::');
}

/**
 * Produce a concise, readable excerpt (≤ 600 chars) from raw interaction text.
 */
function makeExcerpt(text, maxLen = 600) {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= maxLen ? clean : clean.substring(0, maxLen) + ' …';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // -- Load database --------------------------------------------------------
  let db;
  try {
    db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.error(`Failed to read drug database at ${DB_PATH}:`, err.message);
    process.exit(1);
  }

  const { drugs, interactions } = db;

  if (!Array.isArray(drugs) || drugs.length === 0) {
    console.error('drug-db.json contains no drugs array.');
    process.exit(1);
  }

  const existingPairKeys = new Set(
    (interactions ?? []).map(i => i.pairKey)
  );

  console.log(`ClearRx × OpenFDA integration`);
  console.log(`================================`);
  console.log(`Database: ${drugs.length} drugs, ${existingPairKeys.size} existing interaction pairs`);
  console.log(`API key:  ${API_KEY ? 'provided (higher limits)' : 'none (standard limits)'}`);
  console.log('');

  // -- Process each drug ----------------------------------------------------
  const results = [];
  const globalNewPairKeys = new Set();

  for (let i = 0; i < drugs.length; i++) {
    const drug = drugs[i];
    const prefix = `[${String(i + 1).padStart(2, '0')}/${drugs.length}]`;

    console.log(`${prefix} ${drug.genericName}`);

    const match = await fetchDrugLabel(drug);

    if (!match) {
      console.log(`        not found in OpenFDA`);
      results.push({
        drugId:              drug.id,
        genericName:         drug.genericName,
        foundInOpenFDA:      false,
        matchedOn:           null,
        brandNamesInLabel:   [],
        interactionTextLength: 0,
        mentionedDrugIds:    [],
        newPairKeys:         [],
        interactionExcerpt:  null,
      });
      await sleep(DELAY_MS);
      continue;
    }

    const { label, matchedOn } = match;
    const interactionText = extractInteractionText(label);
    const mentionedDrugIds = findMentionedDrugs(interactionText, drugs, drug.id);

    // Identify pairs not yet recorded in our DB
    const newPairKeys = mentionedDrugIds
      .map(otherId => makePairKey(drug.id, otherId))
      .filter(pk => !existingPairKeys.has(pk));

    newPairKeys.forEach(pk => globalNewPairKeys.add(pk));

    const brandNamesInLabel = label?.openfda?.brand_name ?? [];
    const genericNamesInLabel = label?.openfda?.generic_name ?? [];

    console.log(`        matched on: ${matchedOn}`);
    console.log(`        brand names in label: ${brandNamesInLabel.slice(0, 3).join(', ') || 'none'}`);
    if (interactionText) {
      console.log(`        interaction text: ${interactionText.length} chars`);
      console.log(`        drugs mentioned:  ${mentionedDrugIds.join(', ') || 'none'}`);
    } else {
      console.log(`        no drug_interactions field in label`);
    }
    if (newPairKeys.length) {
      console.log(`        NEW pairs found:  ${newPairKeys.join(', ')}`);
    }

    results.push({
      drugId:                drug.id,
      genericName:           drug.genericName,
      foundInOpenFDA:        true,
      matchedOn,
      genericNamesInLabel,
      brandNamesInLabel,
      interactionTextLength: interactionText?.length ?? 0,
      mentionedDrugIds,
      newPairKeys,
      interactionExcerpt:    makeExcerpt(interactionText),
    });

    await sleep(DELAY_MS);
  }

  // -- Build summary --------------------------------------------------------
  const foundResults   = results.filter(r => r.foundInOpenFDA);
  const notFoundResults = results.filter(r => !r.foundInOpenFDA);
  const allNewPairs    = [...globalNewPairKeys];

  const summary = {
    totalDrugs:           drugs.length,
    foundInOpenFDA:       foundResults.length,
    notFound:             notFoundResults.length,
    drugsNotFound:        notFoundResults.map(r => r.drugId),
    existingPairsInDB:    existingPairKeys.size,
    potentialNewPairsFound: allNewPairs.length,
    potentialNewPairs:    allNewPairs,
    note: [
      'potentialNewPairs lists pair keys that appear in OpenFDA interaction text',
      'but are absent from drug-db.json interactions[]. Review each pair before',
      'adding it to the database — OpenFDA text may reference drug CLASSES rather',
      'than specific generics, so manual validation is recommended.',
    ].join(' '),
  };

  // -- Assemble & write report ----------------------------------------------
  const report = {
    generatedAt: new Date().toISOString(),
    source:      'OpenFDA Drug Labels API (https://api.fda.gov/drug/label.json)',
    license:     'CC0 Public Domain',
    summary,
    results,
  };

  try {
    mkdirSync(dirname(REPORT_PATH), { recursive: true });
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to write report to ${REPORT_PATH}:`, err.message);
    process.exit(1);
  }

  // -- Final summary --------------------------------------------------------
  console.log('');
  console.log('================================');
  console.log(`Report written to: ${REPORT_PATH}`);
  console.log('');
  console.log(`Found in OpenFDA : ${foundResults.length}/${drugs.length} drugs`);
  console.log(`Not found        : ${notFoundResults.map(r => r.drugId).join(', ') || 'none'}`);
  console.log(`Existing pairs   : ${existingPairKeys.size}`);
  console.log(`Potential NEW pairs discovered: ${allNewPairs.length}`);
  if (allNewPairs.length) {
    console.log('');
    console.log('New pairs to review:');
    allNewPairs.forEach(pk => console.log(`  - ${pk}`));
  }
  console.log('');
  console.log('Next step: review openfda-report.json and manually validate');
  console.log('           any potentialNewPairs before adding to drug-db.json.');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
