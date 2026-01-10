// Mock Supabase client for simplified authentication

// Check if Supabase is configured (always false in mock mode)
export const isSupabaseConfigured = false;

// Mock Supabase client
export const supabase = null;

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  return false;
}

// Helper to get current user
export async function getCurrentUser() {
  return null;
}

// Helper to get user profile from server
export async function getUserProfile(userId?: string) {
  return null;
}
