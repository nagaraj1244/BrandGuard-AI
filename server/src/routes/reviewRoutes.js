import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// Get submissions waiting for review
router.get('/queue', (req, res) => {
  const pending = db.submissions.filter(s => 
    ['In Review', 'Changes Requested', 'Pending AI Scan'].includes(s.status)
  );
  res.json({ success: true, count: pending.length, data: pending });
});

// Submit review decision (Approve, Request Changes, Reject)
router.post('/:id/decision', (req, res) => {
  const { id } = req.params;
  const { reviewerId, reviewerName, decision, comment } = req.body;

  const submission = db.submissions.find(s => s.id === id);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (!['Approved', 'Changes Requested', 'Rejected'].includes(decision)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Decision must be one of: Approved, Changes Requested, Rejected' 
    });
  }

  submission.status = decision;
  submission.reviews.push({
    reviewerId: reviewerId || 'u3',
    reviewerName: reviewerName || 'Reviewer User',
    decision,
    comment: comment || '',
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Submission marked as ${decision}`,
    data: submission
  });
});

export default router;

