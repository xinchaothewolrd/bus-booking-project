package com.ptithcm.bus_booking_android.ui.staff;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.ptithcm.bus_booking_android.R;
import com.ptithcm.bus_booking_android.data.api.ApiService;
import com.ptithcm.bus_booking_android.data.api.RetrofitClient;
import com.ptithcm.bus_booking_android.data.model.UserTicketsResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BoardingManifestActivity extends AppCompatActivity {

    private TextView tvTripInfo, tvTotal, tvCheckedIn, tvNotCheckedIn, tvEmptyState;
    private ProgressBar progressBar;
    private RecyclerView rvPassengers;
    private BoardingManifestAdapter adapter;

    private ApiService apiService;
    private int tripId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_boarding_manifest);

        tripId = getIntent().getIntExtra("trip_id", -1);

        apiService = RetrofitClient.getClient(this).create(ApiService.class);
        initViews();

        if (tripId != -1) {
            tvTripInfo.setText("Chuyến xe #" + tripId);
            loadManifest();
        } else {
            Toast.makeText(this, "Không nhận được mã chuyến xe", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    private void initViews() {
        tvTripInfo = findViewById(R.id.tvTripInfo);
        tvTotal = findViewById(R.id.tvTotal);
        tvCheckedIn = findViewById(R.id.tvCheckedIn);
        tvNotCheckedIn = findViewById(R.id.tvNotCheckedIn);
        tvEmptyState = findViewById(R.id.tvEmptyState);
        progressBar = findViewById(R.id.progressBar);
        
        rvPassengers = findViewById(R.id.rvPassengers);
        rvPassengers.setLayoutManager(new LinearLayoutManager(this));
        adapter = new BoardingManifestAdapter(new ArrayList<>());
        rvPassengers.setAdapter(adapter);
    }

    private void loadManifest() {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getTicketsByTrip(tripId).enqueue(new Callback<List<UserTicketsResponse>>() {
            @Override
            public void onResponse(Call<List<UserTicketsResponse>> call, Response<List<UserTicketsResponse>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    List<UserTicketsResponse> tickets = response.body();
                    
                    if (tickets.isEmpty()) {
                        tvEmptyState.setVisibility(View.VISIBLE);
                        rvPassengers.setVisibility(View.GONE);
                    } else {
                        tvEmptyState.setVisibility(View.GONE);
                        rvPassengers.setVisibility(View.VISIBLE);
                    }
                    
                    adapter.updateData(tickets);
                    
                    int total = tickets.size();
                    int checkedIn = 0;
                    int notCheckedIn = 0;
                    
                    for (UserTicketsResponse t : tickets) {
                        if ("used".equals(t.getStatus())) {
                            checkedIn++;
                        } else if ("unused".equals(t.getStatus())) {
                            notCheckedIn++;
                        }
                    }
                    
                    tvTotal.setText(String.valueOf(total));
                    tvCheckedIn.setText(String.valueOf(checkedIn));
                    tvNotCheckedIn.setText(String.valueOf(notCheckedIn));
                } else {
                    Toast.makeText(BoardingManifestActivity.this, "Lỗi khi lấy danh sách hành khách", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<UserTicketsResponse>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(BoardingManifestActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
