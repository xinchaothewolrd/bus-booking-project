// helpers/auth.js
// Inject accessToken vào localStorage để React nhận ra user đã đăng nhập
// Dùng addInitScript — chạy trước khi trang load, trước mọi JS khác

export async function injectToken(page, token) {
  // Bật log của trình duyệt lên console để debug
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Lỗi')) {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  // Chặn request tới /api/auth/refresh và trả về token hợp lệ
  // Điều này giúp App.jsx nhận được token và set vào useAuthStore thành công
  await page.route('**/api/auth/refresh', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({ accessToken: token })
    });
  });

  await page.addInitScript((t) => {
    // Frontend của bạn lưu token với key là 'token', không phải 'accessToken'
    window.localStorage.setItem('token', t);
  }, token);
}

// Tiện ích lấy ngày mai dạng yyyy-MM-dd
export function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
