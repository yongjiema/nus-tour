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

const RemoveButton = styled(Button)({
  backgroundColor: "red",
  color: "white",
  "&:hover": {
    backgroundColor: "darkred",
  },
});

const ChangeTimeSlotButton = styled(Button)({
  backgroundColor: "Green",
  color: "white",
  "&:hover": {
    backgroundColor: "darkblue",
  },
});

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
  deposit: number;
  hasFeedback: boolean;
  bookingStatus: string;
  createdAt: Date;
  paymentStatus: string;
  checkedIn: boolean;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await dataProviders.default.getList({
        resource: "admin/bookings/findAll",
        metaData: {},
      });

      // Type assertion to tell TypeScript that data matches your Booking interface
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
      // Create an array of filters, only including non-empty values
      const filters: CrudFilters = [];

      if (search) {
        filters.push({
          field: "q",
          operator: "eq",
          value: search,
        });
      }

      if (statusFilter) {
        filters.push({
          field: "status",
          operator: "eq",
          value: statusFilter,
        });
      }

      if (dateFilter) {
        filters.push({
          field: "date",
          operator: "eq",
          value: dateFilter,
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

  const updateBookingStatus = async (id: string, bookingStatus: string) => {
    try {
      await dataProviders.default.update({
        resource: "admin/bookings",
        id,
        variables: { status: bookingStatus },
      });

      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("Failed to update booking.");
    }
  };

  const removeBooking = async (id: string) => {
    try {
      await dataProviders.default.deleteOne({
        resource: "admin/bookings",
        id,
      });

      fetchBookings();
    } catch (error) {
      console.error("Error removing booking:", error);
      setError("Failed to remove booking.");
    }
  };

  const checkInBooking = async (id: string) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}/checkin`,
        method: "patch",
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
        method: "patch",
      });

      fetchBookings();
    } catch (error) {
      console.error("Error checking out booking:", error);
      setError("Failed to check out booking.");
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Admin Booking Management
      </Typography>

      {/* Error Message Display */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Search and Filters */}
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
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
              <MenuItem value="Checked-In">Checked-In</MenuItem>
              <MenuItem value="Success">Success</MenuItem>
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

      {/* Bookings Table */}
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
                  <TableCell>{booking.checkedIn ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {booking.paymentStatus === "pending" && (
                      <RemoveButton onClick={() => removeBooking(booking.bookingId)}>Remove</RemoveButton>
                    )}

                    {booking.paymentStatus === "pending" && (
                      <ChangeTimeSlotButton onClick={() => updateBookingStatus(booking.bookingId, "confirmed")}>
                        Confirm
                      </ChangeTimeSlotButton>
                    )}

                    {booking.paymentStatus === "success" && (
                      <CheckInButton onClick={() => checkInBooking(booking.bookingId)}>Check In</CheckInButton>
                    )}

                    {booking.paymentStatus === "checked-in" && (
                      <CheckOutButton onClick={() => checkOutBooking(booking.bookingId)}>Check Out</CheckOutButton>
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
