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
const STATUS_LIST = ["Tất cả", "scheduled", "departing", "completed", "cancelled"];

const STATUS_META = {
  scheduled:  { label: "Chờ khởi hành", color: "#2563eb", bg: "#eff6ff", ring: "#bfdbfe" },
  departing:  { label: "Đang chạy",      color: "#d97706", bg: "#fffbeb", ring: "#fde68a" },
  completed:  { label: "Hoàn thành",     color: "#059669", bg: "#f0fdf4", ring: "#a7f3d0" },
  cancelled:  { label: "Đã hủy",         color: "#dc2626", bg: "#fef2f2", ring: "#fecaca" },
};

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDatetime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function fmtPrice(p) {
  if (!p) return "—";
  return Number(p).toLocaleString("vi-VN") + "đ";
}

function toInputDatetime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
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

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.scheduled;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ color: m.color, backgroundColor: m.bg, boxShadow: `0 0 0 1px ${m.ring}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmModal({ trip, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-bold text-slate-900 mb-1">Xóa chuyến xe?</p>
        <p className="text-xs text-slate-400 mb-3">Chuyến xe <span className="font-semibold text-slate-700">#{trip?.id}</span> sẽ bị xóa vĩnh viễn.</p>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-5">
          ⚠️ Các vé đã đặt thuộc chuyến này cũng có thể bị ảnh hưởng.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Hủy</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#ef4444' }}
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trip Modal ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  route_id: "",
  bus_type_id: "",
  departure_time: "",
  arrival_time_expected: "",
  price: "",
  status: "scheduled",
};

function TripModal({ trip, routes, busTypes, onClose, onSave }) {
  const [form, setForm]     = useState(trip ? { ...trip, departure_time: toInputDatetime(trip.departure_time), arrival_time_expected: toInputDatetime(trip.arrival_time_expected) } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!trip?.id;

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.route_id)        e.route_id        = "Chọn tuyến đường";
    if (!form.bus_type_id)     e.bus_type_id     = "Chọn loại xe";
    if (!form.departure_time)  e.departure_time  = "Chọn giờ khởi hành";
    if (!form.price || isNaN(Number(form.price))) e.price = "Giá vé không hợp lệ";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload = { ...form, price: Number(form.price), route_id: Number(form.route_id), bus_type_id: Number(form.bus_type_id) };
    try {
      if (isEdit) {
        const { data } = await api.put(`/trips/${form.id}`, payload);
        onSave(data);
      } else {
        const { data } = await api.post("/trips", payload);
        onSave(data);
      }
    } catch {
      setErrors({ _global: "Lưu thất bại, thử lại." });
    } finally { setSaving(false); }
  };

  const selClass = (err) => `w-full text-sm px-3 py-2.5 rounded-xl border bg-slate-50 outline-none transition ${err ? "border-red-400 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-2 ring-blue-50"}`;
  const inpClass = (err) => selClass(err);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: isEdit ? '#eff6ff' : '#f0fdf4' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke={isEdit ? "#2563eb" : "#059669"} strokeWidth="1.8" fill="none"/>
                <path d="M3 9h18M8 4V2M16 4V2" stroke={isEdit ? "#2563eb" : "#059669"} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">{isEdit ? "Chỉnh sửa chuyến xe" : "Tạo chuyến xe mới"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {errors._global && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{errors._global}</div>}

          {/* Route + Bus type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tuyến đường *</label>
              <select value={form.route_id} onChange={(e) => set("route_id", e.target.value)} className={selClass(errors.route_id)}>
                <option value="">-- Chọn tuyến --</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.departure_location} → {r.arrival_location}</option>
                ))}
              </select>
              {errors.route_id && <p className="text-[11px] text-red-500 mt-1">{errors.route_id}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Loại xe *</label>
              <select value={form.bus_type_id} onChange={(e) => set("bus_type_id", e.target.value)} className={selClass(errors.bus_type_id)}>
                <option value="">-- Chọn loại xe --</option>
                {busTypes.map((b) => (
                  <option key={b.id} value={b.id}>{b.type_name}</option>
                ))}
              </select>
              {errors.bus_type_id && <p className="text-[11px] text-red-500 mt-1">{errors.bus_type_id}</p>}
            </div>
          </div>

          {/* Departure + Arrival */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Giờ xuất bến *</label>
              <input type="datetime-local" value={form.departure_time} onChange={(e) => set("departure_time", e.target.value)} className={inpClass(errors.departure_time)}/>
              {errors.departure_time && <p className="text-[11px] text-red-500 mt-1">{errors.departure_time}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Giờ đến dự kiến</label>
              <input type="datetime-local" value={form.arrival_time_expected} onChange={(e) => set("arrival_time_expected", e.target.value)} className={inpClass(false)}/>
            </div>
          </div>

          {/* Price + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Giá vé (VNĐ) *</label>
              <input
                type="number" placeholder="VD: 150000"
                value={form.price} onChange={(e) => set("price", e.target.value)}
                className={inpClass(errors.price)}
              />
              {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Trạng thái</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selClass(false)}>
                <option value="scheduled">Chờ khởi hành</option>
                <option value="departing">Đang chạy</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Preview card */}
          {(form.route_id || form.departure_time || form.price) && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">Xem trước</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {routes.find((r) => r.id == form.route_id)
                      ? `${routes.find((r) => r.id == form.route_id).departure_location} → ${routes.find((r) => r.id == form.route_id).arrival_location}`
                      : "Chưa chọn tuyến"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{form.departure_time ? fmtDatetime(form.departure_time) : "Chưa chọn giờ"}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-blue-600">{form.price ? fmtPrice(form.price) : "—"}</p>
                  <StatusBadge status={form.status} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Hủy</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: isEdit ? '#2563eb' : '#059669' }}
          >
            {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
            {isEdit ? "Lưu thay đổi" : "Tạo chuyến xe"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageTrips() {
  const [trips, setTrips]         = useState([]);
  const [routes, setRoutes]       = useState([]);
  const [busTypes, setBusTypes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tripsRes, routesRes, busRes] = await Promise.all([
        api.get("/trips"),
        api.get("/routes"),
        api.get("/bus-types"),
      ]);
      setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : tripsRes.data.data ?? []);
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : routesRes.data.data ?? []);
      setBusTypes(Array.isArray(busRes.data) ? busRes.data : busRes.data.data ?? []);
    } catch {
      showToast("Không thể tải dữ liệu", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = (saved) => {
    setTrips((p) => {
      const idx = p.findIndex((t) => t.id === saved.id);
      if (idx >= 0) { const n = [...p]; n[idx] = saved; return n; }
      return [saved, ...p];
    });
    setModal(null);
    showToast(modal?.id ? "Cập nhật chuyến xe thành công!" : "Tạo chuyến xe thành công!");
  };

  // ── Update status inline ─────────────────────────────────────────────────────
  const updateStatus = async (trip, newStatus) => {
    const prev = trip.status;
    setTrips((p) => p.map((t) => t.id === trip.id ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/trips/${trip.id}/status`, { status: newStatus });
      showToast("Cập nhật trạng thái thành công!");
    } catch {
      setTrips((p) => p.map((t) => t.id === trip.id ? { ...t, status: prev } : t));
      showToast("Cập nhật thất bại", "error");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await api.delete(`/trips/${confirmDel.id}`);
      setTrips((p) => p.filter((t) => t.id !== confirmDel.id));
      showToast("Đã xóa chuyến xe!");
      setConfirmDel(null);
    } catch {
      showToast("Xóa thất bại", "error");
    } finally { setDelLoading(false); }
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = trips.filter((t) => {
    const route = routes.find((r) => r.id === t.route_id);
    const matchSearch = !search || (
      route?.departure_location?.toLowerCase().includes(search.toLowerCase()) ||
      route?.arrival_location?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search)
    );
    const matchStatus = statusFilter === "Tất cả" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total:     trips.length,
    scheduled: trips.filter((t) => t.status === "scheduled").length,
    departing: trips.filter((t) => t.status === "departing").length,
    completed: trips.filter((t) => t.status === "completed").length,
  };

  const getRoute    = (id) => routes.find((r) => r.id === id || r.id === Number(id));
  const getBusType  = (id) => busTypes.find((b) => b.id === id || b.id === Number(id));

  return (
    <>
      <style>{`
        @keyframes slide-up { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        .animate-slide-up { animation: slide-up .25s ease-out }
        @keyframes fade-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .row-fade { animation: fade-in .18s ease-out }
      `}</style>

      <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Quản lý chuyến xe</h1>
            <p className="text-sm text-slate-400 mt-0.5">Tạo lịch chạy và cập nhật trạng thái chuyến xe.</p>
          </div>
          <button
            onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition shadow-sm"
            style={{ backgroundColor: '#2563eb' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Tạo chuyến xe
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng chuyến xe",    value: stats.total,     color: "#2563eb", bg: "#eff6ff", icon: "M3 4h18M3 8h18M5 12h14M7 16h10M9 20h6" },
            { label: "Chờ khởi hành",     value: stats.scheduled, color: "#2563eb", bg: "#dbeafe", icon: "M12 8v4l3 3M12 3a9 9 0 100 18A9 9 0 0012 3z" },
            { label: "Đang chạy",         value: stats.departing, color: "#d97706", bg: "#fef3c7", icon: "M5 12h14M13 6l6 6-6 6" },
            { label: "Hoàn thành",        value: stats.completed, color: "#059669", bg: "#d1fae5", icon: "M5 13l4 4L19 7" },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d={icon} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{value}</p>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap px-5 py-4 border-b border-slate-100">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-50 max-w-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M16.5 16.5L21 21" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm tuyến, mã chuyến..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
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

            <p className="ml-auto text-xs text-slate-400 font-medium shrink-0">{filtered.length} chuyến</p>
          </div>

          {/* Table */}
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["#", "Tuyến đường", "Loại xe", "Khởi hành", "Giá vé", "Trạng thái", "Hành động"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold tracking-widest text-slate-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageData.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="16" rx="2" stroke="#cbd5e1" strokeWidth="1.5" fill="none"/>
                          <path d="M3 9h18M8 4V2M16 4V2" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p className="text-sm">Không tìm thấy chuyến xe nào.</p>
                      </div>
                    </td></tr>
                  ) : pageData.map((trip) => {
                    const route   = getRoute(trip.route_id);
                    const busType = getBusType(trip.bus_type_id);
                    return (
                      <tr key={trip.id} className="hover:bg-blue-50/20 transition row-fade">
                        <td className="px-4 py-4 text-xs font-mono text-slate-400">#{trip.id}</td>

                        {/* Route */}
                        <td className="px-4 py-4">
                          {route ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center gap-0.5 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div className="w-px h-4 border-l-2 border-dashed border-slate-200" />
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight">{route.departure_location}</p>
                                <p className="text-[11px] text-slate-400 mt-1 leading-tight">{route.arrival_location}</p>
                              </div>
                            </div>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>

                        {/* Bus type */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            {busType?.type_name ?? "—"}
                          </span>
                        </td>

                        {/* Departure */}
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{fmtDatetime(trip.departure_time)}</p>
                            {trip.arrival_time_expected && (
                              <p className="text-[11px] text-slate-400 mt-0.5">→ {fmtDatetime(trip.arrival_time_expected)}</p>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-blue-600">{fmtPrice(trip.price)}</span>
                        </td>

                        {/* Status — inline dropdown */}
                        <td className="px-4 py-4">
                          <select
                            value={trip.status}
                            onChange={(e) => updateStatus(trip, e.target.value)}
                            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border-0 outline-none cursor-pointer"
                            style={{
                              color: STATUS_META[trip.status]?.color,
                              backgroundColor: STATUS_META[trip.status]?.bg,
                              boxShadow: `0 0 0 1px ${STATUS_META[trip.status]?.ring}`,
                            }}
                          >
                            <option value="scheduled">Chờ khởi hành</option>
                            <option value="departing">Đang chạy</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setModal(trip)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={() => setConfirmDel(trip)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Xóa
                            </button>
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
              Trang <span className="font-semibold text-slate-600">{safePage}</span> / {totalPages} — {filtered.length} chuyến xe
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >← Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p} onClick={() => setPage(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition text-white shadow-sm"
                  style={{ backgroundColor: p === safePage ? '#2563eb' : 'transparent', color: p === safePage ? 'white' : '#64748b', border: p === safePage ? 'none' : '1px solid #e2e8f0' }}
                >{p}</button>
              ))}
              <button
                disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >Sau →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(modal === "add" || (modal && modal.id)) && (
        <TripModal
          trip={modal === "add" ? null : modal}
          routes={routes}
          busTypes={busTypes}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {confirmDel && (
        <ConfirmModal trip={confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete} loading={delLoading} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}