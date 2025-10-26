#!/usr/bin/env node

// Simple validation script
console.log('Checking attendance pages...');

const fs = require('fs');
const path = require('path');

// Check if files exist
const files = [
  'app/(platform)/volunteer/attendance/page.tsx',
  'app/(platform)/organization/attendance/[id]/page.tsx',
];

let allExist = true;
for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`✗ ${file} - NOT FOUND`);
    allExist = false;
  }
}

// Check translations
const transPath = path.join(__dirname, 'lib/i18n/translations.ts');
if (fs.existsSync(transPath)) {
  const content = fs.readFileSync(transPath, 'utf8');
  const hasAttendanceEn = content.includes('attendance: {') && content.includes('myAttendance:');
  const hasAttendanceAr = content.includes('حضوري');
  
  console.log(`\n✓ Translations file exists`);
  console.log(`${hasAttendanceEn ? '✓' : '✗'} English attendance translations`);
  console.log(`${hasAttendanceAr ? '✓' : '✗'} Arabic attendance translations`);
}

console.log(allExist ? '\n✅ All files created successfully!' : '\n❌ Some files are missing!');
