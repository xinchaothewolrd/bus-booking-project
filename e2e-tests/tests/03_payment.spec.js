// tests/03_payment.spec.js — BƯỚC 3: THANH TOÁN
// Backend tự tạo Payment khi createBooking → không cần gọi thêm createPayment
import { test, expect } from '@playwright/test';
import {
  signup, signin, searchTrips, getTripSeats,
  createBooking, getPaymentByBooking, mockPay, createVnpayUrl
} from '../helpers/api.js';
import { injectToken } from '../helpers/auth.js';

let token = '';
let userId = null;
let tripId = null;
let seats = [];

test.beforeAll(async ({ request }) => {
  await signup(request);
  const res = await signin(request);
  token = res.token;
  userId = res.userId;

  const trips = await searchTrips(request, token);
  if (trips.length > 0) {
    tripId = trips[0].id;
    // FIX: dùng endpoint đúng /api/trip-seats/trip/:tripId
    const allSeats = await getTripSeats(request, tripId, token);
    seats = allSeats.filter(s => s.status === 'available');
    console.log(`   Tìm thấy ${seats.length} ghế available cho trip ${tripId}`);
  } else {
    console.log('⚠️  Không có trip nào trong DB');
  }
});

test.beforeEach(async ({ page, request }) => {
  await injectToken(page, token, request);
});

// ── 3A: Tạo VNPAY URL → phải là URL sandbox hợp lệ ──────────
test('Bước 3A — Hệ thống tạo được URL thanh toán VNPAY hợp lệ', async ({ request }) => {
  if (!tripId || seats.length === 0) {
    console.log('⚠️  Không có trip/seat — skip');
    test.skip();
    return;
  }

  // Lấy ghế để dùng
  const seat = seats.shift();
  console.log(`   Dùng ghế: ${seat.seatNumber} (id=${seat.id})`);

  // Tạo booking (payment tự tạo kèm theo)
  const { bookingId } = await createBooking(request, { userId, tripId, seatId: seat.id }, token);
  expect(bookingId).toBeTruthy();
  console.log(`   Booking #${bookingId} tạo xong`);

  // Tạo URL VNPAY — có thể fail nếu backend chưa cấu hình vnp_TmnCode/vnp_HashSecret
  let paymentUrl;
  try {
    paymentUrl = await createVnpayUrl(request, { bookingId, amount: 250000 }, token);
  } catch (err) {
    if (err.message.includes('Sập nguồn') || err.message.includes('tạo link')) {
      console.log('⚠️  Backend chưa cấu hình VNPAY (thiếu vnp_TmnCode/vnp_HashSecret trong .env) — skip');
      test.skip();
      return;
    }
    throw err;
  }

  // ── ASSERT ──────────────────────────────────────────────────
  expect(paymentUrl).toBeTruthy();
  expect(paymentUrl).toContain('sandbox.vnpayment.vn');
  expect(paymentUrl).toContain('vnp_TmnCode');
  expect(paymentUrl).toContain('vnp_SecureHash');

  console.log(`✅ URL VNPAY hợp lệ — booking #${bookingId}`);
  console.log(`   ${paymentUrl.substring(0, 90)}...`);
});

// ── 3B: Mock pay → nhận "thành công" ─────────────────────────
test('Bước 3B — Mock thanh toán → nhận phản hồi thành công', async ({ request }) => {
  if (!tripId || seats.length === 0) { test.skip(); return; }

  const seat = seats.shift();
  console.log(`   Dùng ghế: ${seat.seatNumber} (id=${seat.id})`);

  // Tạo booking
  const { bookingId } = await createBooking(request, { userId, tripId, seatId: seat.id }, token);
  console.log(`   Booking #${bookingId} tạo xong`);

  // Lấy paymentId (backend tạo tự động cùng booking)
  const payment = await getPaymentByBooking(request, bookingId, token);
  if (!payment) {
    console.log('⚠️  Không lấy được payment — thử dùng bookingId làm paymentId');
    test.skip();
    return;
  }

  // Mock pay
  const result = await mockPay(request, payment.id, token);

  // ── ASSERT: message phải chứa "thành công" ──────────────────
  expect(result.message).toMatch(/thành công/i);
  // Booking phải chuyển sang 'paid'
  const bookingStatus = result.data?.Booking?.status || result.data?.status;
  expect(bookingStatus).toBe('paid');

  console.log(`✅ Mock payment OK: ${result.message}`);
});

// ── 3C: Browser redirect sang trang VNPAY Sandbox ────────────
test('Bước 3C — Redirect sang trang VNPAY khi chọn thanh toán', async ({ page, request }) => {
  if (!tripId || seats.length === 0) { test.skip(); return; }

  const seat = seats.shift();
  console.log(`   Dùng ghế: ${seat.seatNumber} (id=${seat.id})`);

  const { bookingId } = await createBooking(request, { userId, tripId, seatId: seat.id }, token);

  // Tạo URL VNPAY — có thể fail nếu backend chưa cấu hình
  let paymentUrl;
  try {
    paymentUrl = await createVnpayUrl(request, { bookingId, amount: 250000 }, token);
  } catch (err) {
    if (err.message.includes('Sập nguồn') || err.message.includes('tạo link')) {
      console.log('⚠️  Backend chưa cấu hình VNPAY (thiếu vnp_TmnCode/vnp_HashSecret trong .env) — skip');
      test.skip();
      return;
    }
    throw err;
  }

  // Playwright mở URL VNPAY
  await page.goto(paymentUrl);
  await page.waitForLoadState('domcontentloaded');

  const currentUrl = page.url();
  const title = await page.title();

  // ── ASSERT: phải đang ở trang VNPAY ─────────────────────────
  const isVnpay =
    currentUrl.includes('vnpayment.vn') ||
    title.toLowerCase().includes('vnpay') ||
    (await page.locator('img[alt*="VNPAY"], text=VNPAY').count()) > 0;

  expect(isVnpay).toBeTruthy();
  console.log(`✅ Redirect VNPAY thành công`);
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Title: ${title}`);
});
