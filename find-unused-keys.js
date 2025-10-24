#!/usr/bin/env node
const fs = require('fs');

const htmlContent = fs.readFileSync('projects/akantilado.html', 'utf8');
const localeData = JSON.parse(fs.readFileSync('locales/akantilado.json', 'utf8'));

// Extract HTML keys
const dataI18nRegex = /data-i18n="([^"]+)"/g;
const htmlKeys = [];
let match;
while ((match = dataI18nRegex.exec(htmlContent)) !== null) {
  htmlKeys.push(match[1]);
}
const uniqueHtmlKeys = [...new Set(htmlKeys)];

// Get all JSON keys
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

const enKeys = getAllJsonKeys(localeData.en);
const unusedKeys = enKeys.filter(key => !uniqueHtmlKeys.includes(key));

console.log('UNUSED KEYS IN JSON (not referenced in HTML):');
console.log('='.repeat(50));
unusedKeys.sort().forEach((key, index) => {
  const value = key.split('.').reduce((obj, k) => obj?.[k], localeData.en);
  console.log(`${(index + 1).toString().padStart(2)}. ${key}`);
  console.log(`    EN: ${value}`);
});
console.log();
console.log(`Total unused keys: ${unusedKeys.length}`);
