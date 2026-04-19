// setupAssociations.js - Setup tất cả associations giữa các models
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import Session from "../models/Session.js";
import Trip from "../models/Trip.js";
import TripSeat from "../models/TripSeat.js";
import RouteFare from "../models/RouteFare.js";
import PriceRule from "../models/PriceRule.js";

// ===== User Associations =====
User.hasMany(Booking, { foreignKey: "userId", as: "Bookings", onDelete: "CASCADE" });
User.hasMany(Session, { foreignKey: "userId", as: "Sessions", onDelete: "CASCADE" });

// ===== Booking Associations =====
Booking.belongsTo(User,    { foreignKey: "userId", as: "User" });
Booking.hasMany(Ticket,    { foreignKey: "bookingId", as: "Tickets", onDelete: "CASCADE" });
Booking.hasOne(Payment,    { foreignKey: "bookingId", as: "Payment", onDelete: "CASCADE" });
Booking.belongsTo(Trip,    { foreignKey: "tripId", as: "Trip" });

// ===== Ticket Associations =====
Ticket.belongsTo(Booking,  { foreignKey: "bookingId", as: "Booking" });
Ticket.belongsTo(TripSeat, { foreignKey: "tripSeatId", as: "Seat" });

// ===== Payment Associations =====
Payment.belongsTo(Booking, { foreignKey: "bookingId", as: "Booking" });

// ===== Session Associations =====
Session.belongsTo(User,    { foreignKey: "userId", as: "User" });

// ===== Trip Associations =====
Trip.hasMany(Booking,  { foreignKey: "tripId", as: "Bookings", onDelete: "CASCADE" });
Trip.hasMany(TripSeat, { foreignKey: "tripId", as: "Seats", onDelete: "CASCADE" });

// ===== TripSeat Associations =====
TripSeat.belongsTo(Trip,  { foreignKey: "tripId", as: "Trip" });
TripSeat.hasMany(Ticket,  { foreignKey: "tripSeatId", as: "Tickets", onDelete: "CASCADE" });

// ===== RouteFare Associations =====
// (route_fares has no direct model associations needed for existing features)

// ===== PriceRule Associations =====
// (price_rules has no direct model associations needed for existing features)

export { User, Booking, Ticket, Payment, Session, Trip, TripSeat, RouteFare, PriceRule };
