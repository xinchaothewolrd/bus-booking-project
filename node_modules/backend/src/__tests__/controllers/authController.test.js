/**
 * Auth Controller Tests
 * 
 * Tests for authentication endpoints (signup, signin, etc.)
 * Adjusted to match actual implementation
 */

import { signUp } from '../../controllers/authController.js';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';

jest.mock('../../models/User.js');
jest.mock('bcrypt');

describe('Auth Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    test('should return 400 when required fields are missing', async () => {
      req.body = {
        email: 'user@example.com',
        // Missing password, phone, firstName, lastName
      };

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('đầy đủ thông tin'),
        })
      );
    });

    test('should return 409 when email already exists', async () => {
      req.body = {
        email: 'existing@example.com',
        phone: '0987654321',
        password: 'SecurePassword123',
        firstName: 'Van',
        lastName: 'Nguyen',
      };

      // Mock existing user
      User.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('đã tồn tại'),
        })
      );
    });

    test('should return 409 when phone already exists', async () => {
      req.body = {
        email: 'newuser@example.com',
        phone: '0987654321',
        password: 'SecurePassword123',
        firstName: 'Van',
        lastName: 'Nguyen',
      };

      // Mock existing user with same phone
      User.findOne.mockResolvedValue({ id: 2, phone: '0987654321' });

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('should hash password with correct salt rounds', async () => {
      req.body = {
        email: 'user@example.com',
        phone: '0912345678',
        password: 'MyPassword123',
        firstName: 'Tuan',
        lastName: 'Pham',
      };

      User.findOne.mockResolvedValue(null); // No duplicate
      bcrypt.hash.mockResolvedValue('$2b$10$hashedPassword');
      User.create.mockResolvedValue({ id: 1 });

      await signUp(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('MyPassword123', 10);
    });

    test('should create user with correct data when valid', async () => {
      req.body = {
        email: 'newuser@example.com',
        phone: '0987654321',
        password: 'SecurePassword123',
        firstName: 'Van',
        lastName: 'Nguyen',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.create.mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
        fullName: 'Nguyen Van',
      });

      await signUp(req, res);

      // Should call User.create with correct data
      expect(User.create).toHaveBeenCalled();
      const createCall = User.create.mock.calls[0][0];
      expect(createCall.email).toBe('newuser@example.com');
      expect(createCall.phone).toBe('0987654321');
      expect(createCall.role).toBe('customer');
      expect(createCall.status).toBe('active');
    });

    test('should return 204 No Content on success', async () => {
      req.body = {
        email: 'newuser@example.com',
        phone: '0987654321',
        password: 'SecurePassword123',
        firstName: 'Van',
        lastName: 'Nguyen',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ id: 1 });

      await signUp(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('should return 500 on database error', async () => {
      req.body = {
        email: 'user@example.com',
        phone: '0912345678',
        password: 'Password123',
        firstName: 'Tuan',
        lastName: 'Pham',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockRejectedValueOnce(new Error('DB Error'));

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should use fullName format: lastName firstName', async () => {
      req.body = {
        email: 'user@example.com',
        phone: '0912345678',
        password: 'Password123',
        firstName: 'Tuan',
        lastName: 'Pham',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue({ id: 1 });

      await signUp(req, res);

      const createCall = User.create.mock.calls[0][0];
      expect(createCall.fullName).toBe('Pham Tuan'); // lastName firstName
    });
  });
});




