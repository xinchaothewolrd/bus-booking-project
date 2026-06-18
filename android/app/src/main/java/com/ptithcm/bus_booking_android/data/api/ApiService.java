package com.ptithcm.bus_booking_android.data.api;

import com.ptithcm.bus_booking_android.data.model.LoginRequest;
import com.ptithcm.bus_booking_android.data.model.LoginResponse;
import com.ptithcm.bus_booking_android.data.model.SignupRequest;
import com.ptithcm.bus_booking_android.data.model.RouteResponse;
import com.ptithcm.bus_booking_android.data.model.TripSearchResponse;
import com.ptithcm.bus_booking_android.data.model.TripSeatResponse;
import com.ptithcm.bus_booking_android.data.model.BusTypeResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import retrofit2.http.Path;
import com.ptithcm.bus_booking_android.data.model.RouteStopResponse;

public interface ApiService {
    
    @POST("auth/signin")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/signup")
    Call<Void> register(@Body SignupRequest request);

    @GET("routes")
    Call<List<RouteResponse>> getRoutes();

    @GET("route-stops/routes/{routeId}")
    Call<List<RouteStopResponse>> getRouteStops(@Path("routeId") int routeId);

    @GET("trips/search")
    Call<List<TripSearchResponse>> searchTrips(
            @Query("from") String from,
            @Query("to") String to,
            @Query("date") String date
    );

    @GET("trip-seats/trip/{tripId}")
    Call<List<TripSeatResponse>> getSeatsByTripId(@retrofit2.http.Path("tripId") int tripId);

    @GET("users/me")
    Call<com.ptithcm.bus_booking_android.data.model.UserResponse> getProfile();

    @GET("bus-types")
    Call<List<BusTypeResponse>> getBusTypes();

    @POST("bookings")
    Call<com.ptithcm.bus_booking_android.data.model.BookingResponse> createBooking(@Body com.ptithcm.bus_booking_android.data.model.BookingRequest request);

    @POST("payments/create_url")
    Call<com.ptithcm.bus_booking_android.data.model.PaymentUrlResponse> createPaymentUrl(@Body com.ptithcm.bus_booking_android.data.model.PaymentUrlRequest request);

    @GET("tickets/user/{userId}")
    Call<List<com.ptithcm.bus_booking_android.data.model.UserTicketsResponse>> getUserTickets(@Path("userId") int userId);

    @POST("bookings/{bookingId}/cancel")
    Call<com.ptithcm.bus_booking_android.data.model.MessageResponse> cancelBooking(@Path("bookingId") int bookingId);
}
