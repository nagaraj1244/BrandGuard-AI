export const ROLES = {
  ADMIN: 'Admin',
  CREATOR: 'Creator',
  REVIEWER: 'Reviewer'
};

export const ROLE_PERMISSIONS = {
  Admin: [
    'manage_users',
    'manage_guidelines',
    'access_analytics',
    'manage_settings',
    'submit_content',
    'view_ai_analysis',
    'apply_ai_suggestions',
    'track_submissions',
    'review_content',
    'approve_submissions',
    'reject_submissions',
    'add_review_comments'
  ],
  Creator: [
    'submit_content',
    'view_ai_analysis',
    'apply_ai_suggestions',
    'track_submissions',
    'view_guidelines'
  ],
  Reviewer: [
    'review_content',
    'approve_submissions',
    'reject_submissions',
    'add_review_comments',
    'view_guidelines',
    'track_submissions'
  ]
};

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role, permission) {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

