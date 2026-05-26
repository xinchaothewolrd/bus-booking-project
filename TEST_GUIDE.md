# 🧪 Unit Testing Guide - Bus Booking Project

## 📋 Nội dung
- [Backend Testing](#backend-testing-jest)
- [Frontend Testing](#frontend-testing-vitest)
- [Chạy Tests](#chạy-tests)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

---

## 🔧 Backend Testing (Jest)

### Cấu trúc Test

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── services/
│   │   │   └── emailService.test.js
│   │   ├── controllers/
│   │   │   ├── authController.test.js
│   │   │   └── bookingController.test.js
│   │   ├── routes/
│   │   │   └── authRoute.test.js
│   │   ├── testUtils.js         # Helper functions
│   │   └── setup.js             # Global test setup
│   └── ...
├── jest.config.js               # Jest configuration
└── package.json
```

### Test Examples

#### 1. **Service Tests** (emailService.test.js)
```javascript
// Testing email sending with mocked nodemailer
describe('sendTicketEmail', () => {
  it('should send email successfully', async () => {
    const ticketData = { toEmail, passengerName, bookingCode, ... };
    await sendTicketEmail(ticketData);
    expect(mockSendMail).toHaveBeenCalled();
  });
});
```

#### 2. **Controller Tests** (authController.test.js)
```javascript
// Testing signup and login with mocked models
describe('signUp', () => {
  it('should create user with valid data', async () => {
    User.findOne.mockResolvedValue(null);
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

#### 3. **Controller Tests** (bookingController.test.js)
```javascript
// Testing booking operations
describe('createBooking', () => {
  it('should create booking with tickets', async () => {
    Booking.create.mockResolvedValue(mockBooking);
    await createBooking(req, res);
    expect(Booking.create).toHaveBeenCalled();
  });
});
```

#### 4. **Route/API Tests** (authRoute.test.js)
```javascript
// Testing HTTP endpoints with supertest
describe('POST /api/auth/signup', () => {
  it('should return 201 on successful signup', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData);
    expect(response.status).toBe(201);
  });
});
```

### Test Utils

Helper functions trong `testUtils.js`:
```javascript
// Create mock objects
createMockRequest()      // Mock Express request
createMockResponse()     // Mock Express response
createMockUser()         // Mock user object
createMockBooking()      // Mock booking
createMockTrip()         // Mock trip
createMockTicket()       // Mock ticket
```

---

## ⚛️ Frontend Testing (Vitest)

### Cấu trúc Test

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── components/
│   │   │   └── components.test.jsx
│   │   ├── services/
│   │   │   └── api.test.js
│   │   └── setup.js             # Setup file
│   └── ...
├── vitest.config.js             # Vitest configuration
└── package.json
```

### Test Examples

#### 1. **Component Tests**
```javascript
// Button Component
it('should call onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

// Form Component
it('should submit with correct data', async () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);
  await user.type(screen.getByTestId('email-input'), 'user@example.com');
  await user.click(screen.getByRole('button'));
  expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
    email: 'user@example.com'
  }));
});

// Modal Component
it('should not render when closed', () => {
  render(<Modal isOpen={false} />);
  expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
});

// List Component
it('should render items', () => {
  const items = [{ id: 1, name: 'Item 1' }];
  render(<ItemList items={items} />);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
});
```

#### 2. **Service/API Tests**
```javascript
// API call testing with mocked axios
describe('Booking Service', () => {
  it('should fetch bookings', async () => {
    axios.get.mockResolvedValue({ data: mockBookings });
    const response = await axios.get('/api/bookings');
    expect(response.data).toEqual(mockBookings);
  });
});
```

---

## ▶️ Chạy Tests

### Backend

```bash
# Chạy tất cả tests
npm test

# Chạy tests ở watch mode (tự reload)
npm run test:watch

# Chạy tests với coverage report
npm run test:coverage

# Chạy test cụ thể
npm test -- authController.test.js

# Chạy tests trong folder cụ thể
npm test -- src/__tests__/controllers
```

### Frontend

```bash
# Chạy tất cả tests
npm test

# Chạy tests ở UI mode (hiển thị trên browser)
npm run test:ui

# Chạy tests với coverage report
npm run test:coverage

# Chạy test cụ thể
npm test -- components.test.jsx

# Chạy tests ở watch mode
npm test -- --watch
```

---

## 📊 Coverage Reports

### Backend

```bash
npm run test:coverage
```

Output: `coverage/` folder
- `index.html` - Interactive HTML report
- `coverage-final.json` - JSON data

**Expected Coverage:**
- Services: 80-90%
- Controllers: 70-80%
- Routes: 60-70%

### Frontend

```bash
npm run test:coverage
```

Output: `coverage/` folder
- `index.html` - Interactive HTML report
- Xem coverage của components, services

---

## 💡 Best Practices

### 1. **Test Structure**
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup trước mỗi test
    jest.clearAllMocks();
  });

  it('should do something specific', () => {
    // Arrange - Setup dữ liệu
    const input = { ... };

    // Act - Chạy code cần test
    const result = myFunction(input);

    // Assert - Check kết quả
    expect(result).toBe(expected);
  });
});
```

### 2. **Mocking**

**Mock Functions:**
```javascript
const mockFn = jest.fn();
mockFn.mockReturnValue(value);
mockFn.mockResolvedValue(promise);
mockFn.mockRejectedValue(error);
```

**Mock Modules:**
```javascript
jest.mock('../../models/User.js');
User.findOne.mockResolvedValue(mockUser);
```

### 3. **Assertions**

```javascript
// Equality
expect(value).toBe(expected);
expect(object).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(count).toBeGreaterThan(0);
expect(count).toBeLessThan(10);

// Strings
expect(text).toMatch(/pattern/);
expect(text).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('name');
expect(obj).toEqual(expect.objectContaining({ name: 'John' }));

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(2);
```

### 4. **Component Testing Tips**

```javascript
// Use data-testid cho selectors
<button data-testid="submit-btn">Submit</button>

// Screen queries (prefer these)
screen.getByRole('button', { name: /submit/i })
screen.getByTestId('submit-btn')
screen.getByText('Submit')

// User interactions
await user.click(element);
await user.type(input, 'text');
await user.selectOptions(select, 'value');

// Async operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

### 5. **Test Naming**

```javascript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should return 201 status when creating user with valid data', () => { ... });
it('should display error message when email already exists', () => { ... });
```

---

## 📝 Thêm Tests Mới

### Backend Service Test

```javascript
// src/__tests__/services/myService.test.js
import { myFunction } from '../../services/myService.js';

describe('myService', () => {
  it('should work correctly', () => {
    const result = myFunction(input);
    expect(result).toEqual(expected);
  });
});
```

### Frontend Component Test

```javascript
// src/__tests__/components/MyComponent.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent.jsx';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 🔍 Debugging Tests

### Backend (Jest)

```bash
# Run single test file
npm test -- authController.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Debug mode
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Frontend (Vitest)

```bash
# UI mode để debug
npm run test:ui

# Watch mode
npm test -- --watch

# Debug specific file
npm test -- components.test.jsx --watch
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)

---

## ✅ Checklist trước khi commit

- [ ] Tất cả tests pass locally
- [ ] Coverage >= 70%
- [ ] Không có console errors/warnings
- [ ] Các mocks được cleanup
- [ ] Test names clear và descriptive
- [ ] No hardcoded test data (use fixtures)

---

**Happy Testing! 🚀**
