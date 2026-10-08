/**
 * OptiBuy Authentication API Service
 * Handles Login, Registration, Google OAuth, Forgot Password, and User Token persistence with PostgreSQL Backend
 */

const AUTH_API_URL = '/api/auth';

/**
 * Safely parse HTTP response text into JSON to prevent 'Unexpected end of JSON input' errors
 */
const safeParseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text || !text.trim()) {
    return {
      success: false,
      message: `Server returned empty response (HTTP ${response.status}). Please ensure backend API server is running.`
    };
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      success: false,
      message: `Unexpected response format from server (HTTP ${response.status}).`
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - { fullName, email, phone, password }
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await safeParseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    if (data.token) {
      localStorage.setItem('optibuy_token', data.token);
      localStorage.setItem('optibuy_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('[authService] Register error:', error.message);
    throw error;
  }
};

/**
 * Login existing user
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await safeParseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    if (data.token) {
      localStorage.setItem('optibuy_token', data.token);
      localStorage.setItem('optibuy_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('[authService] Login error:', error.message);
    throw error;
  }
};

/**
 * Authenticate with Google OAuth Credential ID Token or Access Token
 * @param {string|null} credential - Verified Google ID Token
 * @param {string|null} accessToken - Verified Google OAuth2 Access Token
 */
export const loginWithGoogle = async (credential = null, accessToken = null) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential, accessToken, access_token: accessToken }),
    });

    const data = await safeParseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Google authentication failed.');
    }

    if (data.token) {
      localStorage.setItem('optibuy_token', data.token);
      localStorage.setItem('optibuy_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('[authService] Google Login error:', error.message);
    throw error;
  }
};

/**
 * Request password reset email link
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await safeParseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send password reset request.');
    }

    return data;
  } catch (error) {
    console.error('[authService] Forgot password error:', error.message);
    throw error;
  }
};

/**
 * Reset password using token
 * @param {string} token
 * @param {string} newPassword
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await safeParseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid or expired password reset link.');
    }

    return data;
  } catch (error) {
    console.error('[authService] Reset password error:', error.message);
    throw error;
  }
};

/**
 * Safely extract and check JWT expiration
 */
const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // not a standard JWT, let backend validate
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

/**
 * Normalize role string across frontend
 */
export const getNormalizedRole = (role) => {
  if (!role) return 'CUSTOMER';
  const r = role.toUpperCase().trim();
  if (r === 'SALES' || r === 'SALESPERSON' || r === 'SALES_PERSON' || r === 'SALES_EXECUTIVE' || r === 'SALES EXECUTIVE') {
    return 'SALES_PERSON';
  }
  if (r === 'ADMIN' || r === 'ADMINISTRATOR') {
    return 'ADMIN';
  }
  return 'CUSTOMER';
};

/**
 * Get current stored JWT token
 */
export const getAuthToken = () => {
  const token = localStorage.getItem('optibuy_token');
  if (!token) return null;
  if (isTokenExpired(token)) {
    logoutUser();
    return null;
  }
  return token;
};

/**
 * Get current stored user with session expiry check
 */
export const getStoredUser = () => {
  const token = localStorage.getItem('optibuy_token');
  const userStr = localStorage.getItem('optibuy_user');
  if (!token || !userStr) {
    return null;
  }

  // Check token expiration
  if (isTokenExpired(token)) {
    console.warn('[authService] JWT session expired. Logging out.');
    logoutUser();
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    return {
      ...user,
      id: user.id || user.user_id,
      user_id: user.user_id || user.id,
      role: getNormalizedRole(user.role)
    };
  } catch (e) {
    logoutUser();
    return null;
  }
};

/**
 * Check if a valid authenticated session exists
 */
export const isAuthenticated = () => {
  return Boolean(getStoredUser() && getAuthToken());
};

/**
 * Logout current user
 */
export const logoutUser = () => {
  localStorage.removeItem('optibuy_token');
  localStorage.removeItem('optibuy_user');
};
