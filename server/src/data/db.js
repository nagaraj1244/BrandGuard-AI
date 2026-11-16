import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

// Default initial seed data (with real cryptographically hashed passwords)
function getInitialData() {
  const adminHash = hashPassword('BrandGuard@2026');
  const creatorHash = hashPassword('BrandGuard@2026');
  const reviewerHash = hashPassword('BrandGuard@2026');

  return {
    users: [
      {
        id: 'user-admin-01',
        name: 'Alex Rivera',
        email: 'admin@brandguard.ai',
        salt: adminHash.salt,
        passwordHash: adminHash.hash,
        role: 'Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-creator-01',
        name: 'Jordan Lee',
        email: 'creator@brandguard.ai',
        salt: creatorHash.salt,
        passwordHash: creatorHash.hash,
        role: 'Creator',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-reviewer-01',
        name: 'Taylor Morgan',
        email: 'reviewer@brandguard.ai',
        salt: reviewerHash.salt,
        passwordHash: reviewerHash.hash,
        role: 'Reviewer',
        createdAt: new Date().toISOString()
      }
    ],

    companySettings: {
      companyName: 'Inkloom AI Global',
      brandGovernancePolicy: 'Enterprise Strict (V3)',
      automatedAIGating: true,
      strictnessLevel: 'High',
      updatedAt: new Date().toISOString()
    },

    guidelines: {
      brandName: 'Inkloom AI',
      tagline: 'The AI-Powered Narrative Continuity and Creative Operating System',
      mission: 'Empower creators with continuous, brand-consistent storytelling at scale.',
      toneOfVoice: {
        primary: ['Empowering', 'Visionary', 'Crisp', 'Trustworthy'],
        avoid: ['Overly Technical Jargon', 'Hyperbolic Hype', 'Passive Voice', 'Aggressive Sales Clichés'],
        readingLevel: 'Grade 8 to 11 (Accessible yet professional)'
      },
      colorPalette: {
        primary: '#0284c7',
        secondary: '#0f172a',
        accent: '#10b981',
        background: '#090d16',
        neutral: '#64748b'
      },
      typography: {
        primaryFont: 'Plus Jakarta Sans',
        secondaryFont: 'JetBrains Mono',
        minHeadingContrast: 4.5,
        minBodyContrast: 7.0
      },
      forbiddenWords: [
        { word: 'delve', reason: 'Common AI cliché; replace with "explore" or "analyze"' },
        { word: 'unleash', reason: 'Overused buzzword; replace with "activate" or "enable"' },
        { word: 'game-changer', reason: 'Hyperbolic marketing fluff; demonstrate actual value instead' },
        { word: 'revolutionize', reason: 'Unsubstantiated superlative; describe the specific efficiency' },
        { word: '100% error-free', reason: 'Unverifiable legal liability claim' }
      ],
      requiredDisclaimers: [
        {
          channel: 'Social / Ads',
          text: 'AI-assisted generation. Always verify with human editorial standards.'
        },
        {
          channel: 'Financial / Enterprise',
          text: 'Results may vary based on deployment scale and domain data quality.'
        }
      ],
      logoRules: {
        minClearanceSpacePx: 24,
        allowedVariations: ['Full Color on Dark', 'Full Color on Light', 'Monochrome White'],
        prohibitedAlterations: ['Do not stretch or distort', 'Do not place on busy backgrounds without gradient overlay']
      }
    },

    submissions: [
      {
        id: 'sub-101',
        title: 'Q1 Product Launch Announcement',
        channel: 'LinkedIn',
        creatorId: 'user-creator-01',
        creatorName: 'Jordan Lee',
        contentType: 'Text + Banner',
        originalContent: 'We are thrilled to unleash our revolutionary platform that will delve deep into manuscript continuity! It guarantees 100% error-free writing.',
        suggestedContent: 'We are excited to launch our intelligent platform that analyzes manuscript continuity with precision, helping teams craft consistent narratives at scale.',
        overallScore: 62,
        status: 'Changes Requested',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        violations: [
          { type: 'Forbidden Word', severity: 'High', message: 'Contains prohibited AI cliché: "unleash"' },
          { type: 'Forbidden Word', severity: 'High', message: 'Contains prohibited AI cliché: "delve"' },
          { type: 'Legal Liability', severity: 'Critical', message: 'Contains unverified guarantee: "100% error-free"' },
          { type: 'Missing Disclaimer', severity: 'Medium', message: 'Missing mandatory social media AI-assisted disclaimer.' }
        ],
        visualAnalysis: {
          dominantColor: '#0284c7',
          paletteMatched: true,
          contrastRatio: 6.8,
          contrastStatus: 'Pass (WCAG AA)'
        },
        reviews: [
          {
            reviewerId: 'user-reviewer-01',
            reviewerName: 'Taylor Morgan',
            decision: 'Changes Requested',
            comment: 'Please accept the AI suggested rewrite to eliminate the banned buzzwords and include the mandatory AI disclaimer.',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      },
      {
        id: 'sub-102',
        title: 'Brand Consistency Whitepaper Summary',
        channel: 'Blog',
        creatorId: 'user-creator-01',
        creatorName: 'Jordan Lee',
        contentType: 'Text',
        originalContent: 'Maintaining brand consistency across decentralized AI workflows requires a continuous governance architecture rather than periodic human spot-checks.',
        suggestedContent: 'Maintaining brand consistency across decentralized AI workflows requires a continuous governance architecture rather than periodic human spot-checks.',
        overallScore: 96,
        status: 'Approved',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        violations: [],
        visualAnalysis: null,
        reviews: [
          {
            reviewerId: 'user-reviewer-01',
            reviewerName: 'Taylor Morgan',
            decision: 'Approved',
            comment: 'Clean, professional tone matching Inkloom AI voice perfectly.',
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ]
      }
    ]
  };
}

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.companySettings) this.data.companySettings = getInitialData().companySettings;
        if (!this.data.guidelines) this.data.guidelines = getInitialData().guidelines;
        if (!this.data.submissions) this.data.submissions = getInitialData().submissions;
      } else {
        this.data = getInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('[DB] Error loading database, initializing fresh state:', err);
      this.data = getInitialData();
      this.persist();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Error persisting database to disk:', err);
    }
  }

  // Getters for proxy compatibility with existing code
  get users() { return this.data.users; }
  get guidelines() { return this.data.guidelines; }
  set guidelines(g) { this.data.guidelines = g; this.persist(); }
  get submissions() { return this.data.submissions; }
  get companySettings() { return this.data.companySettings; }
  set companySettings(s) { this.data.companySettings = s; this.persist(); }

  // User Management Methods
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByResetToken(token) {
    if (!token) return null;
    const now = Date.now();
    return this.data.users.find(u => u.resetPasswordToken === token && u.resetPasswordExpires > now);
  }

  createUser({ name, email, password, role }) {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const { salt, hash } = hashPassword(password);
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      salt,
      passwordHash: hash,
      role: role || 'Creator',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUserRole(userId, newRole) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    user.role = newRole;
    this.persist();
    return user;
  }

  deleteUser(userId) {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    const removed = this.data.users.splice(idx, 1)[0];
    this.persist();
    return removed;
  }

  setResetToken(email, token, expiresAt) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    this.persist();
    return user;
  }

  resetPasswordWithToken(token, newPassword) {
    const user = this.findUserByResetToken(token);
    if (!user) {
      throw new Error('Reset token is invalid or has expired');
    }

    const { salt, hash } = hashPassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    this.persist();
    return user;
  }
}

export const db = new Database();
