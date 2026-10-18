import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getNormalizedRole, 
  getStoredUser, 
  getAuthToken, 
  isAuthenticated, 
  logoutUser 
} from '../services/authService';

describe('Frontend authService & Session Management Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should normalize roles correctly across aliases', () => {
    expect(getNormalizedRole('CUSTOMER')).toBe('CUSTOMER');
    expect(getNormalizedRole('customer')).toBe('CUSTOMER');
    expect(getNormalizedRole('')).toBe('CUSTOMER');
    expect(getNormalizedRole(null)).toBe('CUSTOMER');

    expect(getNormalizedRole('SALES_EXECUTIVE')).toBe('SALES_PERSON');
    expect(getNormalizedRole('SALES EXECUTIVE')).toBe('SALES_PERSON');
    expect(getNormalizedRole('sales_executive')).toBe('SALES_PERSON');
    expect(getNormalizedRole('SALES_PERSON')).toBe('SALES_PERSON');
    expect(getNormalizedRole('salesperson')).toBe('SALES_PERSON');
    expect(getNormalizedRole('SALES')).toBe('SALES_PERSON');

    expect(getNormalizedRole('ADMIN')).toBe('ADMIN');
    expect(getNormalizedRole('admin')).toBe('ADMIN');
    expect(getNormalizedRole('ADMINISTRATOR')).toBe('ADMIN');
  });

  it('should return null when no token or user is stored', () => {
    expect(getStoredUser()).toBeNull();
    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('should return stored user with normalized role when valid session exists', () => {
    // Generate valid mock JWT expiring in 1 hour
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ userId: 12, role: 'SALES_EXECUTIVE', exp: futureExp }));
    const mockJwt = `${header}.${payload}.signature`;

    localStorage.setItem('optibuy_token', mockJwt);
    localStorage.setItem('optibuy_user', JSON.stringify({
      user_id: 12,
      fullName: 'Neeva Mathew',
      email: 'neeva@gmail.com',
      role: 'SALES_EXECUTIVE'
    }));

    const user = getStoredUser();
    expect(user).not.toBeNull();
    expect(user.user_id).toBe(12);
    expect(user.role).toBe('SALES_PERSON');
    expect(isAuthenticated()).toBe(true);
  });

  it('should automatically clear session and return null if token is expired', () => {
    // Generate expired mock JWT
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ userId: 12, exp: pastExp }));
    const expiredJwt = `${header}.${payload}.signature`;

    localStorage.setItem('optibuy_token', expiredJwt);
    localStorage.setItem('optibuy_user', JSON.stringify({
      user_id: 12,
      fullName: 'Expired User',
      email: 'expired@gmail.com',
      role: 'CUSTOMER'
    }));

    const user = getStoredUser();
    expect(user).toBeNull();
    expect(localStorage.getItem('optibuy_token')).toBeNull();
    expect(localStorage.getItem('optibuy_user')).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('should properly clear session on logoutUser()', () => {
    localStorage.setItem('optibuy_token', 'sample_token');
    localStorage.setItem('optibuy_user', JSON.stringify({ email: 'test@optibuy.com' }));

    logoutUser();

    expect(localStorage.getItem('optibuy_token')).toBeNull();
    expect(localStorage.getItem('optibuy_user')).toBeNull();
  });
});
