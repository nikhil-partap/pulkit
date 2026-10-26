// Rules for creating or resetting a password. Signing in only checks for an exact match.
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES = [
  { key: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (value) => value.length >= PASSWORD_MIN_LENGTH },
  { key: 'upper', label: 'One uppercase letter (A-Z)', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter (a-z)', test: (value) => /[a-z]/.test(value) },
  { key: 'digit', label: 'One number (0-9)', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'One special character (!@#$…)', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
  { key: 'spaces', label: 'No spaces', test: (value) => !/\s/.test(value) },
];

export const PASSWORD_REQUIREMENT_MESSAGE =
  `Please enter a proper password: at least ${PASSWORD_MIN_LENGTH} characters with an uppercase letter, a lowercase letter, a number and a special character, and no spaces.`;

export function isStrongPassword(value) {
  return typeof value === 'string' && PASSWORD_RULES.every((rule) => rule.test(value));
}
