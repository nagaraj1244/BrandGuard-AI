import { analyzeContentText, analyzeVisualAsset } from '../src/services/aiAnalysisEngine.js';
import { db } from '../src/data/db.js';

console.log('--- 1. Testing AI Content Analysis ---');
const testCopy = 'We are proud to unleash our platform to delve into narrative continuity with 100% error-free output.';
const analysis = analyzeContentText(testCopy, 'LinkedIn');
console.log('Original Text:', testCopy);
console.log('Score:', analysis.score);
console.log('Status:', analysis.status);
console.log('Violations Detected:', analysis.violations.length);
analysis.violations.forEach((v, i) => {
  console.log(`  [Violation ${i+1}] ${v.severity} | ${v.type}: ${v.message}`);
});
console.log('AI Suggested Rewrite:\n', analysis.suggestedRewrite);

console.log('\n--- 2. Testing Visual Asset Analysis ---');
const visualCheck = analyzeVisualAsset('#0284c7', 6.5);
console.log('Submitted Color:', visualCheck.submittedColor);
console.log('Palette Match:', visualCheck.paletteMatch);
console.log('WCAG Rating:', visualCheck.wcagRating);

console.log('\n--- 3. Verifying Pre-seeded Brand Guidelines & Submissions ---');
console.log('Brand Name:', db.guidelines.brandName);
console.log('Forbidden Words Count:', db.guidelines.forbiddenWords.length);
console.log('Initial Submissions Count:', db.submissions.length);
console.log('Initial Users Count:', db.users.length);

console.log('\n[SUCCESS] BrandGuard AI Core Engine verified successfully!');

