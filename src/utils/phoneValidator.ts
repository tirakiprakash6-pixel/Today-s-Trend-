/**
 * Strict Indian Phone Number & Anti-Fake Validator
 * Blocks invalid mobile numbers, dummy sequences, repeating digits, and patterns.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Known common fake dummy numbers used by pranksters/bots
const KNOWN_FAKE_NUMBERS = new Set([
  '9876543210',
  '9876543211',
  '9876543212',
  '9876543213',
  '9876543214',
  '9876543215',
  '9876543216',
  '9876543217',
  '9876543218',
  '9876543219',
  '8765432109',
  '7654321098',
  '6543210987',
  '1234567890',
  '0123456789',
  '9999988888',
  '8888899999',
  '9000000000',
  '9900000000',
  '9800000000',
  '7000000000',
  '8000000000',
  '6000000000',
  '9123456789',
  '9988776655',
  '9876598765',
]);

/**
 * Validates whether a given phone number is a valid, real Indian mobile number
 * and filters out spam / fake inputs.
 */
export function validateIndianMobile(rawPhone: string): ValidationResult {
  const digits = rawPhone.replace(/\D/g, '');

  if (!digits) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // 1. Must be exactly 10 digits
  if (digits.length !== 10) {
    return {
      isValid: false,
      error: `Enter a 10-digit mobile number (${digits.length}/10 digits entered)`,
    };
  }

  // 2. Indian Telecom Rule: Mobile numbers MUST start with 6, 7, 8, or 9
  const firstDigit = digits.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      error: 'Invalid number. Indian mobile numbers must start with 6, 7, 8, or 9',
    };
  }

  // 3. Block known fake numbers blacklist
  if (KNOWN_FAKE_NUMBERS.has(digits)) {
    return {
      isValid: false,
      error: 'Dummy / test number not allowed. Please enter your real mobile number',
    };
  }

  // 4. Block all identical repeating digits (e.g., 9999999999, 8888888888, 7777777777)
  if (/^(\d)\1{9}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Fake number detected. Repeating digits are not allowed',
    };
  }

  // 5. Block numbers where 8 or more digits are identical (e.g. 9999999912, 9888888888)
  const digitCounts: Record<string, number> = {};
  for (const char of digits) {
    digitCounts[char] = (digitCounts[char] || 0) + 1;
    if (digitCounts[char] >= 8) {
      return {
        isValid: false,
        error: 'Invalid number. Contains too many repeating digits',
      };
    }
  }

  // 6. Block repetitive 2-digit patterns (e.g., 9898989898, 9191919191, 9090909090, 7878787878)
  const twoDigitPattern = digits.substring(0, 2);
  if (digits === twoDigitPattern.repeat(5)) {
    return {
      isValid: false,
      error: 'Dummy repetitive pattern (e.g. 9898989898) is not allowed',
    };
  }

  // 7. Block repetitive 3-digit patterns (e.g. 9879879879, 9009009009)
  const threeDigitPattern = digits.substring(0, 3);
  if (digits.startsWith(threeDigitPattern.repeat(3))) {
    return {
      isValid: false,
      error: 'Dummy pattern detected. Please enter your actual mobile number',
    };
  }

  // 8. Block ascending sequences (e.g., 1234567890, 2345678901)
  let isAscending = true;
  for (let i = 0; i < digits.length - 1; i++) {
    const curr = parseInt(digits[i], 10);
    const next = parseInt(digits[i + 1], 10);
    if ((curr + 1) % 10 !== next) {
      isAscending = false;
      break;
    }
  }
  if (isAscending) {
    return {
      isValid: false,
      error: 'Sequential numbers are not allowed',
    };
  }

  // 9. Block descending sequences (e.g., 9876543210, 8765432109)
  let isDescending = true;
  for (let i = 0; i < digits.length - 1; i++) {
    const curr = parseInt(digits[i], 10);
    const next = parseInt(digits[i + 1], 10);
    if ((curr - 1 + 10) % 10 !== next) {
      isDescending = false;
      break;
    }
  }
  if (isDescending) {
    return {
      isValid: false,
      error: 'Sequential numbers (e.g. 9876543210) are not allowed',
    };
  }

  return { isValid: true };
}

/**
 * Validates 6-digit Indian PIN Code
 */
export function validateIndianPincode(rawPincode: string): ValidationResult {
  const digits = rawPincode.replace(/\D/g, '');
  if (!digits) {
    return { isValid: false, error: 'Pincode is required' };
  }
  if (digits.length !== 6) {
    return { isValid: false, error: 'Pincode must be 6 digits' };
  }
  if (digits.startsWith('0')) {
    return { isValid: false, error: 'Indian pincodes cannot start with 0' };
  }
  if (/^(\d)\1{5}$/.test(digits)) {
    return { isValid: false, error: 'Invalid pincode (repeating digits)' };
  }
  return { isValid: true };
}
