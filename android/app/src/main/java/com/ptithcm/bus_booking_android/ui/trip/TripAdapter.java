package com.ptithcm.bus_booking_android.ui.trip;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.ptithcm.bus_booking_android.R;
import com.ptithcm.bus_booking_android.data.model.TripSearchResponse;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class TripAdapter extends RecyclerView.Adapter<TripAdapter.TripViewHolder> {

    private List<TripSearchResponse> tripList;
    private OnTripClickListener listener;

    public interface OnTripClickListener {
        void onTripClick(TripSearchResponse trip);
    }

    public void setOnTripClickListener(OnTripClickListener listener) {
        this.listener = listener;
    }

    public void setTripList(List<TripSearchResponse> tripList) {
        this.tripList = tripList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public TripViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_trip, parent, false);
        return new TripViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TripViewHolder holder, int position) {
        TripSearchResponse trip = tripList.get(position);
        
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onTripClick(trip);
            }
        });
        
        holder.tvBusType.setText(trip.getBusType());
        
        // Format price
        DecimalFormat formatter = new DecimalFormat("###,###,###");
        holder.tvPrice.setText(formatter.format(trip.getPrice()) + "đ");

        holder.tvDepartureLocation.setText(trip.getDepartureLocation());
        holder.tvArrivalLocation.setText(trip.getArrivalLocation());
        holder.tvDuration.setText(trip.getDuration());

        // Format times (e.g. 2026-06-14T08:00:00Z -> 08:00)
        holder.tvDepartureTime.setText(formatTime(trip.getDepartureTime()));
        holder.tvArrivalTime.setText(formatTime(trip.getArrivalTimeExpected()));
    }

    @Override
    public int getItemCount() {
        return tripList == null ? 0 : tripList.size();
    }

    private String formatTime(String isoString) {
        if (isoString == null) return "--:--";
        try {
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            Date date = isoFormat.parse(isoString);
            if (date == null) return isoString;
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
            return timeFormat.format(date);
        } catch (ParseException e) {
            try {
                SimpleDateFormat isoFormat2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault());
                Date date = isoFormat2.parse(isoString);
                if (date == null) return isoString;
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
                return timeFormat.format(date);
            } catch (ParseException ex) {
                return isoString;
            }
        }
    }

    static class TripViewHolder extends RecyclerView.ViewHolder {
        TextView tvBusType, tvPrice, tvDepartureTime, tvDepartureLocation, tvDuration, tvArrivalTime, tvArrivalLocation;

        public TripViewHolder(@NonNull View itemView) {
            super(itemView);
            tvBusType = itemView.findViewById(R.id.tvBusType);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvDepartureTime = itemView.findViewById(R.id.tvDepartureTime);
            tvDepartureLocation = itemView.findViewById(R.id.tvDepartureLocation);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            tvArrivalTime = itemView.findViewById(R.id.tvArrivalTime);
            tvArrivalLocation = itemView.findViewById(R.id.tvArrivalLocation);
        }
    }
}
