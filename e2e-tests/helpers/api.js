const BASE = 'http://localhost:3000';

// Helper: decode JWT payload (không cần thư viện, chỉ parse base64)
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export async function signup(request) {
  await request.post(`${BASE}/api/auth/signup`, {
    data: {
      email: 'e2e@oceanbus.vn', password: 'Test@12345',
      phone: '0999000111', firstName: 'Playwright', lastName: 'Test',
    }
  });
}

export async function signin(request) {
  const res = await request.post(`${BASE}/api/auth/signin`, {
    data: { identity: 'e2e@oceanbus.vn', password: 'Test@12345' }
  });
  const body = await res.json();
  if (!body.accessToken) throw new Error('Đăng nhập thất bại: ' + JSON.stringify(body));
  // FIX: Backend không trả user object, decode JWT để lấy userId
  const payload = decodeJwtPayload(body.accessToken);
  return { token: body.accessToken, userId: payload.userId };
}

// Lấy trips trực tiếp từ /api/trips (getAllTrips) thay vì search theo tên
// Lọc ra trip nào departure_time > hiện tại và status = scheduled
export async function searchTrips(request, token) {
  const res = await request.get(`${BASE}/api/trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return [];
  const body = await res.json();
  const all = Array.isArray(body) ? body : (body.data || body.trips || []);
  const now = new Date();
  // Lọc trip tương lai, status scheduled
  return all.filter(t => {
    const dep = new Date(t.departureTime || t.departure_time);
    return dep > now && (t.status === 'scheduled');
  });
}

// Lấy thông tin route (departure/arrival locations) từ trip đầu tiên
export async function getFirstTripRoute(request, token) {
  const trips = await searchTrips(request, token);
  if (trips.length === 0) return null;
  const trip = trips[0];
  // Trip include route info (Sequelize trả camelCase)
  const route = trip.route;
  if (route) {
    return {
      from: route.departureLocation || route.departure_location,
      to: route.arrivalLocation || route.arrival_location,
      tripId: trip.id,
    };
  }
  return null;
}

// FIX: Đúng endpoint là /api/trip-seats/trip/:tripId (không phải ?tripId=)
export async function getTripSeats(request, tripId, token) {
  const res = await request.get(`${BASE}/api/trip-seats/trip/${tripId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return [];
  const body = await res.json();
  return Array.isArray(body) ? body : (body.data || []);
}

// FIX: Thêm passengerName + passengerPhone vào từng ticket item
export async function createBooking(request, { userId, tripId, seatId }, token) {
  const res = await request.post(`${BASE}/api/bookings`, {
    data: {
      userId, tripId, totalAmount: 250000,
      tickets: [{
        tripSeatId: seatId,
        passengerName: 'Nguyen Van E2E',
        passengerPhone: '0911222333'
      }]
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok()) throw new Error('Tạo booking thất bại: ' + body.message);
  // FIX: backend trả về { data: fullBooking } không phải { booking: ... }
  const bookingId = body.booking?.id || body.data?.id;
  return { bookingId, body };
}

export async function getPaymentByBooking(request, bookingId, token) {
  const res = await request.get(`${BASE}/api/payments/booking/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body?.id ? body : null;
}

export async function mockPay(request, paymentId, token) {
  const res = await request.post(`${BASE}/api/payments/${paymentId}/pay`, {
    data: { paymentMethod: 'card' },
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok()) throw new Error('Mock pay thất bại: ' + body.message);
  return body;
}

export async function createVnpayUrl(request, { bookingId, amount }, token) {
  const res = await request.post(`${BASE}/api/payments/create_url`, {
    data: { bookingId, amount, bankCode: '' },
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok()) throw new Error('Tạo VNPAY URL thất bại: ' + body.message);
  return body.paymentUrl;
}

// Helper: lấy stops của một trip (qua routeId)
export async function getRouteStops(request, routeId, token) {
  const res = await request.get(`${BASE}/api/route-stops/routes/${routeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return [];
  const body = await res.json();
  return Array.isArray(body) ? body : (body.data || []);
}
