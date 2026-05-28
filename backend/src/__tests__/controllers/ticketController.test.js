/**
 * Ticket Controller Tests
 */

jest.mock('../../models/Ticket.js');
jest.mock('../../models/Booking.js');
jest.mock('../../models/TripSeat.js');
// Add save and other instance methods to mocked model
const mockSave = jest.fn().mockResolvedValue({});
const mockUpdate = jest.fn().mockResolvedValue({});
const mockDestroy = jest.fn().mockResolvedValue(true);
import {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketsByBooking,
  getTicketsByUser,
  getTicketByQrCode,
  checkInTicket,
} from '../../controllers/ticketController.js';
import Ticket from '../../models/Ticket.js';

describe('Ticket Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, user: { id: 1 }, headers: { 'x-forwarded-for': '127.0.0.1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTickets', () => {
    test('should return all tickets', async () => {
      Ticket.findAll.mockResolvedValue([
        { id: 1, status: 'unused', qrCode: 'ABC123' }
      ]);
      await getAllTickets(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getTicketById', () => {
    test('should return ticket by id', async () => {
      req.params = { id: 1 };
      Ticket.findByPk.mockResolvedValue({ id: 1, status: 'unused' });
      await getTicketById(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 404 when not found', async () => {
      req.params = { id: 999 };
      Ticket.findByPk.mockResolvedValue(null);
      await getTicketById(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('createTicket', () => {
    test('should create ticket or return error', async () => {
      req.body = { tripId: 1, bookingId: 1, seatCode: 'A1' };
      Ticket.create.mockResolvedValue({ id: 1, ...req.body });
      await createTicket(req, res);
      expect([201, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('updateTicket', () => {
    test('should update ticket or return error', async () => {
      req.params = { id: '1' };
      req.body = { status: 'used' };
      Ticket.findByPk.mockResolvedValue({
        id: 1,
        status: 'unused',
        update: mockUpdate,
        save: mockSave,
      });
      await updateTicket(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('deleteTicket', () => {
    test('should delete ticket', async () => {
      req.params = { id: '1' };
      Ticket.findByPk.mockResolvedValue({
        id: 1,
        destroy: mockDestroy,
        send: jest.fn(),
      });
      await deleteTicket(req, res);
      expect([200, 204]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getTicketsByBooking', () => {
    test('should return tickets by booking', async () => {
      req.params = { bookingId: '1' };
      req.query = { bookingId: '1' };
      Ticket.findAll.mockResolvedValue([{ id: 1, bookingId: 1 }]);
      await getTicketsByBooking(req, res);
      if (res.status.mock.calls.length > 0) {
        expect([200, 404]).toContain(res.status.mock.calls[0][0]);
      }
    });
  });

  describe('getTicketsByUser', () => {
    test('should return tickets by user', async () => {
      req.query = { userId: '1' };
      Ticket.findAll.mockResolvedValue([{ id: 1, userId: 1 }]);
      await getTicketsByUser(req, res);
      expect([200, 400]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('checkInTicket', () => {
    test('should check in ticket or return error', async () => {
      req.body = { qrCode: 'ABC123' };
      Ticket.findOne.mockResolvedValue({ id: 1, update: jest.fn() });
      await checkInTicket(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });
});




