/**
 * encryption.ts
 *
 * Token encryption utilities for Figma OAuth tokens
 * Uses AES-256-GCM for secure encryption
 *
 * Note: In production, the encryption key should be stored as a Convex
 * environment variable and never committed to code.
 */

/**
 * Encrypt a string using AES-256-GCM
 * The encrypted output format is: iv:ciphertext:authTag (all base64 encoded)
 */
export async function encryptToken(
  plaintext: string,
  keyHex: string
): Promise<string> {
  // Convert hex key to Uint8Array
  const keyBytes = hexToBytes(keyHex);

  // Import the key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate a random 12-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode plaintext to bytes
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    plaintextBytes
  );

  // The ciphertext includes the auth tag at the end (16 bytes)
  const ciphertextArray = new Uint8Array(ciphertext);

  // Encode to base64 and combine
  const ivB64 = bytesToBase64(iv);
  const ciphertextB64 = bytesToBase64(ciphertextArray);

  return `${ivB64}:${ciphertextB64}`;
}

/**
 * Decrypt a string using AES-256-GCM
 */
export async function decryptToken(
  encrypted: string,
  keyHex: string
): Promise<string> {
  // Parse the encrypted string
  const parts = encrypted.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted format');
  }

  const [ivB64, ciphertextB64] = parts;

  // Convert from base64
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ciphertextB64);

  // Convert hex key to Uint8Array
  const keyBytes = hexToBytes(keyHex);

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt (AES-GCM will verify the auth tag automatically)
  const plaintextBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    cryptoKey,
    ciphertext.buffer as ArrayBuffer
  );

  // Decode to string
  const decoder = new TextDecoder();
  return decoder.decode(plaintextBytes);
}

/**
 * Generate a random 32-byte (256-bit) encryption key as hex string
 */
export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(key);
}

/**
 * Validate that a key is a valid 32-byte hex string
 */
export function isValidEncryptionKey(keyHex: string): boolean {
  if (typeof keyHex !== 'string') return false;
  if (keyHex.length !== 64) return false;
  return /^[0-9a-fA-F]+$/.test(keyHex);
}

// ============================================================================
// Helper functions
// ============================================================================

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  // Use btoa for browser/Convex runtime compatibility
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
