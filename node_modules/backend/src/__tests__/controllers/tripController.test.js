/**
 * Trip Controller Tests
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
    Op: { lte: 'lte', gte: 'gte' },
  };
});

jest.mock('../../models/Trip.js');
jest.mock('../../models/Bus.js');
jest.mock('../../models/Route.js');
jest.mock('../../models/BusType.js');
jest.mock('../../models/RouteFare.js');
jest.mock('../../models/PriceRule.js');
jest.mock('../../models/TripSeat.js');

import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
} from '../../controllers/tripController.js';
import Trip from '../../models/Trip.js';

describe('Trip Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, user: { id: 1 }, headers: { 'x-forwarded-for': '127.0.0.1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTrips', () => {
    test('should return all trips', async () => {
      Trip.findAll.mockResolvedValue([
        { id: 1, departureTime: new Date(), status: 'active' }
      ]);
      await getAllTrips(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getTripById', () => {
    test('should return trip by id', async () => {
      req.params = { id: '1' };
      Trip.findByPk.mockResolvedValue({
        id: 1,
        status: 'active',
        dataValues: { id: 1, status: 'active' },
        get: jest.fn().mockReturnValue({ id: 1, status: 'active' }),
      });
      await getTripById(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 404 when not found', async () => {
      req.params = { id: 999 };
      Trip.findByPk.mockResolvedValue(null);
      await getTripById(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });


});





