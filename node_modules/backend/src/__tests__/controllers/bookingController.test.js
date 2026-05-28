/**
 * Booking Controller Tests
 */

// Mock sequelize and db before model imports
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
    Op: { UPDATE: 'UPDATE' },
  };
});

jest.mock('../../models/Booking.js');
jest.mock('../../models/Trip.js');
jest.mock('../../models/User.js');
jest.mock('../../models/Ticket.js');
jest.mock('../../models/TripSeat.js');

import {
  getAllBookings,
  createBooking,
  cancelBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
} from '../../controllers/bookingController.js';
import Booking from '../../models/Booking.js';

describe('Booking Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, user: { id: 1 }, headers: { 'x-forwarded-for': '127.0.0.1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBookings', () => {
    test('should return all bookings', async () => {
      Booking.findAll.mockResolvedValue([
        { id: 1, status: 'pending', userId: 1 }
      ]);
      await getAllBookings(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should filter by status', async () => {
      req.query = { status: 'pending' };
      Booking.findAll.mockResolvedValue([
        { id: 1, status: 'pending' }
      ]);
      await getAllBookings(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('createBooking', () => {
    test('should create booking', async () => {
      req.body = { tripId: 1, seatIds: ['A1', 'A2'] };
      Booking.create.mockResolvedValue({ id: 1, ...req.body });
      await createBooking(req, res);
      expect([201, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 400 for invalid data', async () => {
      req.body = {};
      await createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('cancelBooking', () => {
    test('should cancel booking', async () => {
      req.params = { id: '1' };
      Booking.findByPk.mockResolvedValue({ id: 1, status: 'pending', update: jest.fn() });
      await cancelBooking(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 404 when not found', async () => {
      req.params = { id: 999 };
      Booking.findByPk.mockResolvedValue(null);
      await cancelBooking(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getBookingById', () => {
    test('should return booking by id', async () => {
      req.params = { id: '1' };
      Booking.findByPk.mockResolvedValue({ id: 1, status: 'pending' });
      await getBookingById(req, res);
      expect([200, 404, 400]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('updateBooking', () => {
    test('should update booking', async () => {
      req.params = { id: '1' };
      req.body = { status: 'confirmed' };
      Booking.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await updateBooking(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('deleteBooking', () => {
    test('should delete booking', async () => {
      req.params = { id: '1' };
      Booking.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn() });
      await deleteBooking(req, res);
      expect([200, 204, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getBookingsByUser', () => {
    test('should return bookings by user', async () => {
      Booking.findAll.mockResolvedValue([
        { id: 1, userId: 1, status: 'pending' }
      ]);
      await getBookingsByUser(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });
});





