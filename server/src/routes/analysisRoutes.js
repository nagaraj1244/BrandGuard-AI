import { Router } from 'express';
import { analyzeContentText, analyzeVisualAsset } from '../services/aiAnalysisEngine.js';

const router = Router();

// Real-time Text Content Analysis & Violation Detection
router.post('/text', (req, res) => {
  const { text, channel } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Content text is required for analysis' });
  }

  const analysisResult = analyzeContentText(text, channel);
  res.json({
    success: true,
    data: analysisResult
  });
});

// Visual Asset & Palette Checker
router.post('/visual', (req, res) => {
  const { colorHex, contrastRatio } = req.body;
  const visualResult = analyzeVisualAsset(colorHex, contrastRatio);
  res.json({
    success: true,
    data: visualResult
  });
});

export default router;

