import http from 'http';
import https from 'https';
import { spawn } from 'child_process';

console.log('============================================================');
console.log('      📱 BRANDGUARD AI - INSTANT MOBILE CONNECT           ');
console.log('============================================================\n');

// 1. Fetch public IP for localtunnel password bypass
function getPublicIp() {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org', (res) => {
      let ip = '';
      res.on('data', c => ip += c);
      res.on('end', () => resolve(ip.trim()));
    }).on('error', () => resolve('your computer public IP'));
  });
}

async function start() {
  console.log('[1/2] Checking local BrandGuard server on port 5000...');
  
  // Verify server is running
  const serverCheck = http.get('http://127.0.0.1:5000/api/health', (res) => {
    // Already running
  });
  serverCheck.on('error', () => {
    console.log('      Starting BrandGuard server in background...');
    spawn('node', ['server/src/index.js'], { stdio: 'inherit', detached: true });
  });

  console.log('[2/2] Generating secure mobile-accessible HTTPS link...');
  const publicIp = await getPublicIp();
  
  console.log('\n------------------------------------------------------------');
  console.log('🔑 If your phone asks for a "Tunnel Password / Endpoint IP":');
  console.log(`   👉 Enter this IP: ${publicIp}`);
  console.log('------------------------------------------------------------\n');

  // Spawn localtunnel
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const lt = spawn(npxCmd, ['-y', 'localtunnel', '--port', '5000'], { stdio: 'inherit' });

  lt.on('error', (err) => {
    console.error('Localtunnel launch error:', err);
  });
}

start();
