import QRCode from 'qrcode';
import { config } from '../config/env';
import crypto from 'crypto';

export const generateTicketCode = (): string => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

export const generateQRPayload = (ticketId: string, ticketCode: string): string => {
  const timestamp = Date.now();
  const data = JSON.stringify({
    ticketId,
    ticketCode,
    timestamp,
    signature: generateSignature(ticketId, ticketCode, timestamp),
  });
  return Buffer.from(data).toString('base64');
};

export const generateSignature = (
  ticketId: string,
  ticketCode: string,
  timestamp: number
): string => {
  const data = `${ticketId}:${ticketCode}:${timestamp}`;
  return crypto
    .createHmac('sha256', config.jwt.secret)
    .update(data)
    .digest('hex');
};

export const verifyQRPayload = (payload: string): {
  valid: boolean;
  ticketId?: string;
  ticketCode?: string;
  error?: string;
} => {
  try {
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);

    const { ticketId, ticketCode, timestamp, signature } = data;

    // Check if ticket is not too old (24 hours)
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (now - timestamp > maxAge) {
      return { valid: false, error: 'QR code expired' };
    }

    // Verify signature
    const expectedSignature = generateSignature(ticketId, ticketCode, timestamp);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid QR code signature' };
    }

    return { valid: true, ticketId, ticketCode };
  } catch (error) {
    return { valid: false, error: 'Invalid QR code format' };
  }
};

export const generateQRCodeImage = async (payload: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(payload, {
      width: config.ticket.qrSize,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
};
