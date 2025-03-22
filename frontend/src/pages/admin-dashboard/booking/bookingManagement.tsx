import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as dataProviders from "../../../dataProvider";
import { CrudFilters } from "@refinedev/core";
import { PaymentStatus, BookingStatus } from "../../../../../backend/src/database/entities/enums";

// Styled components for buttons
const RemoveButton = styled(Button)({
  backgroundColor: "red",
  color: "white",
  "&:hover": { backgroundColor: "darkred" },
});

const CheckInButton = styled(Button)({
  backgroundColor: "green",
  color: "white",
  "&:hover": { backgroundColor: "darkgreen" },
});

const ConfirmPaymentButton = styled(Button)({
  backgroundColor: "blue",
  color: "white",
  "&:hover": { backgroundColor: "darkblue" },
});

// Interface for booking data
interface Booking {
  bookingId: string;
  name: string;
  email: string;
  date: string;
  groupSize: number;
  deposit: number;
  timeSlot: string;
  hasFeedback: boolean;
  createdAt: Date;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
}

const BookingManagement = () => {
  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await dataProviders.default.getList({
        resource: "admin/bookings",
        filters: undefined, // Remove empty filters array
        pagination: {
          current: 1,
          pageSize: 100, // Adjust based on your needs
        },
      });

      console.log("Fetched bookings:", data); // Debug log
      setBookings(data as unknown as Booking[]);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings.");
    }
  }, []);

  // // Initial fetch and polling with more reasonable interval
  // useEffect(() => {
  //   fetchBookings();
  //   const interval = setInterval(fetchBookings, 30000);

  //   // Cleanup function
  //   return () => {
  //     console.log('Clearing polling interval'); // Debug log
  //     clearInterval(interval);
  //   };
  // }, [fetchBookings]);
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings
  const filterBookings = async () => {
    try {
      const filters: CrudFilters = [];

      if (search) {
        filters.push({
          field: "search",
          operator: "contains",
          value: search,
        });
      }
      if (bookingStatusFilter) {
        filters.push({
          field: "bookingStatus",
          operator: "eq",
          value: bookingStatusFilter,
        });
      }
      if (paymentStatusFilter) {
        filters.push({
          field: "paymentStatus",
          operator: "eq",
          value: paymentStatusFilter,
        });
      }
      if (dateFilter) {
        filters.push({
          field: "date",
          operator: "eq",
          value: dateFilter,
        });
      }

      console.log("Sending filters:", filters);
      const { data } = await dataProviders.default.getList({
        resource: "admin/bookings",
        filters: filters, // pass the array directly
        pagination: {
          current: 1,
          pageSize: 100,
        },
      });

      console.log("Filtered data:", data);
      setBookings(data as unknown as Booking[]);
      setError(null);
    } catch (error) {
      console.error("Error filtering bookings:", error);
      setError("Failed to filter bookings.");
    }
  };

  // Booking actions
  const confirmBooking = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}`,
        method: "post",
        payload: { bookingStatus: BookingStatus.CONFIRMED },
      });
      fetchBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError("Failed to confirm booking.");
    }
  };

  const confirmPayment = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}/payment`,
        method: "post",
        payload: { status: PaymentStatus.COMPLETED },
      });
      fetchBookings();
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError("Failed to confirm payment.");
    }
  };

  const checkInBooking = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}`,
        method: "post",
        payload: { bookingStatus: BookingStatus.COMPLETED },
      });
      fetchBookings();
    } catch (error) {
      console.error("Error checking in booking:", error);
      setError("Failed to check in booking.");
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Admin Booking Management
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={4} marginBottom={4}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Search by Booking ID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Booking Status</InputLabel>
            <Select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {Object.values(BookingStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {Object.values(PaymentStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="date"
            label="Filter by Date"
            InputLabelProps={{ shrink: true }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={filterBookings}>
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
                <TableCell>Payment Status</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Feedback</TableCell>
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
                  <TableCell>{booking.paymentStatus}</TableCell>
                  <TableCell>{booking.bookingStatus}</TableCell>
                  <TableCell>{booking.hasFeedback ? "Yes" : "NA"}</TableCell>
                  <TableCell>
                    {booking.paymentStatus === PaymentStatus.PENDING && (
                      <ConfirmPaymentButton onClick={() => confirmPayment(booking.bookingId)}>
                        Confirm Payment
                      </ConfirmPaymentButton>
                    )}
                    {booking.paymentStatus === PaymentStatus.COMPLETED &&
                      booking.bookingStatus === BookingStatus.PENDING && (
                        <CheckInButton onClick={() => confirmBooking(booking.bookingId)}>Confirm Booking</CheckInButton>
                      )}
                    {booking.paymentStatus === PaymentStatus.COMPLETED &&
                      booking.bookingStatus === BookingStatus.CONFIRMED && (
                        <CheckInButton onClick={() => checkInBooking(booking.bookingId)}>Check In</CheckInButton>
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

export default BookingManagement;
