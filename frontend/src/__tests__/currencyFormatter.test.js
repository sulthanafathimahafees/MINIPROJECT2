import { describe, it, expect } from 'vitest';
import { formatCurrencyINR } from '../utils/currencyFormatter';

describe('formatCurrencyINR Utility Unit Tests', () => {
  it('should return ₹0 for null, undefined, or empty values', () => {
    expect(formatCurrencyINR(null)).toBe('₹0');
    expect(formatCurrencyINR(undefined)).toBe('₹0');
    expect(formatCurrencyINR('')).toBe('₹0');
    expect(formatCurrencyINR(-500)).toBe('₹0');
  });

  it('should format direct INR prices accurately with rupee symbol and Indian locale commas', () => {
    const formatted = formatCurrencyINR(134900);
    expect(formatted).toContain('1,34,900');
    expect(formatted).toContain('₹');
  });

  it('should correctly format string price inputs', () => {
    const formatted = formatCurrencyINR('49999');
    expect(formatted).toContain('49,999');
  });
});
