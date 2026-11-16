import { Router } from 'express';
import { db } from '../data/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Apply authentication & Admin authorization to all user management routes
router.use(authenticateToken);
router.use(authorizeRoles('Admin'));

// List all registered users
router.get('/', (req, res) => {
  const users = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// Get user statistics
router.get('/stats', (req, res) => {
  const users = db.users;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const creatorCount = users.filter(u => u.role === 'Creator').length;
  const reviewerCount = users.filter(u => u.role === 'Reviewer').length;

  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      adminCount,
      creatorCount,
      reviewerCount
    }
  });
});

// Update a user's role
router.put('/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['Admin', 'Creator', 'Reviewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`
    });
  }

  // Prevent admin from demoting themselves if they are the only admin
  if (req.user.id === id && role !== 'Admin') {
    const adminCount = db.users.filter(u => u.role === 'Admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote the only remaining Admin account.'
      });
    }
  }

  try {
    const updated = db.updateUserRole(id, role);
    res.json({
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
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
});

// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own logged-in Admin account.'
    });
  }

  try {
    const deleted = db.deleteUser(id);
    res.json({
      success: true,
      message: `User ${deleted.name} (${deleted.email}) deleted successfully.`
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
});

// Company Settings (Admin only)
router.get('/settings/company', (req, res) => {
  res.json({
    success: true,
    data: db.companySettings
  });
});

router.put('/settings/company', (req, res) => {
  const updates = req.body;
  db.companySettings = {
    ...db.companySettings,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Company settings updated successfully.',
    data: db.companySettings
  });
});

export default router;

