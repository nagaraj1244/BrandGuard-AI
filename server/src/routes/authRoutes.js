import { Router } from 'express';
import { db } from '../data/db.js';
import { verifyPassword, generateJWT, generateResetToken } from '../utils/security.js';
import { getPermissionsForRole } from '../utils/roles.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

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

    return res.status(201).json({
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
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// Login with email and password
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
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

  return res.json({
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
});

// Get current authenticated user profile
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    permissions: req.user.permissions
  });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// Forgot Password - Generate reset token
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address.'
    });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    // For security, don't leak user existence in production, but provide helpful feedback
    return res.status(404).json({
      success: false,
      message: 'No registered user found with that email address.'
    });
  }

  const resetToken = generateResetToken();
  const expiresAt = Date.now() + 3600000; // 1 hour

  db.setResetToken(user.email, resetToken, expiresAt);

  console.log(`[AUTH] Password reset requested for ${user.email}. Token: ${resetToken}`);

  return res.json({
    success: true,
    message: 'Password reset instructions have been generated.',
    // Returning resetToken for immediate testing in demo/evaluation mode
    resetToken,
    expiresIn: '1 hour'
  });
});

// Reset Password with Token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.'
    });
  }

  try {
    const user = db.resetPasswordWithToken(token, newPassword);
    return res.json({
      success: true,
      message: `Password successfully updated for ${user.email}. You can now log in.`
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
