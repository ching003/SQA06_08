#!/usr/bin/env node

/**
 * Script để cập nhật file .env với thông tin Firebase Service Account
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const serviceAccountPath = path.join(rootDir, 'jobsconnect-dafde-firebase-adminsdk-fbsvc-d579a27e2b.json');
const envPath = path.join(rootDir, '.env');

// Đọc Service Account JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Đọc file .env hiện tại
let envContent = fs.readFileSync(envPath, 'utf-8');

// Format private key - giữ nguyên \n trong string
const privateKey = serviceAccount.private_key;

// Cập nhật các giá trị Firebase
envContent = envContent.replace(
  /FIREBASE_PROJECT_ID=.*/,
  `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`
);

envContent = envContent.replace(
  /FIREBASE_CLIENT_EMAIL=.*/,
  `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`
);

// Cập nhật private key - cần escape đúng cách
// Trong .env, cần dùng " để wrap và \\n để represent newline
const escapedPrivateKey = privateKey.replace(/\n/g, '\\n');
envContent = envContent.replace(
  /FIREBASE_PRIVATE_KEY=.*/,
  `FIREBASE_PRIVATE_KEY="${escapedPrivateKey}"`
);

// Ghi lại file .env
fs.writeFileSync(envPath, envContent, 'utf-8');

console.log('✅ Đã cập nhật file .env với thông tin Firebase Service Account:');
console.log(`   - Project ID: ${serviceAccount.project_id}`);
console.log(`   - Client Email: ${serviceAccount.client_email}`);
console.log(`   - Private Key: Đã cập nhật (${privateKey.length} ký tự)`);
console.log('\n⚠️  Lưu ý: File Service Account JSON đã được thêm vào .gitignore');

