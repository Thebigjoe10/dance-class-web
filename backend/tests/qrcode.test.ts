import {
  generateTicketCode,
  generateQRPayload,
  verifyQRPayload,
  generateSignature,
} from '../src/utils/qrcode';

describe('QR Code Utilities', () => {
  describe('generateTicketCode', () => {
    it('should generate a 12-character uppercase hex code', () => {
      const code = generateTicketCode();
      expect(code).toHaveLength(12);
      expect(code).toMatch(/^[A-F0-9]{12}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateTicketCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('QR Payload Generation and Verification', () => {
    it('should generate and verify valid QR payload', () => {
      const ticketId = 'test-ticket-123';
      const ticketCode = 'ABC123DEF456';

      const payload = generateQRPayload(ticketId, ticketCode);
      const verification = verifyQRPayload(payload);

      expect(verification.valid).toBe(true);
      expect(verification.ticketId).toBe(ticketId);
      expect(verification.ticketCode).toBe(ticketCode);
    });

    it('should reject invalid payload format', () => {
      const verification = verifyQRPayload('invalid-payload');

      expect(verification.valid).toBe(false);
      expect(verification.error).toBeDefined();
    });

    it('should reject tampered payload', () => {
      const ticketId = 'test-ticket-123';
      const ticketCode = 'ABC123DEF456';

      const payload = generateQRPayload(ticketId, ticketCode);
      const tamperedPayload = payload.slice(0, -5) + 'XXXXX';

      const verification = verifyQRPayload(tamperedPayload);

      expect(verification.valid).toBe(false);
    });

    it('should reject expired payload', () => {
      const ticketId = 'test-ticket-123';
      const ticketCode = 'ABC123DEF456';
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

      const signature = generateSignature(ticketId, ticketCode, oldTimestamp);
      const data = JSON.stringify({
        ticketId,
        ticketCode,
        timestamp: oldTimestamp,
        signature,
      });
      const payload = Buffer.from(data).toString('base64');

      const verification = verifyQRPayload(payload);

      expect(verification.valid).toBe(false);
      expect(verification.error).toContain('expired');
    });
  });

  describe('generateSignature', () => {
    it('should generate consistent signatures for same input', () => {
      const ticketId = 'test-ticket';
      const ticketCode = 'ABC123';
      const timestamp = Date.now();

      const sig1 = generateSignature(ticketId, ticketCode, timestamp);
      const sig2 = generateSignature(ticketId, ticketCode, timestamp);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different inputs', () => {
      const timestamp = Date.now();

      const sig1 = generateSignature('ticket1', 'CODE1', timestamp);
      const sig2 = generateSignature('ticket2', 'CODE2', timestamp);

      expect(sig1).not.toBe(sig2);
    });
  });
});
