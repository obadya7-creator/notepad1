/**
 * Client-side cryptographic helper
 * Computes SHA-256(username:password) using standard Web Crypto API.
 * The raw password is NEVER sent over the network.
 */
export async function deriveAuthHash(username, password) {
  const normalized = `${username.trim().toLowerCase()}:${password}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
