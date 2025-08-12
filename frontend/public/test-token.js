// Test token persistence manually

// Check if we have a token
const token = localStorage.getItem('token');
console.log('Current token in localStorage:', token);

if (token) {
  // Try to decode it
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Is expired:', payload.exp < (Date.now() / 1000));
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

// Test token manager
import('./utils/tokenManager').then(({ TokenManager }) => {
  console.log('TokenManager test:');
  console.log('getToken():', TokenManager.getToken());
  console.log('isTokenValid():', TokenManager.isTokenValid());
  TokenManager.debugToken();
});
