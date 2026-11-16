import { hashPassword, verifyPassword, generateJWT, verifyJWT } from '../src/utils/security.js';
import { db } from '../src/data/db.js';
import { getPermissionsForRole } from '../src/utils/roles.js';

console.log('====================================================');
console.log('       BRANDGUARD AI - AUTHENTICATION SUITE         ');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

// ---------------- 1. Password Hashing & Verification ----------------
console.log('--- 1. Testing Cryptographic Password Hashing (scrypt + salt) ---');
const plainPass = 'SecureP@ssword2026!';
const { salt, hash } = hashPassword(plainPass);

assert(salt && salt.length === 32, 'Salt generated with 16 random bytes (32 hex chars)');
assert(hash && hash.length === 128, 'Password hashed to 64 bytes (128 hex chars)');
assert(hash !== plainPass, 'Password is NEVER stored in plaintext');
assert(verifyPassword(plainPass, salt, hash) === true, 'verifyPassword returns true for correct password');
assert(verifyPassword('WrongPassword123!', salt, hash) === false, 'verifyPassword returns false for incorrect password');

// ---------------- 2. JWT Generation & Signature Verification ----------------
console.log('\n--- 2. Testing JWT Signing & RFC 7519 Verification ---');
const testPayload = { id: 'test-u1', email: 'tester@brandguard.ai', role: 'Creator' };
const token = generateJWT(testPayload, 3600);

assert(typeof token === 'string' && token.split('.').length === 3, 'Token conforms to header.payload.signature format');

const decoded = verifyJWT(token);
assert(decoded.id === testPayload.id && decoded.role === testPayload.role, 'Decoded JWT preserves payload integrity');
assert(decoded.exp > decoded.iat, 'JWT includes valid expiration timestamp');

// Test tampering detection
let tampered = false;
try {
  const parts = token.split('.');
  const forgedToken = `${parts[0]}.${parts[1]}.invalidsignature`;
  verifyJWT(forgedToken);
} catch (e) {
  tampered = true;
}
assert(tampered === true, 'Tampered token signature is rejected with error');

// ---------------- 3. User Registration Flow ----------------
console.log('\n--- 3. Testing User Registration & Persistence ---');
const uniqueEmail = `creator_${Date.now()}@inkloom.ai`;
const registeredUser = db.createUser({
  name: 'Sam Designer',
  email: uniqueEmail,
  password: 'StrongPassword@123',
  role: 'Creator'
});

assert(registeredUser.id && registeredUser.email === uniqueEmail, 'User registered successfully with unique ID');
assert(registeredUser.passwordHash !== 'StrongPassword@123', 'Saved user record has secure hash instead of plaintext');

// Verify duplicate email is rejected
let duplicateCaught = false;
try {
  db.createUser({
    name: 'Duplicate Sam',
    email: uniqueEmail,
    password: 'AnotherPassword@123',
    role: 'Creator'
  });
} catch (err) {
  duplicateCaught = true;
}
assert(duplicateCaught === true, 'Registration with duplicate email address is blocked');

// ---------------- 4. Login Flow with Hashed Credentials ----------------
console.log('\n--- 4. Testing User Login Verification ---');
const fetchedUser = db.findUserByEmail(uniqueEmail);
const validLogin = verifyPassword('StrongPassword@123', fetchedUser.salt, fetchedUser.passwordHash);
const invalidLogin = verifyPassword('WrongSecretPassword!', fetchedUser.salt, fetchedUser.passwordHash);

assert(validLogin === true, 'User authenticated with correct password');
assert(invalidLogin === false, 'Authentication failed with incorrect password');

// ---------------- 5. Forgot Password & Reset Token Flow ----------------
console.log('\n--- 5. Testing Forgot Password & Reset Token Flow ---');
const resetToken = 'test-reset-token-' + Date.now();
const expiresAt = Date.now() + 3600000;
db.setResetToken(uniqueEmail, resetToken, expiresAt);

const userByToken = db.findUserByResetToken(resetToken);
assert(userByToken && userByToken.email === uniqueEmail, 'Reset token looked up successfully and matches user');

const newPass = 'BrandNewP@ssword2026!';
db.resetPasswordWithToken(resetToken, newPass);

const afterResetUser = db.findUserByEmail(uniqueEmail);
assert(verifyPassword(newPass, afterResetUser.salt, afterResetUser.passwordHash) === true, 'New password active after reset');
assert(verifyPassword('StrongPassword@123', afterResetUser.salt, afterResetUser.passwordHash) === false, 'Old password no longer valid');
assert(afterResetUser.resetPasswordToken === undefined, 'Reset token consumed and cleared after use');

// ---------------- 6. Role-Based Access Control (RBAC) ----------------
console.log('\n--- 6. Testing Role-Based Access Control (Admin, Creator, Reviewer) ---');
const adminPerms = getPermissionsForRole('Admin');
const creatorPerms = getPermissionsForRole('Creator');
const reviewerPerms = getPermissionsForRole('Reviewer');

assert(adminPerms.includes('manage_users') && adminPerms.includes('manage_guidelines'), 'Admin has user & guidelines management');
assert(!creatorPerms.includes('manage_users') && creatorPerms.includes('submit_content'), 'Creator cannot manage users but can submit content');
assert(!reviewerPerms.includes('manage_users') && reviewerPerms.includes('approve_submissions'), 'Reviewer cannot manage users but can approve submissions');

// ---------------- 7. Admin User Management CRUD ----------------
console.log('\n--- 7. Testing Admin User Management (Role Change & Deletion) ---');
// Promote registered user to Reviewer
db.updateUserRole(registeredUser.id, 'Reviewer');
const updatedUser = db.findUserById(registeredUser.id);
assert(updatedUser.role === 'Reviewer', 'Admin successfully changed user role to Reviewer');

// Delete registered test user
const deletedUser = db.deleteUser(registeredUser.id);
assert(deletedUser.id === registeredUser.id, 'Admin successfully deleted user');
assert(db.findUserById(registeredUser.id) === undefined, 'Deleted user is purged from database');

// ---------------- Summary ----------------
console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('[SUCCESS] All Authentication & User Management flows verified!');
  process.exit(0);
}

