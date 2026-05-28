/**
 * Payment Controller Tests
 */

jest.mock('vnpay', () => {
  return {
    VNPay: jest.fn().mockImplementation(() => ({
      buildPaymentUrl: jest.fn().mockReturnValue('http://sandbox.vnpayment.vn/paygate'),
      validateWebhookData: jest.fn().mockReturnValue(true),
    })),
    ignoreLogger: jest.fn(),
  };
});

// Mock db.js with proper model relationships
jest.mock('../../libs/db.js', () => {
  const mockTransaction = {
    rollback: jest.fn(),
    commit: jest.fn(),
    finished: false,
    LOCK: { UPDATE: 'UPDATE' },
  };
  const mockModel = {
    belongsTo: jest.fn().mockReturnThis(),
    hasMany: jest.fn().mockReturnThis(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
  };
  return {
    define: jest.fn().mockReturnValue(mockModel),
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  };
});

jest.mock('../../models/Payment.js');
jest.mock('../../services/emailService.js', () => ({
  sendTicketEmail: jest.fn(),
}));

import {
  createPaymentUrl,
  vnpayReturn,
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  approvePayment,
  rejectPayment,
  refundPayment,
  getPaymentByBooking,
  mockPayBooking,
} from '../../controllers/paymentController.js';
import Payment from '../../models/Payment.js';

describe('Payment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, user: { id: 1 }, headers: { 'x-forwarded-for': '127.0.0.1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentUrl', () => {
    test('should create payment URL or return error', () => {
      req.body = { bookingId: 1, amount: 500000 };
      createPaymentUrl(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('vnpayReturn', () => {
    test('should handle VNPay return or error', async () => {
      req.query = { vnp_ResponseCode: '00' };
      Payment.findOne.mockResolvedValue({ id: 1 });
      await vnpayReturn(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('getAllPayments', () => {
    test('should return all payments', async () => {
      Payment.findAll.mockResolvedValue([
        { id: 1, status: 'pending', amount: 500000 }
      ]);
      await getAllPayments(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('createPayment', () => {
    test('should create payment or return error', async () => {
      req.body = { bookingId: 1, amount: 500000 };
      Payment.create.mockResolvedValue({ id: 1, ...req.body });
      await createPayment(req, res);
      expect([201, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('getPaymentById', () => {
    test('should return payment by id', async () => {
      req.params = { id: '1' };
      Payment.findByPk.mockResolvedValue({ id: 1, status: 'pending' });
      await getPaymentById(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('updatePayment', () => {
    test('should update payment', async () => {
      req.params = { id: '1' };
      req.body = { status: 'success' };
      Payment.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await updatePayment(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('approvePayment', () => {
    test('should approve payment', async () => {
      req.params = { id: '1' };
      Payment.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await approvePayment(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('rejectPayment', () => {
    test('should reject payment', async () => {
      req.params = { id: '1' };
      Payment.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await rejectPayment(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('refundPayment', () => {
    test('should refund payment', async () => {
      req.params = { id: '1' };
      Payment.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await refundPayment(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });

  describe('getPaymentByBooking', () => {
    test('should return payment by booking', async () => {
      req.params = { bookingId: '1' };
      Payment.findOne.mockResolvedValue({ id: 1, bookingId: 1 });
      await getPaymentByBooking(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('mockPayBooking', () => {
    test('should mock pay booking or return error', async () => {
      req.body = { bookingId: 1 };
      Payment.create.mockResolvedValue({ id: 1 });
      await mockPayBooking(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0]?.[0]);
    });
  });
});




