import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import guidelinesRoutes from './routes/guidelinesRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guidelines', guidelinesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BrandGuard AI Governance Engine (Express)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[BrandGuard AI] Express server running on http://127.0.0.1:${PORT}`);
});

export default app;

