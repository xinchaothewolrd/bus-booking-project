import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Layouts
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

// Import Pages
import Home from "../pages/user/Home";
import About from "../pages/user/About";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import NotFound from "../pages/NotFound";

// Import Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ManageRoutes  from "../pages/admin/ManageRoutes";
import ManageTrips from "../pages/admin/ManageTrips";
import ManageSeats from "../pages/admin/ManageSeats";
import ManageBusTypes from "../pages/admin/ManageBusTypes";
import ManageBookings from "../pages/admin/ManageBookings";
import Statistics from "../pages/admin/Statistics";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* LUỒNG CỦA USER: Dùng UserLayout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* LUỒNG CỦA ADMIN: Dùng AdminLayout */}
        {/* Thêm check Auth ở đây nếu cần bảo mật nhé, không là ai cũng mò vào được */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="routes" element={<ManageRoutes />} />
          <Route path="trips" element={<ManageTrips />} />
          <Route path="seats" element={<ManageSeats />} />
          <Route path="bus-types" element={<ManageBusTypes />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        {/* Bắt mấy thằng gõ bậy bạ URL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
