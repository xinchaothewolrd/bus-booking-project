import { motion } from "framer-motion";
import { MapPin, Calendar, Users } from "lucide-react";

export default function UserHero () {
  return (
    <section className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe6e0h7e_7bJwF88uumUgKqscbsE1dwusYSKJXo6KD7w8ovuhTmUAC4DK9GgQGFCPACZV3Qp0Dk5_IFc5Lfu6D2wSLiznJEbRQw-9DkOs97BrLOG--JjxKuM6bOnht8GIKzsdOjAW2jemzjz75f_Y6C_d-82jRGYjTHIg-VqWHyZGBSNo6cWy3oPHGHb_X75qqazqfECMfr7J_keanjEOSdXlXOM-Z-YAVSaLQGIQElUrc19ENdLbCnLD89Qn4NxaOz_-aJQgoWLo" 
          alt="Modern high-tech luxury bus at dusk"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-transparent to-[#0a0e1a]"></div>
      </div>
      <div className="relative z-10 w-full max-w-5xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Hành trình đẳng cấp <span className="text-sky-300">OceanBus</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Kết nối mọi nẻo đường với dịch vụ vận tải 5 sao hàng đầu Việt Nam.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-[#0f1524]/75 backdrop-blur-3xl p-6 md:p-8 rounded-2xl shadow-2xl border border-sky-400/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sky-300 uppercase tracking-wider ml-1">Điểm đi</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/50 w-5 h-5" />
                <input 
                  className="w-full bg-[#141c2e]/50 border border-slate-700/30 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 text-white placeholder:text-slate-500" 
                  placeholder="Hồ Chí Minh" 
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sky-300 uppercase tracking-wider ml-1">Điểm đến</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/50 w-5 h-5" />
                <input 
                  className="w-full bg-[#141c2e]/50 border border-slate-700/30 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 text-white placeholder:text-slate-500" 
                  placeholder="Đà Lạt" 
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sky-300 uppercase tracking-wider ml-1">Ngày đi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/50 w-5 h-5" />
                <input 
                  className="w-full bg-[#141c2e]/50 border border-slate-700/30 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 text-white" 
                  type="date"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button className="w-full md:w-auto px-12 py-4 bg-sky-400 text-[#001f2e] font-bold rounded-3xl hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] transition-all duration-300 active:scale-95 text-lg">
              Tìm chuyến xe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};