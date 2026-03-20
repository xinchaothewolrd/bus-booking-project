export default function UserFooter() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Về chúng tôi</h3>
            <p className="text-gray-400">
              Nền tảng đặt vé xe bus trực tuyến hàng đầu
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#">Hỗ trợ</a>
              </li>
              <li>
                <a href="#">Chính sách</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Liên hệ</h3>
            <p className="text-gray-400">Email: support@busbooking.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Bus Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
