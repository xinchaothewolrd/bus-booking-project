// import React, { useState, useMemo, useEffect } from 'react';
// import { motion } from "framer-motion";
// import { ArrowLeft } from 'lucide-react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getTripById } from '../../services/tripService'
// import useAuthStore from "../../store/useAuthStore";
// import { getSeatByTripId } from "../../services/tripSeat";
// import { holdSeat, releaseSeat } from '../../services/tripSeat';
// import { createBooking } from '../../services/bookingService';
// import { createVnpayUrl } from '../../services/paymentService';
// import { getRouteStopByRouteId } from '../../services/routeStopService';

// // Import dàn đệ tử mày vừa tạo vào đây
// import SeatMap from '../../components/user/bookingPage/SeatMap';
// import PassengerForm from '../../components/user/bookingPage/PassengerForm';
// import OrderSummary from '../../components/user/bookingPage/OrderSummary';
// import LocationPicker from '../../components/user/bookingPage/LocationPicker';


// export default function BookingPage() {
//   // Thằng App chỉ làm nhiệm vụ quản lý State thôi
//   // const [selectedSeats, setSelectedSeats] = useState([]);
//   const [deck, setDeck] = useState('lower');
//   const [paymentMethod, setPaymentMethod] = useState('momo');
//   const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
//   const { tripId } = useParams();
//   const [trip, setTrip] = useState();
//   const [loading, setLoading] = useState(false);
//   const { isLoading: authLoading } = useAuthStore();
//   const user = useAuthStore((s) => s.user);
//   const [seatsFromApi, setSeatsFromApi] = useState([]);
//   const [seatPrice, setSeatPrice] = useState();
//   const navigate = useNavigate(); // Dùng để chuyển trang
//   const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái nút bấm
//   const [selectedPickup, setSelectedPickup] = useState(null);
//   const [selectedDropoff, setSelectedDropoff] = useState(null);
//   const [locations, setLocations] = useState({ pickup: [], dropoff: [] });

//   const storageKey = `booking_trip_${tripId}`;
//   const [selectedSeats, setSelectedSeats] = useState(() => {
//     const saved = localStorage.getItem(storageKey);
//     return saved ? JSON.parse(saved) : [];
//   });




//   const layout = trip?.bus?.busType?.seatLayout;

//   useEffect(() => {
//     const fetchTripAndStops = async () => {
//       try {
//         if (!tripId || authLoading) return;

//         setLoading(true);
//         // Gọi lấy thông tin chuyến đi trước
//         const tripRes = await getTripById(tripId);
//         const currentTrip = tripRes.data;
//         setTrip(currentTrip);
//         setSeatPrice(currentTrip.price);

//         // Lấy được trip rồi thì bốc routeId ra để gọi bến đón/trả
//         // Tùy database của mày lưu là routeId hay route.id nhé, tao ví dụ currentTrip.routeId
//         const actualRouteId = currentTrip.routeId || currentTrip.route?.id; 

//         if (actualRouteId) {
//           const stopsRes = await getRouteStopByRouteId(actualRouteId);
//           const allStops = stopsRes.data; // Mảng data từ API của mày

//           const baseTime = new Date(currentTrip.departureTime).getTime();

//           const pickups = [];
//           const dropoffs = [];

//           // Xào nấu lại data cho đúng chuẩn giao diện LocationPicker cần
//           allStops.forEach(stop => {
//             // Tính giờ đến bến = Giờ đi + số phút chênh lệch (arriveOffsetMinutes)
//             const stopTime = new Date(baseTime + stop.arriveOffsetMinutes * 60000);
//             const timeStr = stopTime.toLocaleTimeString("vi-VN", {
//               hour: "2-digit",
//               minute: "2-digit"
//             });

//             const formattedStop = {
//               id: stop.id,
//               name: stop.stopName,
//               address: stop.address,
//               time: timeStr,
//               order: stop.stopOrder // Lưu lại order nếu sau này cần sort
//             };

//             if (stop.stopType === "pickup") {
//               pickups.push(formattedStop);
//             } else if (stop.stopType === "dropoff") {
//               dropoffs.push(formattedStop);
//             }
//           });

//           // Sort nhẹ theo thứ tự stopOrder cho nó trôi chảy từ đầu bến đến cuối bến
//           pickups.sort((a, b) => a.order - b.order);
//           dropoffs.sort((a, b) => a.order - b.order);

//           // Đập vào state
//           setLocations({ pickup: pickups, dropoff: dropoffs });
//         }

//       } catch (error) {
//         console.error("Lỗi tải dữ liệu chuyến đi hoặc bến xe:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTripAndStops();
//   }, [tripId, authLoading]);


//   // Tách hàm này ra ngoài useEffect
//   const fetchSeats = async () => {
//     try {
//       if (!tripId || authLoading) return;
//       const res = await getSeatByTripId(tripId);
//       setSeatsFromApi(res.data);
//     } catch (err) {
//       console.error("Lỗi lấy danh sách ghế:", err);
//     }
//   };

//   // Vẫn gọi trong useEffect lần đầu tiên vào trang
//   useEffect(() => {
//     fetchSeats();
//   }, [tripId, authLoading]);

//   useEffect(() => {
//     localStorage.setItem(storageKey, JSON.stringify(selectedSeats));
//   }, [selectedSeats, storageKey]);

// const mappedSeats = useMemo(() => {
//     if (!seatsFromApi) return [];

//     return seatsFromApi.map(seat => {
//       const actualSeatId = seat.seatNumber || seat.seat_number;
      
//       let finalStatus = seat.status;
      
//       // Nếu database báo là booked rồi thì chịu, mất ghế!
//       if (seat.status === "booked") {
//         finalStatus = "booked";
//       } 
//       // Nếu nằm trong danh sách mình đang giữ ở trình duyệt này -> tô màu xanh
//       else if (selectedSeats.includes(actualSeatId)) {
//         finalStatus = "selected";
//       }

//       return {
//         id: actualSeatId,
//         status: finalStatus,
//       };
//     });
//   }, [seatsFromApi, selectedSeats]);

// const toggleSeat = async (id) => {
//     const seat = seatsFromApi.find(s => s.seatNumber === id);

//     if (seat?.status === "booked" || (seat?.status === "pending" && !selectedSeats.includes(id))) {
//       return; 
//     }

//     const isSelecting = !selectedSeats.includes(id);

//     try {
//       if (isSelecting) {
//         // Gọi API giữ ghế
//         await holdSeat({ tripId, seatNumbers: [id] });

//         setSelectedSeats(prev => [...prev, id]);
//         setSeatsFromApi(prev => prev.map(s => 
//           s.seatNumber === id ? { ...s, status: 'pending' } : s
//         ));

//       } else {
//         // Gọi API nhả ghế
//         await releaseSeat({ tripId, seatNumbers: [id] });

//         setSelectedSeats(prev => prev.filter(s => s !== id));
//         setSeatsFromApi(prev => prev.map(s => 
//           s.seatNumber === id ? { ...s, status: 'available' } : s
//         ));
//       }
//     } catch (error) {
//       console.error("Biến căng lúc chọn ghế:", error);
      
//       // Hiển thị lỗi từ backend (nếu có)
//       const errorMsg = error.response?.data?.message || "Lỗi xử lý ghế, vui lòng thử lại!";
//       alert(errorMsg);
      
//       // 🔥 QUAN TRỌNG: Gọi lại API lấy ghế để cập nhật UI mới nhất
//       fetchSeats(); 
//     }
//   };

// const handleCheckout = async () => {
//     // 1. Validate trước khi gọi API
//     if (selectedSeats.length === 0) return alert("Bạn chưa chọn ghế nào!");
//     if (!selectedPickup) return alert("Vui lòng chọn điểm đón!");
//     if (!selectedDropoff) return alert("Vui lòng chọn điểm trả!");
//     if (!formData.name.trim() || !formData.phone.trim()) {
//       return alert("Vui lòng điền họ tên và số điện thoại!");
//     }

//     setIsSubmitting(true);

//     try {
//       // 🔥 Tính luôn giá ở đây để gửi cho chuẩn
//       const currentTotalPrice = selectedSeats.length * seatPrice;

//       // 2. Nhào nặn dữ liệu vé kèm ID bến đón / trả
//       const ticketsPayload = selectedSeats.map(seatNumber => {
//         const seatInfo = seatsFromApi.find(s => (s.seatNumber || s.seat_number) === seatNumber);
//         return {
//           tripSeatId: seatInfo.id,
//           passengerName: formData.name,
//           passengerPhone: formData.phone,
//           // Bơm thêm 2 thằng này vào cho Backend nó nể
//           pickupStopId: typeof selectedPickup === 'object' ? selectedPickup?.id : selectedPickup,
//           dropoffStopId: typeof selectedDropoff === 'object' ? selectedDropoff?.id : selectedDropoff
//         };
//       });
      
//       const payload = {
//         userId: user?.id, 
//         tripId: parseInt(tripId),
//         totalAmount: currentTotalPrice,
//         tickets: ticketsPayload
//       };

//       // 3. GỌI API BACKEND TẠO BOOKING
//       const res = await createBooking(payload);
      
//       // Lấy bookingId từ response (hàm backend mày trả về data: fullBooking)
//       const newBookingId = res.data.data.id; 

//       // 4. TẠO LINK VNPAY: Gọi tiếp API đẻ link thanh toán
//       const vnpayRes = await createVnpayUrl({
//          bookingId: newBookingId,
//          amount: currentTotalPrice,
//          bankCode: '' 
//       });

//       const paymentUrl = vnpayRes.data.paymentUrl;
      
//       // Xóa ghế đang lưu tạm trong localStorage vì đã chốt đơn thành công
//       localStorage.removeItem(storageKey); 
      
//       // 🚀 Phóng thẳng sang cổng thanh toán VNPay
//       window.location.href = paymentUrl;

//     } catch (error) {
//       console.error("💥 Lỗi đặt vé:", error);
//       // Bắt chính xác câu thông báo lỗi từ backend trả về
//       const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi tạo hóa đơn.";
//       alert(errorMsg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const totalPrice = selectedSeats.length * seatPrice;

//   return (
//     <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/30">
//       {/* Background bay bổng của mày tao giữ nguyên */}
//       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//         <motion.div 
//           animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
//           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
//           className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary blur-[100px]" 
//         />
//         <motion.div 
//           animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.04, 0.02] }}
//           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
//           className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-tertiary blur-[120px]" 
//         />
//       </div>

//       <header className="glass-elevated sticky top-0 z-50 px-6 py-4 border-b border-outline-variant flex items-center justify-between">
//       <div className="flex items-center gap-4">
//         <button className="w-10 h-10 rounded-full glass-button-primary flex items-center justify-center text-primary transition-transform hover:-translate-x-1">
//           <ArrowLeft size={20} />
//         </button>
//         <div className="flex flex-col">
//           <h1 className="text-xl font-bold text-on-surface leading-tight">{`Đặt vé: ${trip?.route?.departureLocation} - ${trip?.route?.arrivalLocation}`}</h1>
//           <span className="text-[10px] font-bold text-primary tracking-widest uppercase">OceanBus Premium</span>
//         </div>
//       </div>
//       <div className="hidden md:block text-sm font-medium text-on-surface-variant">
//         Chuyến đi:  
//         <span className="text-on-surface">
//           {trip?.departureTime
//             ? new Date(trip.departureTime).toLocaleString("vi-VN", {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 day: "2-digit",
//                 month: "2-digit",
//                 year: "numeric",
//               })
//             : "Đang tải..."}
//         </span>
//       </div>
//     </header>

//       <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* Cột trái: Sơ đồ ghế (7 cột) */}
//           <div className="lg:col-span-7">
//             <SeatMap 
//               seats={mappedSeats}
//               toggleSeat={toggleSeat}
//               deck={deck}
//               layout={layout}
//               setDeck={setDeck}
//             />
//           </div>

//           {/* Cột phải: Đón trả, Form, Thanh toán, Chốt đơn (5 cột) */}
//           <aside className="lg:col-span-5 space-y-6">
            
//             {/* 3. CHÈN BỘ CHỌN ĐIỂM ĐÓN TRẢ VÀO ĐÂY */}
//             <LocationPicker 
//               locations={locations} 
//               selectedPickup={selectedPickup}
//               setSelectedPickup={setSelectedPickup}
//               selectedDropoff={selectedDropoff}
//               setSelectedDropoff={setSelectedDropoff}
//             />

//             <PassengerForm formData={formData} setFormData={setFormData} />
            
//             <OrderSummary 
//               trip={trip} 
//               selectedSeats={selectedSeats} 
//               totalPrice={totalPrice} 
//               seatPrice={seatPrice}
//               onCheckout={handleCheckout} 
//               isSubmitting={isSubmitting}   
//             />
//           </aside>

//         </div>
//       </main>

//       <footer className="container mx-auto px-6 py-12 text-center text-on-surface-variant/40 text-xs">
//         <p>&copy; 2026 OceanBus Transport Services Group. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById } from '../../services/tripService';
import useAuthStore from "../../store/useAuthStore";
import { getSeatByTripId, holdSeat, releaseSeat } from "../../services/tripSeat";
import { createBooking } from '../../services/bookingService';
import { createVnpayUrl } from '../../services/paymentService';
import { getRouteStopByRouteId } from '../../services/routeStopService';

// 🔥 1. IMPORT SOCKET CLIENT VÀO ĐÂY
import { io } from 'socket.io-client';

// Import dàn đệ tử 
import SeatMap from '../../components/user/bookingPage/SeatMap';
import PassengerForm from '../../components/user/bookingPage/PassengerForm';
import OrderSummary from '../../components/user/bookingPage/OrderSummary';
import LocationPicker from '../../components/user/bookingPage/LocationPicker';

// 🔥 2. KẾT NỐI SOCKET (Để ngoài Component để không bị chớp giật khi render)
// Nhớ đổi cổng 3000 thành cổng Backend thật của mày
const socket = io('http://localhost:3000'); 

export default function BookingPage() {
  const [deck, setDeck] = useState('lower');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const { tripId } = useParams();
  const [trip, setTrip] = useState();
  const [loading, setLoading] = useState(false);
  const { isLoading: authLoading } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const [seatsFromApi, setSeatsFromApi] = useState([]);
  const [seatPrice, setSeatPrice] = useState();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [locations, setLocations] = useState({ pickup: [], dropoff: [] });

  const storageKey = `booking_trip_${tripId}`;
  const [selectedSeats, setSelectedSeats] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const layout = trip?.bus?.busType?.seatLayout;

  // Lấy data chuyến đi + bến
  useEffect(() => {
    const fetchTripAndStops = async () => {
      try {
        if (!tripId || authLoading) return;
        setLoading(true);
        const tripRes = await getTripById(tripId);
        const currentTrip = tripRes.data;
        setTrip(currentTrip);
        setSeatPrice(currentTrip.price);

        const actualRouteId = currentTrip.routeId || currentTrip.route?.id; 
        if (actualRouteId) {
          const stopsRes = await getRouteStopByRouteId(actualRouteId);
          const allStops = stopsRes.data; 
          const baseTime = new Date(currentTrip.departureTime).getTime();
          const pickups = [];
          const dropoffs = [];

          allStops.forEach(stop => {
            const stopTime = new Date(baseTime + stop.arriveOffsetMinutes * 60000);
            const timeStr = stopTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            const formattedStop = { id: stop.id, name: stop.stopName, address: stop.address, time: timeStr, order: stop.stopOrder };
            if (stop.stopType === "pickup") pickups.push(formattedStop);
            else if (stop.stopType === "dropoff") dropoffs.push(formattedStop);
          });

          pickups.sort((a, b) => a.order - b.order);
          dropoffs.sort((a, b) => a.order - b.order);
          setLocations({ pickup: pickups, dropoff: dropoffs });
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu chuyến đi hoặc bến xe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTripAndStops();
  }, [tripId, authLoading]);

  // Lấy data ghế
  const fetchSeats = async () => {
    try {
      if (!tripId || authLoading) return;
      const res = await getSeatByTripId(tripId);
      setSeatsFromApi(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách ghế:", err);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [tripId, authLoading]);

  // Lưu selected seats
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedSeats));
  }, [selectedSeats, storageKey]);

  // 🔥 3. ĂNG-TEN THU SÓNG SOCKET (Lắng nghe sự thay đổi ghế từ thằng khác)
  useEffect(() => {
    socket.on('SEAT_UPDATED', (data) => {
      // Bắt buộc check đúng chuyến xe tao đang xem thì tao mới cập nhật
      if (data.tripId === parseInt(tripId)) {
        setSeatsFromApi((prevSeats) => 
          prevSeats.map(seat => 
            (seat.seatNumber || seat.seat_number) === data.seatNumber 
              ? { ...seat, status: data.status } 
              : seat
          )
        );
      }
    });

    // Cleanup khi user thoát trang
    return () => {
      socket.off('SEAT_UPDATED');
    };
  }, [tripId]);

  const mappedSeats = useMemo(() => {
    if (!seatsFromApi) return [];
    return seatsFromApi.map(seat => {
      const actualSeatId = seat.seatNumber || seat.seat_number;
      let finalStatus = seat.status;
      
      if (seat.status === "booked") {
        finalStatus = "booked";
      } else if (selectedSeats.includes(actualSeatId)) {
        finalStatus = "selected";
      }

      return { id: actualSeatId, status: finalStatus };
    });
  }, [seatsFromApi, selectedSeats]);

  // 🔥 4. SỬA LẠI HÀM NÀY ĐỂ BÁO CÁO QUA SOCKET KHI MÌNH BẤM CHỌN GHẾ
  const toggleSeat = async (id) => {
    const seat = seatsFromApi.find(s => (s.seatNumber || s.seat_number) === id);

    if (seat?.status === "booked" || (seat?.status === "pending" && !selectedSeats.includes(id))) {
      return alert("Chậm tay rồi fen! Ghế này có thằng khác đang giữ."); 
    }

    const isSelecting = !selectedSeats.includes(id);

    try {
      if (isSelecting) {
        // Cập nhật giao diện lập tức
        setSelectedSeats(prev => [...prev, id]);
        setSeatsFromApi(prev => prev.map(s => (s.seatNumber || s.seat_number) === id ? { ...s, status: 'pending' } : s));
        
        // 🚀 Kêu lên Backend: Tao lấy ghế này nha!
        socket.emit('HOLD_SEAT', { tripId: parseInt(tripId), seatNumber: id });
        
        await holdSeat({ tripId, seatNumbers: [id] });
      } else {
        // Nhả ghế lập tức
        setSelectedSeats(prev => prev.filter(s => s !== id));
        setSeatsFromApi(prev => prev.map(s => (s.seatNumber || s.seat_number) === id ? { ...s, status: 'available' } : s));
        
        // 🚀 Kêu lên Backend: Tao nhả ghế này!
        socket.emit('RELEASE_SEAT', { tripId: parseInt(tripId), seatNumber: id });

        await releaseSeat({ tripId, seatNumbers: [id] });
      }
    } catch (error) {
      console.error("Biến căng lúc chọn ghế:", error);
      alert(error.response?.data?.message || "Lỗi xử lý ghế, vui lòng thử lại!");
      fetchSeats(); // Refresh nếu API xịt
    }
  };

  const handleCheckout = async () => {
    // ... (Giữ nguyên logic của mày)
    if (selectedSeats.length === 0) return alert("Bạn chưa chọn ghế nào!");
    if (!selectedPickup) return alert("Vui lòng chọn điểm đón!");
    if (!selectedDropoff) return alert("Vui lòng chọn điểm trả!");
    if (!formData.name.trim() || !formData.phone.trim()) {
      return alert("Vui lòng điền họ tên và số điện thoại!");
    }

    setIsSubmitting(true);

    try {
      const currentTotalPrice = selectedSeats.length * seatPrice;

      const ticketsPayload = selectedSeats.map(seatNumber => {
        const seatInfo = seatsFromApi.find(s => (s.seatNumber || s.seat_number) === seatNumber);
        return {
          tripSeatId: seatInfo.id,
          passengerName: formData.name,
          passengerPhone: formData.phone,
          pickupStopId: typeof selectedPickup === 'object' ? selectedPickup?.id : selectedPickup,
          dropoffStopId: typeof selectedDropoff === 'object' ? selectedDropoff?.id : selectedDropoff
        };
      });
      
      const payload = {
        userId: user?.id, 
        tripId: parseInt(tripId),
        totalAmount: currentTotalPrice,
        tickets: ticketsPayload
      };

      const res = await createBooking(payload);
      const newBookingId = res.data.data.id; 

      const vnpayRes = await createVnpayUrl({
         bookingId: newBookingId,
         amount: currentTotalPrice,
         bankCode: '' 
      });

      const paymentUrl = vnpayRes.data.paymentUrl;
      localStorage.removeItem(storageKey); 
      window.location.href = paymentUrl;

    } catch (error) {
      console.error("💥 Lỗi đặt vé:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo hóa đơn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/30">
        {/* GIỮ NGUYÊN HTML/UI CỦA MÀY */}
        {/* ... */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-tertiary blur-[120px]" />
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
          
          <div className="lg:col-span-7">
            <SeatMap 
              seats={mappedSeats}
              toggleSeat={toggleSeat}
              deck={deck}
              layout={layout}
              setDeck={setDeck}
            />
          </div>

          <aside className="lg:col-span-5 space-y-6">
            <LocationPicker 
              locations={locations} 
              selectedPickup={selectedPickup}
              setSelectedPickup={setSelectedPickup}
              selectedDropoff={selectedDropoff}
              setSelectedDropoff={setSelectedDropoff}
            />
            <PassengerForm formData={formData} setFormData={setFormData} />
            <OrderSummary 
              trip={trip} 
              selectedSeats={selectedSeats} 
              totalPrice={totalPrice} 
              seatPrice={seatPrice}
              onCheckout={handleCheckout} 
              isSubmitting={isSubmitting}   
            />
          </aside>

        </div>
      </main>

      <footer className="container mx-auto px-6 py-12 text-center text-on-surface-variant/40 text-xs">
        <p>&copy; 2026 OceanBus Transport Services Group. All rights reserved.</p>
      </footer>
    </div>
  );
}