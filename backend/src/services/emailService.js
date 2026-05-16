import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 🔥 Khởi tạo con xe chở mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Hàm bắn email thông tin vé
 * @param {Object} data - Chứa email khách, tên khách, tuyến, giờ đi, ghế, mã QR...
 */
export const sendTicketEmail = async (data) => {
  try {
    const { 
      toEmail, 
      passengerName, 
      bookingCode, 
      routeName, 
      departureTime, 
      seats, 
      totalAmount 
    } = data;

    // Link API đẻ QR code tự động từ mã đặt chỗ
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode}`;

    // Giao diện HTML sang xịn mịn
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0284c7; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🌊 OCEANBUS PREMIUM</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">Xác nhận đặt vé thành công!</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; color: #333;">
          <p>Xin chào <strong>${passengerName}</strong>,</p>
          <p>Cảm ơn quý khách đã tin tưởng lựa chọn OceanBus. Dưới đây là thông tin vé điện tử của quý khách:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin: 20px 0;">
            <p style="margin: 5px 0;">🚏 <strong>Tuyến xe:</strong> ${routeName}</p>
            <p style="margin: 5px 0;">⏰ <strong>Khởi hành:</strong> ${departureTime}</p>
            <p style="margin: 5px 0;">💺 <strong>Số ghế:</strong> <span style="color: #0284c7; font-weight: bold;">${seats}</span></p>
            <p style="margin: 5px 0;">💵 <strong>Tổng tiền:</strong> ${totalAmount.toLocaleString('vi-VN')} VNĐ</p>
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;" />
            <p style="margin: 5px 0; text-align: center; font-size: 12px; color: #666;">MÃ VÉ ĐIỆN TỬ (SỬ DỤNG KHI LÊN XE)</p>
            <h2 style="text-align: center; color: #0284c7; margin: 5px 0 tracking-widest;">${bookingCode}</h2>
            <div style="text-align: center; margin-top: 10px;">
              <img src="${qrCodeUrl}" alt="QR Code" style="border: 2px solid #0284c7; padding: 5px; border-radius: 5px;" />
            </div>
          </div>

          <p style="font-size: 12px; color: #777;">⚠️ Vui lòng có mặt tại bến trước 30 phút để làm thủ tục lên xe. Khi đi nhớ mang theo điện thoại mở sẵn email này hoặc căn cước công dân.</p>
        </div>
        
        <div style="background-color: #e2e8f0; text-align: center; padding: 10px; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Hotline hỗ trợ: 1900 xxxx • Email: support@oceanbus.com</p>
        </div>
      </div>
    `;

    // Cấu hình gói hàng
    const mailOptions = {
      from: `"OceanBus Services" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[OceanBus] Xác nhận đặt vé - Mã chỗ: ${bookingCode}`,
      html: htmlContent,
    };

    // 🚀 Bấm nút phóng mail
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Bắn mail thành công:', info.messageId);
    return true;
  } catch (error) {
    console.error('💥 Lỗi khi gửi mail:', error);
    return false;
  }
};