import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function UserHeader() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0e1a]/60 backdrop-blur-lg border-b border-sky-400/10 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-sky-300">OceanBus</div>
        <div className="hidden md:flex items-center space-x-8">
          <a className="text-sky-300 border-b-2 border-sky-400 pb-1" href="#">Trang chủ</a>
          <a className="text-slate-400 hover:text-sky-200 transition-colors" href="#">Tin tức</a>
          <a className="text-slate-400 hover:text-sky-200 transition-colors" href="#">Liên hệ</a>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sky-300">Xin chào, {user.fullName}</span>
              <button 
                className="px-4 py-2 text-slate-400 hover:text-sky-200 transition-colors active:scale-95 duration-200"
                onClick={() => useAuthStore.getState().logOut()}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button 
                className="px-4 py-2 text-slate-400 hover:text-sky-200 transition-colors active:scale-95 duration-200"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            
          
          <button 
          className="px-6 py-2 bg-sky-400/20 text-sky-300 border border-sky-400/30 rounded-lg hover:bg-sky-400/30 transition-all duration-300 active:scale-95"
          onClick={() => navigate("/register")}
          >
            Đăng ký
          </button>
          </>
          )}
        </div>
      </div>
    </nav>
  );
}
