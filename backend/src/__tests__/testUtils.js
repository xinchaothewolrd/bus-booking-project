/**
 * Test Utilities and Helpers
 * Provides common mocking functions and test helpers
 */

/**
 * Mock Express request object
 * @param {Object} options - Custom request properties
 * @returns {Object} Mock request object
 */
export const createMockRequest = (options = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    user: { id: 1 },
    ...options,
  };
};

/**
 * Mock Express response object
 * @returns {Object} Mock response object with chainable methods
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    removeHeader: jest.fn(),
    redirect: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    locals: {},
  };
  return res;
};

/**
 * Create sample user object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} User object
 */
export const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    email: 'user@example.com',
    phone: '0987654321',
    fullName: 'Nguyen Van A',
    role: 'customer',
    status: 'active',
    ...overrides,
  };
};

/**
 * Create sample booking object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Booking object
 */
export const createMockBooking = (overrides = {}) => {
  return {
    id: 1,
    userId: 1,
    tripId: 1,
    bookingCode: 'BOOK001',
    totalPrice: 500000,
    status: 'pending',
    createdAt: new Date(),
    ...overrides,
  };
};

/**
 * Create sample trip object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Trip object
 */
export const createMockTrip = (overrides = {}) => {
  return {
    id: 1,
    routeId: 1,
    busId: 1,
    departureTime: '2026-05-25 08:00:00',
    estimatedArrivalTime: '2026-05-25 16:00:00',
    status: 'active',
    totalSeats: 40,
    availableSeats: 35,
    ...overrides,
  };
};

/**
 * Create sample ticket object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Ticket object
 */
export const createMockTicket = (overrides = {}) => {
  return {
    id: 1,
    bookingId: 1,
    tripId: 1,
    seatNumber: 'A1',
    passengerName: 'Nguyen Van A',
    status: 'active',
    ...overrides,
  };
};

/**
 * Wait for async operations in tests
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Compare two objects (shallow comparison)
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if objects are equal
 */
export const objectsAreEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
};

export default {
  createMockRequest,
  createMockResponse,
  createMockUser,
  createMockBooking,
  createMockTrip,
  createMockTicket,
  wait,
  objectsAreEqual,
};
