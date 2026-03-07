#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const orig = JSON.parse(fs.readFileSync(path.join(root, 'public/data/drug-db.json'), 'utf8'));
const files = ['cardio', 'cns', 'antiinfective', 'antiseizure', 'endocrine'];
const agentData = files.map(f => JSON.parse(fs.readFileSync(path.join(root, 'temp/db_' + f + '.json'), 'utf8')));

// Merge drugs
const allDrugs = {};
orig.drugs.forEach(d => { allDrugs[d.id] = d; });
agentData.forEach(data => data.drugs.forEach(d => { allDrugs[d.id] = d; }));

// Merge interactions
const allInteractions = {};
orig.interactions.forEach(i => { allInteractions[i.pairKey] = i; });
agentData.forEach(data => data.interactions.forEach(i => {
  if (!allInteractions[i.pairKey]) allInteractions[i.pairKey] = i;
}));

// Add missing cross-agent interactions
const extraInteractions = [
  {
    pairKey: 'fluconazole::glipizide',
    drugA_id: 'fluconazole',
    drugB_id: 'glipizide',
    severity: 'serious',
    mechanism: 'Fluconazole potently inhibits CYP2C9, the primary enzyme metabolizing glipizide; glipizide levels can rise 2-3x, causing severe and prolonged hypoglycemia.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['blood glucose', 'symptoms of hypoglycemia'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'cyclosporine::echinacea',
    drugA_id: 'cyclosporine',
    drugB_id: 'echinacea',
    severity: 'serious',
    mechanism: 'Echinacea stimulates the immune system, potentially counteracting the immunosuppressive effects of cyclosporine in transplant patients; graft rejection risk is a documented concern.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['transplant function', 'cyclosporine levels'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'apixaban::fluconazole',
    drugA_id: 'apixaban',
    drugB_id: 'fluconazole',
    severity: 'serious',
    mechanism: 'Fluconazole inhibits both CYP3A4 and P-glycoprotein, the primary elimination pathways for apixaban, potentially doubling apixaban exposure and substantially increasing bleeding risk.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['bleeding signs', 'renal function'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'fluconazole::rivaroxaban',
    drugA_id: 'fluconazole',
    drugB_id: 'rivaroxaban',
    severity: 'serious',
    mechanism: 'Fluconazole inhibits CYP3A4 and P-glycoprotein, increasing rivaroxaban plasma levels and significantly elevating bleeding risk.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['signs of bleeding'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'clarithromycin::rivaroxaban',
    drugA_id: 'clarithromycin',
    drugB_id: 'rivaroxaban',
    severity: 'serious',
    mechanism: 'Clarithromycin inhibits both CYP3A4 and P-glycoprotein, the two main elimination pathways for rivaroxaban, significantly increasing DOAC exposure and bleeding risk.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'apixaban::clarithromycin',
    drugA_id: 'apixaban',
    drugB_id: 'clarithromycin',
    severity: 'serious',
    mechanism: 'Clarithromycin strongly inhibits CYP3A4 and P-glycoprotein, substantially increasing apixaban levels and bleeding risk.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'carbamazepine::oxycodone',
    drugA_id: 'carbamazepine',
    drugB_id: 'oxycodone',
    severity: 'serious',
    mechanism: 'Carbamazepine induces CYP3A4, substantially reducing oxycodone plasma levels and analgesic efficacy; patients may experience inadequate pain control requiring dangerous dose escalation.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['pain control', 'opioid withdrawal signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'carbamazepine::quetiapine',
    drugA_id: 'carbamazepine',
    drugB_id: 'quetiapine',
    severity: 'serious',
    mechanism: 'Carbamazepine induces CYP3A4, reducing quetiapine levels by up to 87%; antipsychotic efficacy is severely compromised and psychiatric decompensation may occur.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['psychiatric symptoms'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'cyclosporine::rifampin',
    drugA_id: 'cyclosporine',
    drugB_id: 'rifampin',
    severity: 'contraindicated',
    mechanism: 'Rifampin is a powerful CYP3A4 and P-glycoprotein inducer that can reduce cyclosporine levels by 80-90%, causing acute transplant rejection; essentially contraindicated in transplant patients.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['cyclosporine levels', 'transplant function'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'rifampin::tacrolimus',
    drugA_id: 'rifampin',
    drugB_id: 'tacrolimus',
    severity: 'contraindicated',
    mechanism: 'Rifampin dramatically induces CYP3A4 and P-glycoprotein, reducing tacrolimus levels by up to 90% within days; acute transplant rejection is a documented life-threatening consequence.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['tacrolimus levels', 'renal function', 'transplant function'],
    lastReviewed: '2026-03-08'
  },
  // OpenFDA-suggested missing warfarin interactions
  {
    pairKey: 'clopidogrel::warfarin',
    drugA_id: 'clopidogrel',
    drugB_id: 'warfarin',
    severity: 'serious',
    mechanism: 'Clopidogrel inhibits platelet P2Y12 receptors while warfarin inhibits clotting factors; dual therapy significantly increases major bleeding risk including intracranial hemorrhage.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['INR', 'bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'simvastatin::warfarin',
    drugA_id: 'simvastatin',
    drugB_id: 'warfarin',
    severity: 'moderate',
    mechanism: 'Simvastatin may inhibit CYP2C9-mediated warfarin metabolism and displace warfarin from protein binding; INR may increase modestly; monitoring recommended when starting or changing statin dose.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['INR'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'tramadol::warfarin',
    drugA_id: 'tramadol',
    drugB_id: 'warfarin',
    severity: 'moderate',
    mechanism: 'Tramadol may enhance warfarin anticoagulation through serotonergic platelet inhibition and possible CYP2C9/CYP3A4 interactions; INR monitoring recommended during tramadol use.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['INR'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'duloxetine::warfarin',
    drugA_id: 'duloxetine',
    drugB_id: 'warfarin',
    severity: 'moderate',
    mechanism: 'Duloxetine inhibits serotonin reuptake in platelets, impairing platelet aggregation; combined with warfarin anticoagulation, bleeding risk especially GI is increased.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['INR', 'bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'escitalopram::warfarin',
    drugA_id: 'escitalopram',
    drugB_id: 'warfarin',
    severity: 'moderate',
    mechanism: 'Escitalopram impairs platelet function by depleting serotonin stores; when combined with warfarin, risk of bleeding is increased beyond warfarin alone.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['INR', 'bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'aspirin::duloxetine',
    drugA_id: 'aspirin',
    drugB_id: 'duloxetine',
    severity: 'moderate',
    mechanism: 'Both aspirin and duloxetine impair platelet function through different mechanisms; combined use increases gastrointestinal and systemic bleeding risk, particularly in elderly patients.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['GI symptoms', 'bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'aspirin::escitalopram',
    drugA_id: 'aspirin',
    drugB_id: 'escitalopram',
    severity: 'moderate',
    mechanism: 'Aspirin inhibits COX-1 platelet thromboxane A2 production while escitalopram depletes platelet serotonin; dual antiplatelet effects increase GI and systemic bleeding risk.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['GI symptoms', 'bleeding signs'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'aspirin::sertraline',
    drugA_id: 'aspirin',
    drugB_id: 'sertraline',
    severity: 'moderate',
    mechanism: 'Sertraline depletes platelet serotonin impairing aggregation; aspirin blocks COX-1; the combination elevates GI and mucocutaneous bleeding risk, especially in older patients.',
    evidenceLevel: 'probable',
    source: 'bundle',
    monitoringParameters: ['GI symptoms'],
    lastReviewed: '2026-03-08'
  },
  {
    pairKey: 'hydrochlorothiazide::spironolactone',
    drugA_id: 'hydrochlorothiazide',
    drugB_id: 'spironolactone',
    severity: 'moderate',
    mechanism: 'Hydrochlorothiazide causes potassium loss while spironolactone conserves potassium; the opposing effects can partially cancel out and the combination requires electrolyte monitoring to avoid hyperkalemia.',
    evidenceLevel: 'established',
    source: 'bundle',
    monitoringParameters: ['potassium', 'sodium', 'blood pressure'],
    lastReviewed: '2026-03-08'
  }
];

extraInteractions.forEach(i => {
  if (!allInteractions[i.pairKey]) allInteractions[i.pairKey] = i;
});

const finalDB = {
  version: '2.0.0',
  lastUpdated: '2026-03-08',
  drugs: Object.values(allDrugs).sort((a, b) => a.id.localeCompare(b.id)),
  interactions: Object.values(allInteractions).sort((a, b) => a.pairKey.localeCompare(b.pairKey))
};

fs.writeFileSync(path.join(root, 'public/data/drug-db.json'), JSON.stringify(finalDB, null, 2));

console.log('=== FINAL DB WRITTEN ===');
console.log('Version: 2.0.0');
console.log('Total drugs:', finalDB.drugs.length);
console.log('Total interactions:', finalDB.interactions.length);

const sevCount = {};
finalDB.interactions.forEach(i => { sevCount[i.severity] = (sevCount[i.severity] || 0) + 1; });
console.log('By severity:', JSON.stringify(sevCount));

const catCount = {};
finalDB.drugs.forEach(d => d.categories.forEach(c => { catCount[c] = (catCount[c] || 0) + 1; }));
console.log('Drugs by category:', JSON.stringify(catCount));

// Validate no invalid drug refs
const validIds = new Set(finalDB.drugs.map(d => d.id));
const invalid = finalDB.interactions.filter(i => !validIds.has(i.drugA_id) || !validIds.has(i.drugB_id));
console.log('Invalid drug references:', invalid.length);
if (invalid.length > 0) console.log(invalid.map(i => i.pairKey));
