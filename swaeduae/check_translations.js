const fs = require('fs');

const content = fs.readFileSync('lib/i18n/translations.ts', 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);
console.log('\nLast 10 lines:');
lines.slice(-10).forEach((line, idx) => {
  console.log(`${lines.length - 10 + idx + 1}: ${line}`);
});

// Check for ar: occurrences
const arLines = [];
lines.forEach((line, idx) => {
  if (line.match(/^\s+ar:\s*{/)) {
    arLines.push(idx + 1);
  }
});
console.log(`\nFound ar: at lines: ${arLines.join(', ')}`);
