// Mirrors passwordValidationSchema in the backend (user.validation.ts).
// Keep both in sync: the backend is the real check, this is for instant feedback.
// The on-screen text lives in messages/<locale>/common.json (PasswordRules),
// so if this number changes, update "minLength" there too (8 in en, ৮ in bn).
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES = [
  { key: "minLength", test: (value: string) => value.length >= PASSWORD_MIN_LENGTH },
  { key: "uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { key: "lowercase", test: (value: string) => /[a-z]/.test(value) },
  { key: "number", test: (value: string) => /\d/.test(value) },
  { key: "special", test: (value: string) => /[@$!%*?&]/.test(value) },
] as const;

export const meetsPasswordRules = (value: string) => PASSWORD_RULES.every((rule) => rule.test(value));
