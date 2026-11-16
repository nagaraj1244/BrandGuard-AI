import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './data/db.js';
import { analyzeContentText, analyzeVisualAsset } from './services/aiAnalysisEngine.js';
import { verifyPassword, generateJWT, generateResetToken } from './utils/security.js';
import { getPermissionsForRole } from './utils/roles.js';
import { extractAndVerifyUser } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Helper to authenticate requests and enforce roles in native HTTP
function requireAuth(req, res, allowedRoles = []) {
  try {
    const authUser = extractAndVerifyUser(req);
    if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
      sendJson(res, 403, {
        success: false,
        message: `Forbidden: Action requires one of roles [${allowedRoles.join(', ')}]. Current role: ${authUser.role}`
      });
      return null;
    }
    return authUser;
  } catch (err) {
    sendJson(res, 401, {
      success: false,
      message: err.message || 'Authentication required'
    });
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Serve Web Interface
  if ((pathname === '/' || pathname === '/index.html') && method === 'GET') {
    const htmlPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
  }

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'BrandGuard AI Governance Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // ---------------- AUTHENTICATION ROUTES ----------------

  // 1. Register User
  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return sendJson(res, 400, {
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendJson(res, 400, {
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    try {
      const validRoles = ['Admin', 'Creator', 'Reviewer'];
      const assignedRole = validRoles.includes(role) ? role : 'Creator';

      const newUser = db.createUser({
        name,
        email,
        password,
        role: assignedRole
      });

      const token = generateJWT({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });

      return sendJson(res, 201, {
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        permissions: getPermissionsForRole(newUser.role)
      });
    } catch (err) {
      return sendJson(res, 400, {
        success: false,
        message: err.message
      });
    }
  }

  // 2. Login User
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return sendJson(res, 200, {
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      permissions: getPermissionsForRole(user.role)
    });
  }

  // 3. Current User Profile (/me)
  if (pathname === '/api/auth/me' && method === 'GET') {
    const authUser = requireAuth(req, res);
    if (!authUser) return;
    return sendJson(res, 200, {
      success: true,
      user: authUser,
      permissions: authUser.permissions
    });
  }

  // 4. Logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return sendJson(res, 200, {
      success: true,
      message: 'Logged out successfully.'
    });
  }

  // 5. Forgot Password
  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { email } = body;

    if (!email) {
      return sendJson(res, 400, {
        success: false,
        message: 'Please provide an email address.'
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return sendJson(res, 404, {
        success: false,
        message: 'No registered user found with that email address.'
      });
    }

    const resetToken = generateResetToken();
    const expiresAt = Date.now() + 3600000; // 1 hour

    db.setResetToken(user.email, resetToken, expiresAt);
    console.log(`[AUTH] Password reset requested for ${user.email}. Token: ${resetToken}`);

    return sendJson(res, 200, {
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken,
      expiresIn: '1 hour'
    });
  }

  // 6. Reset Password with Token
  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return sendJson(res, 400, {
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return sendJson(res, 400, {
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    try {
      const user = db.resetPasswordWithToken(token, newPassword);
      return sendJson(res, 200, {
        success: true,
        message: `Password successfully updated for ${user.email}. You can now log in.`
      });
    } catch (err) {
      return sendJson(res, 400, {
        success: false,
        message: err.message
      });
    }
  }

  // ---------------- USER MANAGEMENT (ADMIN ONLY) ----------------

  // List all users
  if (pathname === '/api/users' && method === 'GET') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const users = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    return sendJson(res, 200, { success: true, count: users.length, data: users });
  }

  // User Stats
  if (pathname === '/api/users/stats' && method === 'GET') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const users = db.users;
    return sendJson(res, 200, {
      success: true,
      data: {
        totalUsers: users.length,
        adminCount: users.filter(u => u.role === 'Admin').length,
        creatorCount: users.filter(u => u.role === 'Creator').length,
        reviewerCount: users.filter(u => u.role === 'Reviewer').length
      }
    });
  }

  // Update user role
  if (pathname.match(/^\/api\/users\/([^/]+)\/role$/) && method === 'PUT') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const id = pathname.split('/')[3];
    const body = await parseJsonBody(req);
    const { role } = body;

    const validRoles = ['Admin', 'Creator', 'Reviewer'];
    if (!validRoles.includes(role)) {
      return sendJson(res, 400, {
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`
      });
    }

    if (authUser.id === id && role !== 'Admin') {
      const adminCount = db.users.filter(u => u.role === 'Admin').length;
      if (adminCount <= 1) {
        return sendJson(res, 400, {
          success: false,
          message: 'Cannot demote the only remaining Admin account.'
        });
      }
    }

    try {
      const updated = db.updateUserRole(id, role);
      return sendJson(res, 200, {
        success: true,
        message: `Role for ${updated.name} updated to ${role}.`,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role
        }
      });
    } catch (err) {
      return sendJson(res, 404, { success: false, message: err.message });
    }
  }

  // Delete user
  if (pathname.match(/^\/api\/users\/([^/]+)$/) && method === 'DELETE') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const id = pathname.split('/')[3];
    if (authUser.id === id) {
      return sendJson(res, 400, {
        success: false,
        message: 'You cannot delete your own logged-in Admin account.'
      });
    }

    try {
      const deleted = db.deleteUser(id);
      return sendJson(res, 200, {
        success: true,
        message: `User ${deleted.name} (${deleted.email}) deleted successfully.`
      });
    } catch (err) {
      return sendJson(res, 404, { success: false, message: err.message });
    }
  }

  // Company Settings (Admin only)
  if (pathname === '/api/users/settings/company' && method === 'GET') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;
    return sendJson(res, 200, { success: true, data: db.companySettings });
  }

  if (pathname === '/api/users/settings/company' && method === 'PUT') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const body = await parseJsonBody(req);
    db.companySettings = {
      ...db.companySettings,
      ...body,
      updatedAt: new Date().toISOString()
    };
    return sendJson(res, 200, {
      success: true,
      message: 'Company settings updated successfully.',
      data: db.companySettings
    });
  }

  // ---------------- GUIDELINES ROUTES ----------------

  if (pathname === '/api/guidelines' && method === 'GET') {
    return sendJson(res, 200, { success: true, data: db.guidelines });
  }

  if (pathname === '/api/guidelines' && method === 'PUT') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const body = await parseJsonBody(req);
    db.guidelines = { ...db.guidelines, ...body };
    return sendJson(res, 200, {
      success: true,
      message: 'Brand guidelines updated successfully',
      data: db.guidelines
    });
  }

  if (pathname === '/api/guidelines/forbidden-words' && method === 'POST') {
    const authUser = requireAuth(req, res, ['Admin']);
    if (!authUser) return;

    const body = await parseJsonBody(req);
    if (!body.word || !body.reason) {
      return sendJson(res, 400, { success: false, message: 'Word and reason are required' });
    }
    db.guidelines.forbiddenWords.push({ word: body.word, reason: body.reason });
    db.persist();
    return sendJson(res, 201, {
      success: true,
      message: `Forbidden rule added for "${body.word}"`,
      data: db.guidelines.forbiddenWords
    });
  }

  // ---------------- AI CONTENT ANALYSIS ----------------

  if (pathname === '/api/analysis/text' && method === 'POST') {
    const body = await parseJsonBody(req);
    if (!body.text) {
      return sendJson(res, 400, { success: false, message: 'Content text is required' });
    }
    const result = analyzeContentText(body.text, body.channel || 'General');
    return sendJson(res, 200, { success: true, data: result });
  }

  if (pathname === '/api/analysis/visual' && method === 'POST') {
    const body = await parseJsonBody(req);
    const result = analyzeVisualAsset(body.colorHex, body.contrastRatio);
    return sendJson(res, 200, { success: true, data: result });
  }

  // ---------------- CONTENT SUBMISSIONS ----------------

  if (pathname === '/api/content' && method === 'GET') {
    const creatorId = url.searchParams.get('creatorId');
    const status = url.searchParams.get('status');

    let items = [...db.submissions];
    if (creatorId) items = items.filter(i => i.creatorId === creatorId);
    if (status) items = items.filter(i => i.status.toLowerCase() === status.toLowerCase());

    return sendJson(res, 200, { success: true, count: items.length, data: items });
  }

  if (pathname === '/api/content/submit' && method === 'POST') {
    const authUser = requireAuth(req, res, ['Creator', 'Admin']);
    if (!authUser) return;

    const body = await parseJsonBody(req);
    if (!body.title || !body.content) {
      return sendJson(res, 400, { success: false, message: 'Title and content are required' });
    }

    const aiAnalysis = analyzeContentText(body.content, body.channel);
    let visualCheck = null;
    if (body.colorHex) {
      visualCheck = analyzeVisualAsset(body.colorHex);
    }

    const newSub = {
      id: `sub-${Date.now()}`,
      title: body.title,
      channel: body.channel || 'General',
      creatorId: authUser.id,
      creatorName: authUser.name,
      contentType: body.contentType || 'Marketing Copy',
      originalContent: body.content,
      suggestedContent: aiAnalysis.suggestedRewrite,
      overallScore: aiAnalysis.score,
      status: aiAnalysis.score >= 85 ? 'In Review' : 'Changes Requested',
      createdAt: new Date().toISOString(),
      violations: aiAnalysis.violations,
      visualAnalysis: visualCheck,
      reviews: []
    };

    db.submissions.unshift(newSub);
    db.persist();

    return sendJson(res, 201, {
      success: true,
      message: 'Content submitted and AI analyzed successfully',
      data: newSub
    });
  }

  // ---------------- REVIEW & APPROVAL WORKFLOW ----------------

  if (pathname === '/api/reviews/queue' && method === 'GET') {
    const authUser = requireAuth(req, res, ['Reviewer', 'Admin']);
    if (!authUser) return;

    const pending = db.submissions.filter(s =>
      ['In Review', 'Changes Requested', 'Pending AI Scan'].includes(s.status)
    );
    return sendJson(res, 200, { success: true, count: pending.length, data: pending });
  }

  if (pathname.match(/^\/api\/reviews\/([^/]+)\/decision$/) && method === 'POST') {
    const authUser = requireAuth(req, res, ['Reviewer', 'Admin']);
    if (!authUser) return;

    const id = pathname.split('/')[3];
    const body = await parseJsonBody(req);
    const submission = db.submissions.find(s => s.id === id);

    if (!submission) {
      return sendJson(res, 404, { success: false, message: 'Submission not found' });
    }

    if (!['Approved', 'Changes Requested', 'Rejected'].includes(body.decision)) {
      return sendJson(res, 400, {
        success: false,
        message: 'Decision must be one of: Approved, Changes Requested, Rejected'
      });
    }

    submission.status = body.decision;
    submission.reviews.push({
      reviewerId: authUser.id,
      reviewerName: authUser.name,
      decision: body.decision,
      comment: body.comment || '',
      timestamp: new Date().toISOString()
    });
    db.persist();

    return sendJson(res, 200, {
      success: true,
      message: `Submission marked as ${body.decision}`,
      data: submission
    });
  }

  // ---------------- ANALYTICS ----------------

  if (pathname === '/api/analytics' && method === 'GET') {
    const authUser = requireAuth(req, res, ['Admin', 'Reviewer']);
    if (!authUser) return;

    const submissions = db.submissions;
    const totalSubmissions = submissions.length;
    const approvedCount = submissions.filter(s => s.status === 'Approved').length;
    const changesCount = submissions.filter(s => s.status === 'Changes Requested').length;
    const rejectedCount = submissions.filter(s => s.status === 'Rejected').length;
    const inReviewCount = submissions.filter(s => s.status === 'In Review').length;

    const totalScore = submissions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    const avgScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

    const violationCounts = {};
    submissions.forEach(s => {
      (s.violations || []).forEach(v => {
        violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
      });
    });

    return sendJson(res, 200, {
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
  }

  // Not found fallback
  return sendJson(res, 404, { success: false, message: `Route ${pathname} not found` });
});

server.listen(PORT, () => {
  console.log(`[BrandGuard AI] Platform online at http://localhost:${PORT}`);
  console.log(`[BrandGuard AI] Also accessible at http://127.0.0.1:${PORT}`);
});

export default server;
