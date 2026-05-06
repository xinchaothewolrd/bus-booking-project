import { motion } from "framer-motion";
import { User, Phone, Mail } from 'lucide-react';
// Import InputGroup vào đây

function InputGroup({ label, icon, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          type={type}
          className="w-full h-12 pl-11 pr-4 rounded-xl glass-input text-on-surface placeholder:text-on-surface-variant/30 text-sm focus:ring-1 focus:ring-primary/20 outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default function PassengerForm({ formData, setFormData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
        <User size={18} className="text-primary" />
        Thông tin hành khách
      </h3>
      <div className="space-y-4">
        <InputGroup label="Họ và tên *" icon={<User size={16} />} placeholder="Nhập họ và tên đầy đủ" />
        <InputGroup label="Số điện thoại *" icon={<Phone size={16} />} placeholder="Nhập số điện thoại" type="tel" />
        <InputGroup label="Email" icon={<Mail size={16} />} placeholder="Địa chỉ email (không bắt buộc)" type="email" />
      </div>
    </motion.div>
  );
}