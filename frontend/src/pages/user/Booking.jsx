import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getTripById } from '../../services/tripService'
import useAuthStore from "../../store/useAuthStore";
import { getSeatByTripId } from "../../services/tripSeat";



// Import dàn đệ tử mày vừa tạo vào đây
import SeatMap from '../../components/user/bookingPage/SeatMap';
import PassengerForm from '../../components/user/bookingPage/PassengerForm';
import PaymentMethods from '../../components/user/bookingPage/PaymentMethod';
import OrderSummary from '../../components/user/bookingPage/OrderSummary';



export default function BookingPage() {
  // Thằng App chỉ làm nhiệm vụ quản lý State thôi
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [deck, setDeck] = useState('lower');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const { tripId } = useParams();
  const [trip, setTrip] = useState();
  const [loading, setLoading] = useState(false);
  const { isLoading: authLoading } = useAuthStore();
  const [seatsFromApi, setSeatsFromApi] = useState([]);
  const [seatPrice, setSeatPrice] = useState();


  const layout = trip?.bus?.busType?.seatLayout;

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        if (!tripId || authLoading) return; // 🔥 CHẶN TẠI ĐÂY

        setLoading(true);
        const res = await getTripById(tripId);
        setTrip(res.data);
        setSeatPrice(res.data.price)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, authLoading]);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        if (!tripId || authLoading) return;

        const res = await getSeatByTripId(tripId);
        setSeatsFromApi(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSeats();
  }, [tripId, authLoading]);

  // Logic tạo ghế giữ nguyên
  // const seats = useMemo(() => {
  //   const layout = ['A', 'B', 'C', 'D'];
  //   const rows = [1, 2, 3, 4, 5, 6];
  //   const generatedSeats = [];

  //   rows.forEach(row => {
  //     layout.forEach(col => {
  //       const id = `${col}${row}`;
  //       if (id === 'C6' || id === 'D6') return; 
  //       generatedSeats.push({
  //         id,
  //         status: INITIAL_OCCUPIED_SEATS.includes(id) 
  //           ? 'occupied' 
  //           : selectedSeats.includes(id) ? 'selected' : 'available'
  //       });
  //     });
  //   });
    
  //   ['C6', 'D6', 'E6'].forEach(id => {
  //     generatedSeats.push({
  //       id,
  //       status: selectedSeats.includes(id) ? 'selected' : 'available'
  //     });
  //   });

  //   return generatedSeats;
  // }, [selectedSeats]);

const mappedSeats = useMemo(() => {
  if (!seatsFromApi) return [];

  return seatsFromApi.map(seat => ({
    id: seat.seatNumber,
    status:
      selectedSeats.includes(seat.seatNumber)
        ? "selected"
        : seat.status, // 🔥 giữ nguyên: available | booked | pending
  }));
}, [seatsFromApi, selectedSeats]);

  const toggleSeat = (id) => {
    const seat = seatsFromApi.find(s => s.seatNumber === id);

    if (seat?.status === "booked" || seat?.status === "pending") return;

    setSelectedSeats(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/30">
      {/* Background bay bổng của mày tao giữ nguyên */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-tertiary blur-[120px]" 
        />
      </div>

      <header className="glass-elevated sticky top-0 z-50 px-6 py-4 border-b border-outline-variant flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full glass-button-primary flex items-center justify-center text-primary transition-transform hover:-translate-x-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-on-surface leading-tight">{`Đặt vé: ${trip?.route?.departureLocation} - ${trip?.route?.arrivalLocation}`}</h1>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">OceanBus Premium</span>
        </div>
      </div>
      <div className="hidden md:block text-sm font-medium text-on-surface-variant">
        Chuyến đi:  
        <span className="text-on-surface">
          {trip?.departureTime
            ? new Date(trip.departureTime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Đang tải..."}
        </span>
      </div>
    </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột trái: Sơ đồ ghế */}
          <SeatMap 
            seats={mappedSeats}
            toggleSeat={toggleSeat}
            deck={deck}
            layout={layout}
            setDeck={setDeck}
          />

          {/* Cột phải: Form, Thanh toán, Chốt đơn */}
          <aside className="lg:col-span-5 space-y-6">
            <PassengerForm formData={formData} setFormData={setFormData} />
            {/* <PaymentMethods paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} /> */}
            <OrderSummary trip={trip} selectedSeats={selectedSeats} totalPrice={totalPrice} seatPrice={seatPrice}/>
          </aside>

        </div>
      </main>

      <footer className="container mx-auto px-6 py-12 text-center text-on-surface-variant/40 text-xs">
        <p>&copy; 2026 OceanBus Transport Services Group. All rights reserved.</p>
      </footer>
    </div>
  );
}