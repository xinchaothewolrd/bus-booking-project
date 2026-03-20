import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-4">
        <Link to="/admin" className="block px-4 py-2 rounded hover:bg-gray-700">
          Dashboard
        </Link>
        <Link
          to="/admin/users"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Quản lý người dùng
        </Link>
        <Link
          to="/admin/posts"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Quản lý bài viết
        </Link>
        <Link
          to="/"
          className="block px-4 py-2 rounded hover:bg-gray-700 text-yellow-400"
        >
          Về trang chủ
        </Link>
      </nav>
    </aside>
  );
}
