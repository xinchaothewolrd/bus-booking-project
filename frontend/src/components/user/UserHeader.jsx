export default function UserHeader() {
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bus Booking</h1>
          <ul className="flex gap-4">
            <li>
              <a href="/" className="hover:text-blue-600">
                Trang chủ
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-600">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="/profile" className="hover:text-blue-600">
                Hồ sơ
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
