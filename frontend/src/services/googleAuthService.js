/**
 * OptiBuy Google Identity Services (GIS) Helper
 * Manages Google OAuth 2.0 Sign-In Client & Popup Prompt
 */

import { loginWithGoogle } from './authService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '55004420182-lkoeq9nh90l6b37u5b5h15bci6fet5nt.apps.googleusercontent.com';

/**
 * Trigger Google Identity Services Sign-In Prompt or Popup Client
 * @param {Function} onSuccessCallback - Callback on successful backend authentication (user, token) => void
 * @param {Function} onErrorCallback - Callback on error (error) => void
 */
export const initiateGoogleSignIn = (onSuccessCallback, onErrorCallback) => {
  if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
    if (onErrorCallback) {
      onErrorCallback(new Error('Google Sign-In SDK is loading. Please check your network connection and try again.'));
    }
    return;
  }

  try {
    // 1. Primary method: Google OAuth2 Token Client (opens official Google Popup Window)
    if (window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const data = await loginWithGoogle(null, tokenResponse.access_token);
              if (onSuccessCallback) {
                onSuccessCallback(data);
              }
            } catch (err) {
              if (onErrorCallback) {
                onErrorCallback(err);
              }
            }
          } else {
            if (onErrorCallback) {
              onErrorCallback(new Error('Google Sign-In popup was closed or cancelled.'));
            }
          }
        },
        error_callback: (err) => {
          console.warn('[Google OAuth Popup Warning]', err);
          if (onErrorCallback) {
            onErrorCallback(new Error('Google Sign-In popup was closed or blocked by browser settings.'));
          }
        }
      });

      client.requestAccessToken();
      return;
    }

    // 2. Secondary fallback: Google GIS ID Token Prompt
    if (window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response && response.credential) {
            try {
              const data = await loginWithGoogle(response.credential, null);
              if (onSuccessCallback) {
                onSuccessCallback(data);
              }
            } catch (err) {
              if (onErrorCallback) {
                onErrorCallback(err);
              }
            }
          } else {
            if (onErrorCallback) {
              onErrorCallback(new Error('Google authentication was cancelled.'));
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          if (onErrorCallback) {
            onErrorCallback(new Error('Google prompt not displayed. Please check browser pop-up permissions.'));
          }
        }
      });
    }
  } catch (err) {
    console.error('[Google GIS Error]', err);
    if (onErrorCallback) {
      onErrorCallback(err);
    }
  }
};
