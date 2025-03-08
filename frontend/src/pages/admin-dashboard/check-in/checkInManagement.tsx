import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Typography, TextField, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as dataProviders from "../../../dataProvider";
import { CrudFilters } from "@refinedev/core";

const CheckInButton = styled(Button)({
  backgroundColor: "green",
  color: "white",
  "&:hover": {
    backgroundColor: "darkgreen",
  },
});

const CheckOutButton = styled(Button)({
  backgroundColor: "orange",
  color: "white",
  "&:hover": {
    backgroundColor: "darkorange",
  },
});

interface Booking {
  bookingId: string;
  name: string;
  email: string;
  date: string;
  timeSlot: string;
  groupSize: number;
  bookingStatus: string;
  checkedIn: boolean;
}

const CheckInManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await dataProviders.default.getList({
        resource: "admin/bookings/findAll",
        metaData: {
          filters: [{ field: "bookingStatus", operator: "eq", value: "confirmed" }]
        }
      });

      setBookings(data as unknown as Booking[]);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings.");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 100000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const filterBookings = async () => {
    try {
      const filters: CrudFilters = [];

      if (search) {
        filters.push({
          field: "q",
          operator: "eq",
          value: search
        });
      }

      if (dateFilter) {
        filters.push({
          field: "date",
          operator: "eq",
          value: dateFilter
        });
      }

      const { data } = await dataProviders.default.getList({
        resource: "admin/bookings",
        filters: filters,
      });

      setBookings(data as unknown as Booking[]);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings.");
    }
  };

  const checkInBooking = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}/checkin`,
        method: "patch"
      });

      fetchBookings();
    } catch (error) {
      console.error("Error checking in booking:", error);
      setError("Failed to check in booking.");
    }
  };

  const checkOutBooking = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}/checkout`,
        method: "patch"
      });

      fetchBookings();
    } catch (error) {
      console.error("Error checking out booking:", error);
      setError("Failed to check out booking.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Check-In Management</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search by Name or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Filter by Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            onClick={filterBookings}
            fullWidth
            sx={{ height: "100%" }}
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Group Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.bookingId}>
                  <TableCell>{booking.bookingId}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.email}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.timeSlot}</TableCell>
                  <TableCell>{booking.groupSize}</TableCell>
                  <TableCell>{booking.checkedIn ? "Checked In" : "Not Checked In"}</TableCell>
                  <TableCell>
                    {!booking.checkedIn ? (
                      <CheckInButton onClick={() => checkInBooking(booking.bookingId)}>
                        Check In
                      </CheckInButton>
                    ) : (
                      <CheckOutButton onClick={() => checkOutBooking(booking.bookingId)}>
                        Check Out
                      </CheckOutButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default CheckInManagement; 