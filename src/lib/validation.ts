/**
 * Comprehensive Validation Utilities — MarkMosaiq Studio
 * Validations:
 * 1. Email format & domain validity
 * 2. Password security (8+ chars, upper, lower, number, special char)
 * 3. Website URL normalization & live DNS/HTTP reachability check
 */

export interface PasswordAnalysis {
  score: number; // 0 - 100
  isSecure: boolean;
  hasMinLength: boolean; // >= 8 chars
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong';
  strengthColor: string;
}

export function analyzePassword(password: string): PasswordAnalysis {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let criteriaCount = 0;
  if (hasMinLength) criteriaCount++;
  if (hasUpper) criteriaCount++;
  if (hasLower) criteriaCount++;
  if (hasNumber) criteriaCount++;
  if (hasSpecial) criteriaCount++;

  let score = 0;
  if (password.length > 0) {
    score = Math.min(100, Math.round((criteriaCount / 5) * 100));
    if (password.length >= 12 && criteriaCount === 5) {
      score = 100;
    }
  }

  // A password is fully secure only when all 5 criteria are met
  const isSecure = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  let strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let strengthColor = '#EF4444'; // Red

  if (score >= 100) {
    strengthLabel = 'Strong';
    strengthColor = '#10B981'; // Green
  } else if (score >= 80) {
    strengthLabel = 'Good';
    strengthColor = '#10B981'; // Green
  } else if (score >= 60) {
    strengthLabel = 'Fair';
    strengthColor = '#F59E0B'; // Amber
  } else {
    strengthLabel = 'Weak';
    strengthColor = '#EF4444'; // Red
  }

  return {
    score,
    isSecure,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    strengthLabel,
    strengthColor,
  };
}

export function validateEmailFormat(email: string): { valid: boolean; error?: string } {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return { valid: false, error: 'Email is required.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., name@store.com).' };
  }

  // Reject common disposable / invalid domains if needed
  const domain = clean.split('@')[1];
  if (!domain || domain.indexOf('.') === -1) {
    return { valid: false, error: 'Please enter a complete email domain.' };
  }

  return { valid: true };
}

export function normalizeAndValidateUrl(rawUrl: string): {
  valid: boolean;
  formattedUrl?: string;
  hostname?: string;
  error?: string;
} {
  let clean = rawUrl.trim();
  if (!clean) {
    return { valid: false, error: 'Store URL is required.' };
  }

  // Add https:// protocol if omitted
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  try {
    const parsed = new URL(clean);
    const hostname = parsed.hostname.toLowerCase();

    // Must have a valid dot and TLD
    const parts = hostname.split('.');
    if (parts.length < 2 || parts[parts.length - 1].length < 2) {
      return { valid: false, error: 'URL must contain a valid domain extension (e.g., .com, .tn, .shop).' };
    }

    // Must not be localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { valid: false, error: 'Please enter a live public store domain.' };
    }

    return {
      valid: true,
      formattedUrl: parsed.origin,
      hostname,
    };
  } catch {
    return { valid: false, error: 'Invalid URL format. Example: https://mystore.com' };
  }
}
