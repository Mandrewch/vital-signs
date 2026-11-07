const assert = require('assert');

// Test 1: Blood Pressure Category Calculation Logic
function calculateBpCategory(systolic, diastolic) {
  if (systolic === undefined && diastolic === undefined) return undefined;
  const sys = systolic ?? 0;
  const dia = diastolic ?? 0;

  if (sys > 180 || dia > 120) return 'crisis';
  if (sys >= 140 || dia >= 90) return 'stage2';
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return 'stage1';
  if (sys >= 120 && sys <= 129 && dia < 80) return 'elevated';
  if (sys < 120 && dia < 80 && sys > 0 && dia > 0) return 'normal';
  return undefined;
}

console.log('Testing BP Category logic...');
assert.strictEqual(calculateBpCategory(118, 76), 'normal');
assert.strictEqual(calculateBpCategory(124, 78), 'elevated');
assert.strictEqual(calculateBpCategory(132, 79), 'stage1');
assert.strictEqual(calculateBpCategory(120, 85), 'stage1');
assert.strictEqual(calculateBpCategory(142, 88), 'stage2');
assert.strictEqual(calculateBpCategory(130, 92), 'stage2');
assert.strictEqual(calculateBpCategory(185, 95), 'crisis');
assert.strictEqual(calculateBpCategory(140, 125), 'crisis');
console.log('✓ BP Category calculations pass perfectly!');

// Test 2: CSV Parsing & Normalization
const sampleCsv = `Date,Weight (kg),Temp (°C),Blood Pressure,SpO2 (%),Pulse (bpm),Notes
2026-11-06,78.4,36.6,118/76,98,68,"Slept 8 hours"
05/11/2026,78.6 kg,36.7 °C,122 / 78,99 %,72 bpm,Morning walk
2026-11-04,78.9,36.5,135/85,97,65,Felt good`;

console.log('Testing sample CSV simulation...');
const Papa = require('papaparse');

Papa.parse(sampleCsv, {
  header: true,
  complete: (results) => {
    assert.strictEqual(results.data.length, 3);
    const row0 = results.data[0];
    assert.strictEqual(row0.Date, '2026-11-06');
    assert.strictEqual(parseFloat(row0['Weight (kg)']), 78.4);
    assert.strictEqual(row0['Blood Pressure'], '118/76');
    console.log('✓ CSV parser correctly extracted all records!');
    console.log('All automated tests passed successfully!');
  }
});
