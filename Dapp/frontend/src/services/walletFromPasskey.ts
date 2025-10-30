/**
 * Wallet From Passkey Service
 * Generate deterministic Ethereum wallet from Passkey credential
 */

import { ethers } from 'ethers';

/**
 * Generate wallet address from Passkey credential ID
 * This matches the backend Python implementation
 * 
 * @param credentialId - The Passkey credential ID
 * @returns Ethereum address (0x...)
 */
export function generateWalletAddress(credentialId: string): string {
  // Create deterministic seed from credential ID
  const message = `aquamind_wallet_${credentialId}`;
  const hash = ethers.keccak256(ethers.toUtf8Bytes(message));
  
  // Take first 40 hex chars (20 bytes) for address
  const address = `0x${hash.slice(2, 42)}`;
  
  return address;
}

/**
 * Create ethers.js Wallet instance from credential ID
 * Note: This generates a wallet for DISPLAY purposes only
 * Real signing should be done via Passkey WebAuthn
 * 
 * @param credentialId - The Passkey credential ID
 * @returns ethers.Wallet instance
 */
export function createWalletFromPasskey(credentialId: string): ethers.Wallet {
  // Generate deterministic private key from credential ID
  const seed = ethers.keccak256(
    ethers.toUtf8Bytes(`aquamind_wallet_${credentialId}`)
  );
  
  // Create wallet from seed
  const wallet = new ethers.Wallet(seed);
  
  return wallet;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (!isValidAddress(address)) return address;
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

