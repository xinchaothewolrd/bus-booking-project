// tests/04_confirm.spec.js — BƯỚC 4: XÁC NHẬN KẾT QUẢ
// Dựa vào code PaymentResult.jsx thật:
//   - Đọc vnp_ResponseCode từ URL params
//   - isSuccess = responseCode === '00'
//   - Hiện h1 "Thanh toán thành công!" hoặc "Thanh toán thất bại"
//   - Hiện mã đơn: #{bookingId} (tức vnp_TxnRef)
//   - Hiện mã giao dịch: {transactionNo} (tức vnp_TransactionNo)
//   - Nút "Xem vé điện tử" → navigate('/ticket')
//   - Nút "Thử thanh toán lại" → navigate(-1)
//   - Gọi API: GET /api/payments/vnpay-return?... (verify backend)

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
    const all = await getTripSeats(request, tripId, token);
    seats = all.filter(s => s.status === 'available');
  }
});

test.beforeEach(async ({ page, request }) => {
  await injectToken(page, token, request);
});

// Helper: build URL params như VNPAY thật trả về
function buildVnpayParams({ responseCode, bookingId, amount = 25000000, transactionNo = 'TXN123' }) {
  return new URLSearchParams({
    vnp_ResponseCode:  responseCode,
    vnp_TxnRef:        String(bookingId),
    vnp_Amount:        String(amount),
    vnp_TransactionNo: transactionNo,
    vnp_BankCode:      'NCB',
    vnp_PayDate:       '20260526120000',
    vnp_SecureHash:    'fakehashfortesting',
  }).toString();
}

// ── 4.1: Trang hiện "Thành công" khi responseCode = 00 ───────
test('Bước 4.1 — Trang xác nhận hiện đúng khi thanh toán thành công', async ({ page }) => {
  const params = buildVnpayParams({ responseCode: '00', bookingId: 99999, transactionNo: 'TEST001' });

  await page.goto(`/payment-result?${params}`);
  // Trang gọi API vnpay-return để verify — đợi nó xong
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // ── ASSERT 1: Tiêu đề "Thanh toán thành công!" ──────────────
  // PaymentResult.jsx dòng: {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
  await expect(
    page.locator('h1:has-text("Thanh toán thành công")').first()
  ).toBeVisible({ timeout: 10_000 });

  // ── ASSERT 2: Mã đơn hàng hiển thị (#{bookingId}) ────────────
  // PaymentResult.jsx: <span>#{bookingId}</span>
  await expect(page.locator('text=#99999').first()).toBeVisible();

  // ── ASSERT 3: "Mã đơn hàng" label ────────────────────────────
  await expect(page.locator('text=Mã đơn hàng').first()).toBeVisible();

  // ── ASSERT 4: Mã giao dịch VNPay ─────────────────────────────
  await expect(page.locator('text=TEST001').first()).toBeVisible();

  // ── ASSERT 5: Nút "Xem vé điện tử" ──────────────────────────
  await expect(
    page.locator('button:has-text("Xem vé điện tử")').first()
  ).toBeVisible();

  console.log('✅ Trang thanh toán thành công hiển thị đúng');
});

// ── 4.2: Trang hiện "Thất bại" khi responseCode ≠ 00 ─────────
test('Bước 4.2 — Trang xác nhận hiện đúng khi thanh toán thất bại', async ({ page }) => {
  // responseCode 24 = khách hủy giao dịch
  const params = buildVnpayParams({ responseCode: '24', bookingId: 99998, transactionNo: '' });

  await page.goto(`/payment-result?${params}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // ── ASSERT: Tiêu đề "Thanh toán thất bại" ────────────────────
  await expect(
    page.locator('h1:has-text("Thanh toán thất bại")').first()
  ).toBeVisible({ timeout: 10_000 });

  // ── ASSERT: Nút "Thử thanh toán lại" ─────────────────────────
  await expect(
    page.locator('button:has-text("Thử thanh toán lại")').first()
  ).toBeVisible();

  console.log('✅ Trang thanh toán thất bại hiển thị đúng');
});

// ── 4.3: SMOKE TEST E2E ĐẦY ĐỦ ───────────────────────────────
// Đặt vé → lấy payment → mock pay → mở trang xác nhận → check mã vé
test('Bước 4.3 — Smoke test E2E: Đặt vé → Thanh toán → Xác nhận mã vé', async ({ page, request }) => {
  if (!tripId || seats.length === 0) {
    console.log('⚠️  Không có trip/seat — smoke test skip');
    test.skip();
    return;
  }

  const seat = seats.shift();
  console.log('🚀 Smoke test bắt đầu...');

  // ── B1: Tạo booking ─────────────────────────────────────────
  const { bookingId } = await createBooking(request, { userId, tripId, seatId: seat.id }, token);
  expect(bookingId).toBeTruthy();
  console.log(`   ✅ B1 — Booking #${bookingId}`);

  // ── B2: Lấy payment (tự tạo cùng booking) ───────────────────
  const payment = await getPaymentByBooking(request, bookingId, token);
  expect(payment?.id).toBeTruthy();
  console.log(`   ✅ B2 — Payment #${payment.id}`);

  // ── B3: Mock thanh toán ──────────────────────────────────────
  const payResult = await mockPay(request, payment.id, token);
  expect(payResult.message).toMatch(/thành công/i);
  console.log(`   ✅ B3 — ${payResult.message}`);

  // ── B4: Mở trang /payment-result như VNPAY redirect thật ─────
  const params = buildVnpayParams({
    responseCode: '00',
    bookingId,
    transactionNo: `TXN${payment.id}`,
  });

  await page.goto(`/payment-result?${params}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // ── ASSERT CUỐI: h1 + mã đơn hàng đúng ──────────────────────
  await expect(
    page.locator('h1:has-text("Thanh toán thành công")').first()
  ).toBeVisible({ timeout: 10_000 });

  await expect(page.locator(`text=#${bookingId}`).first()).toBeVisible();

  console.log(`   ✅ B4 — Trang xác nhận hiện mã vé #${bookingId}`);
  console.log('🎉 Smoke test PASS!');
});

// ── 4.4: Nút "Xem vé điện tử" → navigate('/ticket') ─────────
test('Bước 4.4 — Nút Xem vé điện tử điều hướng sang /ticket', async ({ page }) => {
  const params = buildVnpayParams({ responseCode: '00', bookingId: 99997, transactionNo: 'TXN789' });

  await page.goto(`/payment-result?${params}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const btn = page.locator('button:has-text("Xem vé điện tử")').first();
  await expect(btn).toBeVisible({ timeout: 8_000 });

  await btn.click();
  await page.waitForTimeout(2000);

  // PaymentResult.jsx: onClick={() => navigate('/ticket')
  expect(page.url()).toContain('/ticket');
  console.log(`✅ Navigate đến: ${page.url()}`);
});
