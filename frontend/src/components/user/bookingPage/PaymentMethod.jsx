import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, Banknote } from 'lucide-react';
// Import PaymentRow vào đây

function PaymentRow({ id, selected, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
        ${selected
          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(125,211,252,0.05)]'
          : 'border-outline-variant/30 bg-surface-variant/10 hover:bg-surface-variant/20 hover:border-outline-variant'}
      `}
    >
      <div className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${selected ? 'border-primary' : 'border-outline-variant'}
      `}>
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2.5 h-2.5 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </div>
      <div className={`flex items-center gap-3 ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>
        {icon}
        <span className={`font-bold text-sm ${selected ? 'text-on-surface' : ''}`}>{label}</span>
      </div>
    </button>
  );
}


export default function PaymentMethods({ paymentMethod, setPaymentMethod }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
        <CreditCard size={18} className="text-primary" />
        Phương thức thanh toán
      </h3>
      <div className="space-y-3">
        <PaymentRow 
          id="momo" selected={paymentMethod === 'momo'} 
          onClick={() => setPaymentMethod('momo')}
          icon={<Wallet size={20} />} label="Ví MoMo / ZaloPay" 
        />
        <PaymentRow 
          id="atm" selected={paymentMethod === 'atm'} 
          onClick={() => setPaymentMethod('atm')}
          icon={<CreditCard size={20} />} label="Thẻ ATM nội địa" 
        />
        <PaymentRow 
          id="cash" selected={paymentMethod === 'cash'} 
          onClick={() => setPaymentMethod('cash')}
          icon={<Banknote size={20} />} label="Tiền mặt tại bến" 
        />
      </div>
    </motion.div>
  );
}