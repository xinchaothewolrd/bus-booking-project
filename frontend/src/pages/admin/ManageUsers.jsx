export default function ManageUsers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quản lý Người Dùng</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-bold">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-6 py-3">1</td>
              <td className="px-6 py-3">Nguyễn Văn A</td>
              <td className="px-6 py-3">nva@example.com</td>
              <td className="px-6 py-3">
                <span className="text-green-600">Hoạt động</span>
              </td>
              <td className="px-6 py-3">
                <button className="text-blue-600 hover:underline">
                  Chỉnh sửa
                </button>
                <span className="mx-2">|</span>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-6 py-3">2</td>
              <td className="px-6 py-3">Trần Thị B</td>
              <td className="px-6 py-3">ttb@example.com</td>
              <td className="px-6 py-3">
                <span className="text-green-600">Hoạt động</span>
              </td>
              <td className="px-6 py-3">
                <button className="text-blue-600 hover:underline">
                  Chỉnh sửa
                </button>
                <span className="mx-2">|</span>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
