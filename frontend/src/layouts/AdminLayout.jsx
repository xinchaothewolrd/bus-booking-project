import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-5">
        {/* Các trang như Dashboard, Quản lý sẽ chui vào đây */}
        <Outlet />
      </div>
    </div>
  );
}
