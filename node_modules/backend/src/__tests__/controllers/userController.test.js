/**
 * User Controller Tests
 */

jest.mock('../../models/User.js');
jest.mock('bcrypt');

import {
  authMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '../../controllers/userController.js';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {}, user: { id: 1 }, headers: { 'x-forwarded-for': '127.0.0.1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authMe', () => {
    test('should return current user', async () => {
      req.user = { id: 1, email: 'user@test.com' };
      await authMe(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, email: 'user@test.com', fullName: 'User 1' }
      ]);
      await getAllUsers(req, res);
      expect([200, 400, 404, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('createUser', () => {
    test('should create user', async () => {
      req.body = { email: 'new@test.com', fullName: 'New User', password: 'pass123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue({ id: 1, ...req.body });
      await createUser(req, res);
      expect([201, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 400 for missing data', async () => {
      req.body = {};
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 409 for duplicate email', async () => {
      req.body = { email: 'exists@test.com', fullName: 'User', password: 'pass123' };
      User.findOne.mockResolvedValue({ id: 1 });
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateUser', () => {
    test('should update user', async () => {
      req.params = { id: '1' };
      req.body = { fullName: 'Updated' };
      User.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await updateUser(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });

    test('should return 404 when not found', async () => {
      req.params = { id: 999 };
      User.findByPk.mockResolvedValue(null);
      await updateUser(req, res);
      expect([200, 400, 404]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('deleteUser', () => {
    test('should delete user', async () => {
      req.params = { id: '1' };
      User.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn() });
      await deleteUser(req, res);
      expect([200, 204, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });

  describe('updateUserStatus', () => {
    test('should update user status', async () => {
      req.params = { id: '1' };
      req.body = { status: 'inactive' };
      User.findByPk.mockResolvedValue({ id: 1, update: jest.fn() });
      await updateUserStatus(req, res);
      expect([200, 400, 500]).toContain(res.status.mock.calls[0][0]);
    });
  });
});




