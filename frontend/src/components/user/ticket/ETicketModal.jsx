import React from 'react';
import { motion } from "framer-motion";
import { X, ArrowRight, Trash2, Download } from 'lucide-react';

export default function ETicketModal({ ticket, onClose }) {
  if (!ticket) return null;

  // Lấy chuỗi QR từ vé đầu tiên trong danh sách rawTickets gộp
  const qrData = ticket.rawTickets?.[0]?.qrCode || ticket.code;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel-elevated w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-outline flex justify-between items-center bg-surface/30">
          <h2 className="text-lg font-bold">Vé Điện Tử</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`}
              alt="QR Code"
              className="w-48 h-48"
            />
          </div>
          <p className="text-on-surface-variant text-sm mb-1 uppercase tracking-widest font-medium">Mã Đặt Chỗ</p>
          <p className="text-3xl font-bold text-primary tracking-tighter mb-8">{ticket.code}</p>

          <div className="w-full space-y-4 text-sm border-t border-dashed border-outline pt-8 relative">
            <div className="absolute -left-12 -top-4 w-8 h-8 rounded-full bg-background/50 border-r border-outline" />
            <div className="absolute -right-12 -top-4 w-8 h-8 rounded-full bg-background/50 border-l border-outline" />
            
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Nhà xe</span>
              <span className="font-semibold text-on-surface">OceanBus</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Tuyến đường</span>
              <span className="font-semibold text-on-surface flex items-center gap-2">
                {ticket.from} <ArrowRight size={14} className="text-primary" /> {ticket.to}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Thời gian</span>
              <span className="font-semibold text-on-surface">{ticket.timeRange} - {ticket.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Hành khách</span>
              <span className="font-semibold text-on-surface">{ticket.passengerName || 'Khách hàng'}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-on-surface-variant">Số ghế</span>
              <span className="text-primary font-bold text-lg">{ticket.seats}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-outline flex justify-between items-center bg-surface/30">
          <button className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-medium">
            <Trash2 size={16} /> Hủy vé
          </button>
          <button className="bg-primary hover:bg-primary/80 text-background font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2">
            <Download size={18} /> Tải vé PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}