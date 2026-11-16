import { Router } from 'express';
import { db } from '../data/db.js';
import { analyzeContentText, analyzeVisualAsset } from '../services/aiAnalysisEngine.js';

const router = Router();

// Get all submissions (Content History)
router.get('/', (req, res) => {
  const { role, creatorId, status } = req.query;
  let items = [...db.submissions];

  if (creatorId) {
    items = items.filter(i => i.creatorId === creatorId);
  }
  if (status) {
    items = items.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }

  res.json({ success: true, count: items.length, data: items });
});

// Get single submission by ID
router.get('/:id', (req, res) => {
  const item = db.submissions.find(s => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  res.json({ success: true, data: item });
});

// Submit new content with automatic AI scan
router.post('/submit', (req, res) => {
  const { title, channel, creatorId, creatorName, contentType, content, colorHex } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  // Run AI Content Analysis
  const aiAnalysis = analyzeContentText(content, channel);
  let visualCheck = null;
  if (colorHex) {
    visualCheck = analyzeVisualAsset(colorHex);
  }

  const newSubmission = {
    id: `sub-${Date.now()}`,
    title,
    channel: channel || 'General',
    creatorId: creatorId || 'u2',
    creatorName: creatorName || 'Creator User',
    contentType: contentType || 'Marketing Copy',
    originalContent: content,
    suggestedContent: aiAnalysis.suggestedRewrite,
    overallScore: aiAnalysis.score,
    status: aiAnalysis.score >= 85 ? 'In Review' : 'Changes Requested',
    createdAt: new Date().toISOString(),
    violations: aiAnalysis.violations,
    visualAnalysis: visualCheck,
    reviews: []
  };

  db.submissions.unshift(newSubmission);

  res.status(201).json({
    success: true,
    message: 'Content submitted and AI analyzed successfully',
    data: newSubmission
  });
});

export default router;

