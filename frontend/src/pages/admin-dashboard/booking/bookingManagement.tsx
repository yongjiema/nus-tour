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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as dataProviders from "../../../dataProvider";
import { CrudFilters } from "@refinedev/core";
import { BookingStatus } from "../../../../../backend/src/database/entities/enums";

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

const TourCompletedButton = styled(Button)({
  backgroundColor: "orange",
  color: "white",
  "&:hover": { backgroundColor: "darkorange" },
});
// Interface for booking data
interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  groupSize: number;
  deposit: number;
  timeSlot: string;
  hasFeedback: boolean;
  createdAt: Date;
  status: BookingStatus;
}

const BookingManagement = () => {
  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    status: BookingStatus;
    actionName: string;
  } | null>(null);

  // Open confirmation dialog
  const openConfirmDialog = (id: string, status: BookingStatus, actionName: string) => {
    setConfirmAction({ id, status, actionName });
    setConfirmDialogOpen(true);
  };

  const clearFilters = () => {
    // Clear all filter states
    setSearch("");
    setBookingStatusFilter("");
    setDateFilter("");
    if (document.getElementById("hidden-date-input")) {
      (document.getElementById("hidden-date-input") as HTMLInputElement).value = "";
    }

    // Reload all bookings
    fetchBookings();
  };
  // Handle confirmed action
  const handleConfirm = async () => {
    if (confirmAction) {
      try {
        await dataProviders.default.custom({
          url: `admin/bookings/${confirmAction.id}/status`,
          method: "post",
          payload: { status: confirmAction.status },
        });
        fetchBookings();
        setConfirmDialogOpen(false);
      } catch (error) {
        console.error(`Error ${confirmAction.actionName}:`, error);
        setError(`Failed to ${confirmAction.actionName.toLowerCase()}.`);
      }
    }
  };
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
        console.log("Adding search filter:", search);
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
        filters: filters,
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
        payload: { status: BookingStatus.CONFIRMED },
      });
      fetchBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError("Failed to confirm booking.");
    }
  };
  const changeStatus = async (id: string, status: BookingStatus) => {
    try {
      await dataProviders.default.custom({
        url: `admin/bookings/${id}/status`,
        method: "post",
        payload: { status: status },
      });
      fetchBookings();
    } catch (error) {
      console.error("Error confirming payment:", error);
      setError("Failed to confirm payment.");
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
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              // Focus on a hidden date input when button is clicked
              const dateInput = document.getElementById("hidden-date-input");
              if (dateInput) dateInput.click();
            }}
            sx={{
              justifyContent: "flex-start",
              height: "56px",
              padding: "8px 14px",
              border: "1px solid rgba(0, 0, 0, 0.23)",
              color: dateFilter ? "text.primary" : "text.secondary",
            }}
          >
            <span>{dateFilter || "Select a date to filter bookings"}</span>
            <input
              id="hidden-date-input"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </Button>
          <InputLabel
            shrink
            sx={{
              position: "absolute",
              top: "-6px",
              left: "14px",
              backgroundColor: "white",
              padding: "0 4px",
            }}
          >
            Filter by Date
          </InputLabel>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={filterBookings}>
            Apply Filters
          </Button>
          <Button variant="contained" color="primary" onClick={clearFilters}>
            Clear Filters
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
                <TableCell>Booking Status</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.email}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.timeSlot}</TableCell>
                  <TableCell>{booking.groupSize}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{booking.hasFeedback ? "Yes" : "NA"}</TableCell>
                  <TableCell>
                    {booking.status === BookingStatus.AWAITING_PAYMENT && (
                      <Grid container spacing={2} direction="row">
                        <Grid item>
                          <ConfirmPaymentButton
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.PAID, "Confirm Payment")}
                          >
                            Confirm Payment
                          </ConfirmPaymentButton>
                        </Grid>
                        <Grid item>
                          <RemoveButton
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.CANCELLED, "Cancel Booking")}
                          >
                            Cancel Booking
                          </RemoveButton>
                        </Grid>
                      </Grid>
                    )}
                    {booking.status === BookingStatus.PAID && (
                      <Grid container spacing={2} direction="row">
                        <Grid item>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.CONFIRMED, "Confirm Payment")}
                          >
                            Confirm Booking
                          </Button>
                        </Grid>
                        <Grid item>
                          <RemoveButton
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.REFUNDED, "Payment Refunded")}
                          >
                            Payment Refunded
                          </RemoveButton>
                        </Grid>
                        <Grid item>
                          <RemoveButton
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.CANCELLED, "Cancel Booking")}
                          >
                            Cancel Booking
                          </RemoveButton>
                        </Grid>
                      </Grid>
                    )}
                    {booking.status === BookingStatus.CONFIRMED && (
                      <Grid container spacing={2} direction="row">
                        <Grid item>
                          <CheckInButton
                            onClick={() => openConfirmDialog(booking.id, BookingStatus.CHECKED_IN, "Check In")}
                          >
                            Check In
                          </CheckInButton>
                        </Grid>
                        <Grid item>
                          <RemoveButton onClick={() => openConfirmDialog(booking.id, BookingStatus.NO_SHOW, "No Show")}>
                            No Show
                          </RemoveButton>
                        </Grid>
                      </Grid>
                    )}
                    {booking.status === BookingStatus.CHECKED_IN && (
                      <TourCompletedButton
                        onClick={() => openConfirmDialog(booking.id, BookingStatus.COMPLETED, "Tour Completed")}
                      >
                        Tour Completed
                      </TourCompletedButton>
                    )}

                    {booking.status === BookingStatus.COMPLETED && (
                      <RemoveButton
                        onClick={() => openConfirmDialog(booking.id, BookingStatus.REFUNDED, "Payment Refunded")}
                      >
                        Payment Refunded
                      </RemoveButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmAction?.actionName.toLowerCase()} this booking?
            {confirmAction?.status === BookingStatus.CANCELLED && <strong> This action cannot be undone.</strong>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default BookingManagement;
