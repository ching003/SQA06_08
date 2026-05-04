#!/usr/bin/env node

/**
 * Script để generate JWT Secret Key an toàn
 * 
 * Usage:
 *   node scripts/generate-jwt-secret.js
 *   node scripts/generate-jwt-secret.js --length 64
 */

import crypto from 'crypto';

// Parse command line arguments
const args = process.argv.slice(2);
const lengthArg = args.find(arg => arg.startsWith('--length='));
const length = lengthArg ? parseInt(lengthArg.split('=')[1]) : 64; // Default 64 bytes (512 bits)

// Generate random secret key
const secretKey = crypto.randomBytes(length).toString('base64');

console.log('\n========================================');
console.log('JWT Secret Key Generated:');
console.log('========================================\n');
console.log(secretKey);
console.log('\n========================================');
console.log('Copy this key to your .env file:');
console.log('========================================\n');
console.log(`JWT_SECRET=${secretKey}`);
console.log('\n⚠️  IMPORTANT: Keep this secret key secure!');
console.log('   - Never commit it to version control');
console.log('   - Use different keys for development and production');
console.log('   - Recommended length: 64 bytes (512 bits) or more\n');

