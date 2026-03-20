export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Chào mừng đến Bus Booking</h1>
        <p className="text-xl text-gray-600 mb-8">
          Đặt vé xe bus nhanh chóng, an toàn và tiết kiệm
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          Đặt vé ngay
        </button>
      </section>

      <section className="grid grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Giá rẻ nhất</h3>
          <p className="text-gray-600">Đảm bảo giá tốt nhất trên thị trường</p>
        </div>
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg mb-2">An toàn</h3>
          <p className="text-gray-600">
            Xe được kiểm tra định kỳ, lái xe giàu kinh nghiệm
          </p>
        </div>
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
          <p className="text-gray-600">
            Đội ngũ hỗ trợ khách hàng sẵn sàng giúp đỡ
          </p>
        </div>
      </section>
    </div>
  );
}
