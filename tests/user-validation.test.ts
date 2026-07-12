import { validateUser } from '@/lib/user';
import type { UserInput } from '@/lib/user';

// A base valid user — tests override individual fields
const validUser = (): UserInput => ({
  firstname: 'Jean',
  lastname: 'Dupont',
  email: 'jean.dupont@example.com',
  birthdate: '2000-01-01', // ~26 ans
  password: 'Passw0rd',
});

describe('validateUser', () => {
  describe('valid user', () => {
    it('should return valid for a correct user', () => {
      const result = validateUser(validUser());
      expect(result.valid).toBe(true);
    });
  });

  // ─── firstname ─────────────────────────────────────────────────────────────
  describe('firstname', () => {
    it('should fail when firstname is empty', () => {
      const result = validateUser({ ...validUser(), firstname: '' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'firstname')).toBe(true);
      }
    });

    it('should fail when firstname is only whitespace', () => {
      const result = validateUser({ ...validUser(), firstname: '   ' });
      expect(result.valid).toBe(false);
    });
  });

  // ─── lastname ──────────────────────────────────────────────────────────────
  describe('lastname', () => {
    it('should fail when lastname is empty', () => {
      const result = validateUser({ ...validUser(), lastname: '' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'lastname')).toBe(true);
      }
    });

    it('should fail when lastname is only whitespace', () => {
      const result = validateUser({ ...validUser(), lastname: '   ' });
      expect(result.valid).toBe(false);
    });
  });

  // ─── email ─────────────────────────────────────────────────────────────────
  describe('email', () => {
    it('should fail when email is empty', () => {
      const result = validateUser({ ...validUser(), email: '' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'email')).toBe(true);
      }
    });

    it('should fail when email has no @', () => {
      const result = validateUser({ ...validUser(), email: 'notanemail' });
      expect(result.valid).toBe(false);
    });

    it('should fail when email has no domain', () => {
      const result = validateUser({ ...validUser(), email: 'user@' });
      expect(result.valid).toBe(false);
    });

    it('should pass with a valid email', () => {
      const result = validateUser({ ...validUser(), email: 'user@domain.org' });
      expect(result.valid).toBe(true);
    });
  });

  // ─── password ──────────────────────────────────────────────────────────────
  describe('password', () => {
    it('should fail when password is too short (< 8)', () => {
      const result = validateUser({ ...validUser(), password: 'Abc1' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'password')).toBe(true);
      }
    });

    it('should fail when password is too long (> 40)', () => {
      const result = validateUser({ ...validUser(), password: 'Abcde1' + 'x'.repeat(35) });
      expect(result.valid).toBe(false);
    });

    it('should fail when password has no uppercase letter', () => {
      const result = validateUser({ ...validUser(), password: 'passw0rd' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'password')).toBe(true);
      }
    });

    it('should fail when password has no lowercase letter', () => {
      const result = validateUser({ ...validUser(), password: 'PASSW0RD' });
      expect(result.valid).toBe(false);
    });

    it('should fail when password has no digit', () => {
      const result = validateUser({ ...validUser(), password: 'Password' });
      expect(result.valid).toBe(false);
    });

    it('should pass with exactly 8 characters including upper, lower, digit', () => {
      const result = validateUser({ ...validUser(), password: 'Passw0rd' });
      expect(result.valid).toBe(true);
    });

    it('should pass with exactly 40 characters', () => {
      const result = validateUser({ ...validUser(), password: 'Aa1' + 'x'.repeat(37) });
      expect(result.valid).toBe(true);
    });
  });

  // ─── age ───────────────────────────────────────────────────────────────────
  describe('birthdate / age', () => {
    it('should fail when birthdate is missing', () => {
      const result = validateUser({ ...validUser(), birthdate: '' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'birthdate')).toBe(true);
      }
    });

    it('should fail when user is under 13 years old', () => {
      const today = new Date();
      const underAge = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
      const result = validateUser({
        ...validUser(),
        birthdate: underAge.toISOString().split('T')[0],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === 'birthdate')).toBe(true);
      }
    });

    it('should pass when user is exactly 13 years old today', () => {
      const today = new Date();
      const exactly13 = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      const result = validateUser({
        ...validUser(),
        birthdate: exactly13.toISOString().split('T')[0],
      });
      expect(result.valid).toBe(true);
    });

    it('should pass when user is 18 years old', () => {
      const result = validateUser({ ...validUser(), birthdate: '2005-06-15' });
      expect(result.valid).toBe(true);
    });
  });

  // ─── multiple errors ────────────────────────────────────────────────────────
  describe('multiple errors', () => {
    it('should return all errors at once', () => {
      const result = validateUser({
        firstname: '',
        lastname: '',
        email: 'bad-email',
        birthdate: '2020-01-01', // too young
        password: 'weak',
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        const fields = result.errors.map((e) => e.field);
        expect(fields).toContain('firstname');
        expect(fields).toContain('lastname');
        expect(fields).toContain('email');
        expect(fields).toContain('password');
        expect(fields).toContain('birthdate');
      }
    });
  });
});
