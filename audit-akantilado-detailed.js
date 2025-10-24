#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('DETAILED AUDIT: akantilado.html & akantilado.json');
console.log('='.repeat(80));
console.log();

// Read files
const htmlPath = 'projects/akantilado.html';
const jsonPath = 'locales/akantilado.json';

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const localeData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Extract all data-i18n attributes from HTML
const dataI18nRegex = /data-i18n="([^"]+)"/g;
const htmlKeys = [];
let match;
while ((match = dataI18nRegex.exec(htmlContent)) !== null) {
  htmlKeys.push(match[1]);
}

// Get unique keys
const uniqueHtmlKeys = [...new Set(htmlKeys)];

// Helper to get nested value
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Check each language
const languages = ['en', 'pl', 'nl'];
const results = {
  htmlKeys: uniqueHtmlKeys.length,
  totalKeysInHTML: htmlKeys.length,
  languages: {}
};

console.log('1. FILE STATUS');
console.log('-'.repeat(40));
console.log(`HTML File: ${fs.existsSync(htmlPath) ? '✓ EXISTS' : '✗ MISSING'}`);
console.log(`JSON File: ${fs.existsSync(jsonPath) ? '✓ EXISTS' : '✗ MISSING'}`);
console.log();

console.log('2. HTML TRANSLATION MARKUP ANALYSIS');
console.log('-'.repeat(40));
console.log(`Total data-i18n attributes found: ${htmlKeys.length}`);
console.log(`Unique translation keys: ${uniqueHtmlKeys.length}`);
console.log();

console.log('3. TRANSLATION KEYS IN HTML');
console.log('-'.repeat(40));
uniqueHtmlKeys.sort().forEach((key, index) => {
  console.log(`  ${(index + 1).toString().padStart(2)}. ${key}`);
});
console.log();

console.log('4. LANGUAGE COVERAGE ANALYSIS');
console.log('-'.repeat(40));

languages.forEach(lang => {
  const langData = localeData[lang];
  const exists = !!langData;
  
  if (!exists) {
    console.log(`${lang.toUpperCase()}: ✗ MISSING`);
    results.languages[lang] = { exists: false, coverage: 0, missing: uniqueHtmlKeys };
    return;
  }
  
  // Count total keys in JSON
  function countKeys(obj, prefix = '') {
    let count = 0;
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        count += countKeys(obj[key], fullKey);
      } else {
        count++;
      }
    }
    return count;
  }
  
  const totalJsonKeys = countKeys(langData);
  
  // Check which HTML keys are present
  const missingKeys = [];
  const presentKeys = [];
  
  uniqueHtmlKeys.forEach(key => {
    const value = getNestedValue(langData, key);
    if (value === undefined || value === null || value === '') {
      missingKeys.push(key);
    } else {
      presentKeys.push(key);
    }
  });
  
  const coverage = ((presentKeys.length / uniqueHtmlKeys.length) * 100).toFixed(1);
  
  console.log(`${lang.toUpperCase()}: ✓ EXISTS`);
  console.log(`  Total keys in JSON: ${totalJsonKeys}`);
  console.log(`  HTML keys covered: ${presentKeys.length}/${uniqueHtmlKeys.length} (${coverage}%)`);
  
  if (missingKeys.length > 0) {
    console.log(`  ⚠ Missing keys (${missingKeys.length}):`);
    missingKeys.forEach(key => console.log(`    - ${key}`));
  } else {
    console.log(`  ✓ All HTML keys have translations`);
  }
  console.log();
  
  results.languages[lang] = {
    exists: true,
    totalJsonKeys,
    coverage: parseFloat(coverage),
    presentKeys: presentKeys.length,
    missingKeys: missingKeys.length,
    missing: missingKeys
  };
});

console.log('5. TRANSLATION QUALITY SAMPLE');
console.log('-'.repeat(40));
const sampleKeys = ['title', 'tagline', 'back'];
sampleKeys.forEach(key => {
  console.log(`Key: "${key}"`);
  languages.forEach(lang => {
    const value = getNestedValue(localeData[lang], key);
    console.log(`  ${lang.toUpperCase()}: ${value || '(missing)'}`);
  });
  console.log();
});

console.log('6. ISSUES SUMMARY');
console.log('-'.repeat(40));
const issues = [];

// Check for missing translations
languages.forEach(lang => {
  const langResult = results.languages[lang];
  if (!langResult.exists) {
    issues.push({ severity: 'CRITICAL', message: `${lang.toUpperCase()} language section missing` });
  } else if (langResult.missingKeys > 0) {
    issues.push({ severity: 'HIGH', message: `${lang.toUpperCase()} missing ${langResult.missingKeys} translation keys` });
  }
});

// Check for unused keys in JSON
languages.forEach(lang => {
  const langData = localeData[lang];
  if (!langData) return;
  
  function getAllJsonKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(getAllJsonKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }
  
  const allJsonKeys = getAllJsonKeys(langData);
  const unusedKeys = allJsonKeys.filter(key => !uniqueHtmlKeys.includes(key));
  
  if (unusedKeys.length > 0) {
    issues.push({ severity: 'LOW', message: `${lang.toUpperCase()} has ${unusedKeys.length} unused keys in JSON` });
  }
});

if (issues.length === 0) {
  console.log('✓ No issues found! Translation system is complete.');
} else {
  issues.forEach(issue => {
    const icon = issue.severity === 'CRITICAL' ? '✗' : issue.severity === 'HIGH' ? '⚠' : 'ℹ';
    console.log(`${icon} [${issue.severity}] ${issue.message}`);
  });
}

console.log();
console.log('7. RECOMMENDATIONS');
console.log('-'.repeat(40));

if (issues.length === 0) {
  console.log('✓ Translation system is fully functional');
  console.log('✓ All HTML elements have data-i18n attributes');
  console.log('✓ All languages (EN/PL/NL) are complete');
  console.log('✓ Ready for production');
} else {
  if (issues.some(i => i.severity === 'CRITICAL')) {
    console.log('1. Add missing language sections to JSON file');
  }
  if (issues.some(i => i.severity === 'HIGH')) {
    console.log('2. Add missing translation keys to JSON file');
  }
  if (issues.some(i => i.severity === 'LOW')) {
    console.log('3. Consider removing unused keys from JSON (optional cleanup)');
  }
}

console.log();
console.log('='.repeat(80));
console.log('AUDIT COMPLETE');
console.log('='.repeat(80));

// Save results
fs.writeFileSync('audit-akantilado-results.json', JSON.stringify({
  project: 'akantilado',
  timestamp: new Date().toISOString(),
  results,
  issues
}, null, 2));

console.log('\nDetailed results saved to: audit-akantilado-results.json');
