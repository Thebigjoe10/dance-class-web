import { generateToken, verifyToken, JwtPayload } from '../src/utils/jwt';

describe('JWT Utilities', () => {
  const mockPayload: JwtPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'STUDENT',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = generateToken(mockPayload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });
  });
});
