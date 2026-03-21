import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LIST = ["Tất cả", "pending", "paid", "cancelled"];

const STATUS_META = {
  pending:   { label: "Chờ thanh toán", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  paid:      { label: "Đã thanh toán",  color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
  cancelled: { label: "Đã hủy",         color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDatetime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}
function fmtPrice(p) {
  if (!p && p !== 0) return "—";
  return Number(p).toLocaleString("vi-VN") + "đ";
}
function exportCSV(bookings) {
  const header = ["ID", "Khách hàng", "Email", "Chuyến xe", "Tổng tiền", "Trạng thái", "Thời gian đặt"];
  const rows   = bookings.map((b) => [
    b.id,
    b.user?.full_name ?? b.user_id,
    b.user?.email ?? "",
    b.trip_id,
    b.total_amount ?? "",
    STATUS_META[b.status]?.label ?? b.status,
    fmtDatetime(b.booking_time),
  ]);
  const csv  = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = "bookings.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div
      className="fixed bottom-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-2xl text-white text-sm font-medium shadow-xl animate-slide-up"
      style={{ backgroundColor: type === "error" ? "#ef4444" : "#059669" }}
    >
      {type === "error"
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
      {msg}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-xs">✕</button>
    </div>
  );
}

function Spinner({ small }) {
  return (
    <div className={`flex items-center justify-center ${small ? "py-6" : "py-20"}`}>
      <div className={`border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin ${small ? "w-5 h-5" : "w-8 h-8"}`} />
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ color: m.color, backgroundColor: m.bg, boxShadow: `0 0 0 1px ${m.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

// ─── Confirm Cancel Modal ─────────────────────────────────────────────────────
function ConfirmCancelModal({ booking, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-bold text-slate-900 mb-1">Hủy đơn đặt vé?</p>
        <p className="text-xs text-slate-400 mb-1">Đơn hàng <span className="font-semibold text-slate-700">#{booking?.id}</span> sẽ bị hủy.</p>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5 mt-2">
          ⚠️ Ghế sẽ được trả lại trạng thái trống.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Đóng</button>
          <button
            onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ef4444" }}
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Detail Modal (+ tickets) ────────────────────────────────────────
function BookingDetailModal({ booking, trips, routes, onClose, onStatusChange }) {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tickets?booking_id=${booking.id}`);
        setTickets(Array.isArray(data) ? data : data.data ?? []);
      } catch { setTickets([]); }
      finally { setLoading(false); }
    };
    fetchTickets();
  }, [booking.id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: newStatus });
      onStatusChange(booking.id, newStatus);
    } catch { /* toast handled outside */ }
    finally { setUpdating(false); }
  };

  // Lấy thông tin chuyến xe
  const trip  = trips.find((t) => t.id === booking.trip_id || t.id === Number(booking.trip_id));
  const route = trip ? routes.find((r) => r.id === trip.route_id || r.id === Number(trip.route_id)) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#fff7ed" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1.5a2.5 2.5 0 010 5V17a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.5a2.5 2.5 0 010-5V9z" stroke="#f97316" strokeWidth="1.8" fill="none"/>
                <path d="M9 12h6M9 15h4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 7v10" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Chi tiết đơn #{booking.id}</h2>
              <StatusBadge status={booking.status} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Thông tin chuyến */}
          {route && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">Chuyến xe</p>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="w-px h-5 border-l-2 border-dashed border-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{route.departure_location}</p>
                  <p className="text-xs text-slate-400 mt-1">{route.arrival_location}</p>
                </div>
                {trip && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-slate-500">{fmtDatetime(trip.departure_time)}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: "#2563eb" }}>{fmtPrice(trip.price)}/ghế</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin khách */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">Khách hàng</p>
              <p className="text-sm font-semibold text-slate-800">{booking.user?.full_name ?? `User #${booking.user_id}`}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{booking.user?.email ?? "—"}</p>
              <p className="text-[11px] text-slate-400">{booking.user?.phone ?? "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">Thanh toán</p>
              <p className="text-xl font-extrabold" style={{ color: "#f97316" }}>{fmtPrice(booking.total_amount)}</p>
              <p className="text-[11px] text-slate-400 mt-1">{fmtDatetime(booking.booking_time)}</p>
            </div>
          </div>

          {/* Danh sách vé (tickets) */}
          <div>
            <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">
              Danh sách vé ({tickets.length} vé)
            </p>
            {loading ? <Spinner small /> : tickets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Không có vé nào</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket, i) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                      style={{ backgroundColor: "#eff6ff", color: "#2563eb", boxShadow: "0 0 0 1px #bfdbfe" }}
                    >
                      {ticket.trip_seat?.seat_number ?? `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {ticket.passenger_name || "—"}
                      </p>
                      <p className="text-[11px] text-slate-400">{ticket.passenger_phone || "—"}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">#{ticket.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Đổi trạng thái */}
          {booking.status !== "cancelled" && (
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">Cập nhật trạng thái</p>
              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus("paid")}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#059669" }}
                  >
                    {updating && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                    ✓ Xác nhận đã thanh toán
                  </button>
                )}
                {booking.status === "paid" && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus("cancelled")}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 border"
                    style={{ color: "#ef4444", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageBookings() {
  const [bookings, setBookings]     = useState([]);
  const [trips, setTrips]           = useState([]);
  const [routes, setRoutes]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [page, setPage]             = useState(1);
  const [detailBooking, setDetailBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, tRes, rRes] = await Promise.all([
        api.get("/bookings"),
        api.get("/trips"),
        api.get("/routes"),
      ]);
      setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data.data ?? []);
      setTrips(Array.isArray(tRes.data)    ? tRes.data : tRes.data.data ?? []);
      setRoutes(Array.isArray(rRes.data)   ? rRes.data : rRes.data.data ?? []);
    } catch { showToast("Không thể tải dữ liệu", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Cancel booking ────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.patch(`/bookings/${cancelBooking.id}/status`, { status: "cancelled" });
      setBookings((p) => p.map((b) => b.id === cancelBooking.id ? { ...b, status: "cancelled" } : b));
      showToast(`Đã hủy đơn #${cancelBooking.id}`);
      setCancelBooking(null);
      // Cập nhật detail modal nếu đang mở
      if (detailBooking?.id === cancelBooking.id) {
        setDetailBooking((p) => ({ ...p, status: "cancelled" }));
      }
    } catch { showToast("Hủy đơn thất bại", "error"); }
    finally { setCancelLoading(false); }
  };

  // ── Status change từ modal ────────────────────────────────────────────────────
  const handleStatusChange = (id, newStatus) => {
    setBookings((p) => p.map((b) => b.id === id ? { ...b, status: newStatus } : b));
    setDetailBooking((p) => p ? { ...p, status: newStatus } : p);
    showToast("Cập nhật trạng thái thành công!");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getTrip  = (id) => trips.find((t)  => t.id === id || t.id === Number(id));
  const getRoute = (tripId) => {
    const trip = getTrip(tripId);
    return trip ? routes.find((r) => r.id === trip.route_id || r.id === Number(trip.route_id)) : null;
  };

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "Tất cả" || b.status === statusFilter;
    const route       = getRoute(b.trip_id);
    const q           = search.toLowerCase();
    const matchSearch = !search ||
      String(b.id).includes(q) ||
      b.user?.full_name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      route?.departure_location?.toLowerCase().includes(q) ||
      route?.arrival_location?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    paid:      bookings.filter((b) => b.status === "paid").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue:   bookings.filter((b) => b.status === "paid").reduce((s, b) => s + Number(b.total_amount ?? 0), 0),
  };

  return (
    <>
      <style>{`
        @keyframes slide-up { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        .animate-slide-up { animation: slide-up .25s ease-out }
        @keyframes fade-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .row-fade { animation: fade-in .18s ease-out }
      `}</style>

      <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Quản lý đặt vé</h1>
            <p className="text-sm text-slate-400 mt-0.5">Xem và xử lý các đơn đặt vé của khách hàng.</p>
          </div>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 16l-4-4h2.5V4h3v8H16l-4 4z" fill="currentColor"/>
              <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Xuất CSV
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Tổng đơn",        value: stats.total,     color: "#64748b", bg: "#f1f5f9" },
            { label: "Chờ thanh toán",  value: stats.pending,   color: "#d97706", bg: "#fffbeb" },
            { label: "Đã thanh toán",   value: stats.paid,      color: "#059669", bg: "#f0fdf4" },
            { label: "Đã hủy",          value: stats.cancelled, color: "#dc2626", bg: "#fef2f2" },
            { label: "Doanh thu",        value: fmtPrice(stats.revenue), color: "#f97316", bg: "#fff7ed" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1.5a2.5 2.5 0 010 5V17a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.5a2.5 2.5 0 010-5V9z" stroke={color} strokeWidth="1.8" fill="none"/>
                  <path d="M9 12h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 leading-tight">{value}</p>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-50 max-w-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M16.5 16.5L21 21" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm mã đơn, khách hàng, tuyến..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {STATUS_LIST.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${statusFilter === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {s === "Tất cả" ? "Tất cả" : STATUS_META[s]?.label}
                </button>
              ))}
            </div>

            <p className="ml-auto text-xs text-slate-400 font-medium shrink-0">{filtered.length} đơn</p>
          </div>

          {/* Table body */}
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["#", "Khách hàng", "Tuyến đường", "Thời gian đặt", "Tổng tiền", "Trạng thái", "Hành động"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold tracking-widest text-slate-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageData.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v1.5a2.5 2.5 0 010 5V17a2 2 0 01-2 2H4a2 2 0 01-2-2v-1.5a2.5 2.5 0 010-5V9z" stroke="#cbd5e1" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <p className="text-sm">Không tìm thấy đơn đặt vé nào.</p>
                      </div>
                    </td></tr>
                  ) : pageData.map((booking) => {
                    const route = getRoute(booking.trip_id);
                    const trip  = getTrip(booking.trip_id);
                    return (
                      <tr key={booking.id} className="hover:bg-orange-50/20 transition row-fade">
                        <td className="px-4 py-4 text-xs font-mono text-slate-400">#{booking.id}</td>

                        {/* Khách hàng */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: "#f97316" }}
                            >
                              {(booking.user?.full_name ?? "U").charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 leading-tight">
                                {booking.user?.full_name ?? `User #${booking.user_id}`}
                              </p>
                              <p className="text-[11px] text-slate-400">{booking.user?.email ?? "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Tuyến đường */}
                        <td className="px-4 py-4">
                          {route ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center gap-0.5 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <div className="w-px h-3 border-l-2 border-dashed border-slate-200" />
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700 leading-tight">{route.departure_location}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{route.arrival_location}</p>
                              </div>
                            </div>
                          ) : <span className="text-xs text-slate-400">Chuyến #{booking.trip_id}</span>}
                          {trip && <p className="text-[11px] text-slate-400 mt-1">{fmtDatetime(trip.departure_time)}</p>}
                        </td>

                        {/* Thời gian đặt */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-700">{fmtDatetime(booking.booking_time)}</p>
                        </td>

                        {/* Tổng tiền */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold" style={{ color: "#f97316" }}>{fmtPrice(booking.total_amount)}</p>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDetailBooking(booking)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              style={{ color: "#2563eb", backgroundColor: "#eff6ff" }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dbeafe"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Chi tiết
                            </button>
                            {booking.status !== "cancelled" && (
                              <button
                                onClick={() => setCancelBooking(booking)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                style={{ color: "#ef4444", backgroundColor: "#fef2f2" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Hủy
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-400">
              Trang <span className="font-semibold text-slate-600">{safePage}</span> / {totalPages} — {filtered.length} đơn
            </p>
            <div className="flex items-center gap-1">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed">
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  style={p === safePage
                    ? { backgroundColor: "#f97316", color: "white" }
                    : { color: "#64748b", border: "1px solid #e2e8f0", backgroundColor: "transparent" }
                  }>{p}</button>
              ))}
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed">
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          trips={trips}
          routes={routes}
          onClose={() => setDetailBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Cancel confirm */}
      {cancelBooking && (
        <ConfirmCancelModal
          booking={cancelBooking}
          onClose={() => setCancelBooking(null)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}