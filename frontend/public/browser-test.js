// Browser Console Commands for Testing Token Persistence

// 1. Check current localStorage
console.log('=== LOCALSTORAGE STATUS ===');
console.log('token:', localStorage.getItem('token'));
console.log('refreshToken:', localStorage.getItem('refreshToken'));

// 2. If token exists, decode it
const token = localStorage.getItem('token');
if (token) {
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log('=== TOKEN DETAILS ===');
    console.log('User ID:', payload.sub);
    console.log('Email:', payload.email);
    console.log('Role:', payload.role);
    console.log('Issued at:', new Date(payload.iat * 1000));
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Is expired:', payload.exp < (Date.now() / 1000));
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
} else {
  console.log('❌ No token found');
}

// 3. Test login with sample credentials
console.log(`
=== TO TEST LOGIN ===
Use these credentials on the login form:
Email: riddhi@gmail.com
Password: password123

After login, refresh the page and run this script again to check if token persists.
`);

// 4. Test manual token storage
console.log(`
=== TO MANUALLY TEST TOKEN STORAGE ===
Run: 
localStorage.setItem('token', 'test-token');
localStorage.setItem('refreshToken', 'test-refresh');
console.log('Token stored:', localStorage.getItem('token'));
`);
