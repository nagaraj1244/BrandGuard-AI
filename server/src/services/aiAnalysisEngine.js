import { db } from '../data/db.js';

export function analyzeContentText(text, channel = 'General') {
  const guidelines = db.guidelines;
  const violations = [];
  let score = 100;

  if (!text || text.trim() === '') {
    return {
      score: 0,
      violations: [{ type: 'Empty Content', severity: 'Critical', message: 'No content provided for analysis.' }],
      suggestions: '',
      cleanText: ''
    };
  }

  const lowerText = text.toLowerCase();

  // 1. Forbidden Words Check
  guidelines.forbiddenWords.forEach(rule => {
    const regex = new RegExp(`\\b${rule.word}\\b`, 'gi');
    if (regex.test(text)) {
      violations.push({
        type: 'Forbidden Word',
        severity: rule.word.includes('100%') ? 'Critical' : 'High',
        keyword: rule.word,
        message: `Prohibited terminology detected: "${rule.word}". ${rule.reason}`
      });
      score -= rule.word.includes('100%') ? 25 : 15;
    }
  });

  // 2. Mandatory Disclaimer Check
  const channelDisclaimer = guidelines.requiredDisclaimers.find(
    d => d.channel.toLowerCase().includes(channel.toLowerCase()) || channel.toLowerCase().includes('social')
  );

  if (channelDisclaimer && !lowerText.includes('ai-assisted')) {
    violations.push({
      type: 'Missing Disclaimer',
      severity: 'Medium',
      message: `Mandatory channel disclaimer missing for ${channel}: "${channelDisclaimer.text}"`
    });
    score -= 10;
  }

  // 3. Tone of voice checks (hype / buzzwords)
  const hypeWords = ['groundbreaking', 'miracle', 'insane', 'skyrocket'];
  hypeWords.forEach(word => {
    if (new RegExp(`\\b${word}\\b`, 'gi').test(text)) {
      violations.push({
        type: 'Tone Deviation',
        severity: 'Low',
        keyword: word,
        message: `Tone is overly sensationalist ("${word}"). Inkloom voice emphasizes crisp, trustworthy delivery.`
      });
      score -= 5;
    }
  });

  // Normalize Score
  score = Math.max(0, Math.min(100, score));

  // 4. Generate AI Suggestion (Smart replacement)
  let cleanText = text;
  guidelines.forbiddenWords.forEach(rule => {
    const regex = new RegExp(`\\b${rule.word}\\b`, 'gi');
    if (rule.word === 'delve') cleanText = cleanText.replace(regex, 'explore');
    else if (rule.word === 'unleash') cleanText = cleanText.replace(regex, 'activate');
    else if (rule.word === 'game-changer') cleanText = cleanText.replace(regex, 'significant advancement');
    else if (rule.word === 'revolutionize') cleanText = cleanText.replace(regex, 'transform');
    else if (rule.word === '100% error-free') cleanText = cleanText.replace(regex, 'highly accurate');
  });

  if (channelDisclaimer && !cleanText.includes(channelDisclaimer.text)) {
    cleanText += `\n\n[Disclaimer: ${channelDisclaimer.text}]`;
  }

  return {
    score,
    status: score >= 85 ? 'Approved' : score >= 60 ? 'Changes Requested' : 'Needs Significant Revision',
    violations,
    suggestedRewrite: cleanText,
    metrics: {
      wordCount: text.trim().split(/\s+/).length,
      charCount: text.length,
      estimatedReadingTimeMin: Math.ceil(text.trim().split(/\s+/).length / 200)
    }
  };
}

export function analyzeVisualAsset(colorHex = '#0284c7', contrastRatio = 7.1) {
  const guidelines = db.guidelines;
  const approvedPalette = Object.values(guidelines.colorPalette).map(c => c.toLowerCase());
  const isPaletteApproved = approvedPalette.includes(colorHex.toLowerCase());

  const passesContrast = contrastRatio >= guidelines.typography.minHeadingContrast;

  return {
    submittedColor: colorHex,
    paletteMatch: isPaletteApproved,
    contrastRatio,
    contrastPass: passesContrast,
    wcagRating: contrastRatio >= 7.0 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Fail',
    recommendations: isPaletteApproved
      ? 'Color matches Inkloom AI official palette.'
      : `Color ${colorHex} deviates from brand primary (${guidelines.colorPalette.primary}) or accent (${guidelines.colorPalette.accent}).`
  };
}

