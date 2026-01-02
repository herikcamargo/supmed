import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "692c4a3dce43b2d9bf6062b9", 
  requiresAuth: true // Ensure authentication is required for all operations
});
