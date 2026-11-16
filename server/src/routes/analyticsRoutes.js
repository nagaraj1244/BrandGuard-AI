import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// Get summary metrics and report data
router.get('/', (req, res) => {
  const submissions = db.submissions;
  const totalSubmissions = submissions.length;
  
  const approvedCount = submissions.filter(s => s.status === 'Approved').length;
  const changesCount = submissions.filter(s => s.status === 'Changes Requested').length;
  const rejectedCount = submissions.filter(s => s.status === 'Rejected').length;
  const inReviewCount = submissions.filter(s => s.status === 'In Review').length;

  const totalScore = submissions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
  const avgScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

  // Aggregate violations breakdown
  const violationCounts = {};
  submissions.forEach(s => {
    (s.violations || []).forEach(v => {
      violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
    });
  });

  res.json({
    success: true,
    data: {
      metrics: {
        totalSubmissions,
        adherenceRatePercent: avgScore,
        approvedCount,
        changesCount,
        rejectedCount,
        inReviewCount,
        estimatedHoursSaved: totalSubmissions * 2.5
      },
      violationBreakdown: violationCounts,
      channelsTracked: ['LinkedIn', 'Blog', 'X (Twitter)', 'Email Newsletter', 'Ad Copy'],
      generatedAt: new Date().toISOString()
    }
  });
});

export default router;

