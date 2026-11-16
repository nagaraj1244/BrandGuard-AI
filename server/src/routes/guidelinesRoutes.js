import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// Get active Brand Guidelines
router.get('/', (req, res) => {
  res.json({ success: true, data: db.guidelines });
});

// Update Brand Guidelines (Admin only)
router.put('/', (req, res) => {
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ success: false, message: 'Missing update payload' });
  }

  db.guidelines = {
    ...db.guidelines,
    ...updates
  };

  res.json({
    success: true,
    message: 'Brand guidelines updated successfully',
    data: db.guidelines
  });
});

// Add new forbidden word
router.post('/forbidden-words', (req, res) => {
  const { word, reason } = req.body;
  if (!word || !reason) {
    return res.status(400).json({ success: false, message: 'Word and reason are required' });
  }

  db.guidelines.forbiddenWords.push({ word, reason });
  res.status(201).json({
    success: true,
    message: `Forbidden rule added for "${word}"`,
    data: db.guidelines.forbiddenWords
  });
});

export default router;

