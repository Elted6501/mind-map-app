// Utility to clear localStorage for migration to database-only approach

export function clearLegacyLocalStorage() {
  try {
    // Clear mind maps from localStorage
    localStorage.removeItem('mind_maps');
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('recent_searches');
    
    console.log('Legacy localStorage data cleared. App now uses database only.');
  } catch (error) {
    console.error('Failed to clear legacy localStorage:', error);
  }
}

// Auto-clear on load to ensure clean migration
if (typeof window !== 'undefined') {
  // Run once to clean up existing data
  clearLegacyLocalStorage();
}