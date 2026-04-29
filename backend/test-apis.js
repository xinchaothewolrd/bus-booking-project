import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
let token = '';

async function runTests() {
  console.log('--- BẮT ĐẦU TEST TOÀN BỘ LUỒNG KỊCH BẢN API CỦA AN ---');
  
  // 1. Tạo user & đăng nhập (nếu username đã tồn tại sẽ đăng nhập luôn)
  const username = `test_admin_${Date.now()}`;
  await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username, password: 'password', email: `${username}@test.com`,
      phone: `09${Math.floor(Math.random()*100000000)}`, firstName: 'Test', lastName: 'An'
    })
  });
  
  const loginRes = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'password' })
  });
  const loginData = await loginRes.json();
  token = loginData.accessToken;
  console.log('✅ Đăng nhập lấy Token thành công');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 2. Tạo Loại xe (Bus Type)
  const btRes = await fetch(`${BASE_URL}/bus-types`, {
    method: 'POST', headers,
    body: JSON.stringify({ typeName: 'Giường Nằm 34 Chỗ', totalSeats: 34, seatLayout: { rows: 9, cols: 4 } })
  });
  const btData = await btRes.json();
  const busTypeId = btData.data.id;
  console.log('✅ Tạo Loại Xe thành công:', btData.data.typeName);

  // 3. Tạo Tuyến đường (Route)
  const routeRes = await fetch(`${BASE_URL}/routes`, {
    method: 'POST', headers,
    body: JSON.stringify({ departureLocation: 'Sài Gòn', arrivalLocation: 'Đà Lạt', distanceKm: 300 })
  });
  const routeData = await routeRes.json();
  const routeId = routeData.data.id;
  console.log('✅ Tạo Tuyến Đường thành công:', `${routeData.data.departureLocation} -> ${routeData.data.arrivalLocation}`);

  // 4. Tạo Xe (Bus)
  const busRes = await fetch(`${BASE_URL}/buses`, {
    method: 'POST', headers,
    body: JSON.stringify({ licensePlate: `51B-${Math.floor(Math.random()*10000)}`, busTypeId, driverName: 'Bác Tài X', status: 'active' })
  });
  const busData = await busRes.json();
  const busId = busData.data.id;
  console.log('✅ Tạo Xe thành công, Biển số:', busData.data.licensePlate);

  // 5. Cấu hình bảng giá gốc (Route Fare)
  const fareRes = await fetch(`${BASE_URL}/route-fares`, {
    method: 'POST', headers,
    body: JSON.stringify({ routeId, busTypeId, basePrice: 350000 })
  });
  const fareData = await fareRes.json();
  console.log('✅ Cấu hình Bảng Giá thành công, Giá vé:', fareData.data.basePrice);

  // 6. Cấu hình luật tăng giá ngày lễ (Price Rule)
  const ruleRes = await fetch(`${BASE_URL}/price-rules`, {
    method: 'POST', headers,
    body: JSON.stringify({ ruleName: 'Phụ thu Lễ', priceMultiplier: 1.2, startDate: '2026-04-30', endDate: '2026-05-02', priority: 1 })
  });
  const ruleData = await ruleRes.json();
  console.log('✅ Cấu hình Luật Giá ngày lễ thành công:', ruleData.data.ruleName);

  // 7. Tạo Chuyến đi (Trip)
  const tripRes = await fetch(`${BASE_URL}/trips`, {
    method: 'POST', headers,
    body: JSON.stringify({ routeId, busId, departureTime: '2026-04-30 22:00:00', cancelPolicy: 'Không hoàn tiền sát giờ' })
  });
  const tripData = await tripRes.json();
  const tripId = tripData.data.id;
  console.log('✅ Tạo Chuyến Đi thành công (Trip ID):', tripId);

  // 8. Tạo Ghế tự động cho chuyến (Trip Seat)
  const seatRes = await fetch(`${BASE_URL}/trip-seats`, {
    method: 'POST', headers,
    body: JSON.stringify({ tripId, seatNumber: 'A1', status: 'available' })
  });
  const seatData = await seatRes.json();
  console.log('✅ Khởi tạo Ghế thành công:', seatData.data.seatNumber);

  console.log('--- 🎉 TẤT CẢ API CỦA AN ĐỀU HOẠT ĐỘNG HOÀN HẢO! ---');
}

runTests().catch(console.error);
