import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useAdminBookings, useAdminUpdateBookingStatus } from "../../../services/api";

const AdminCheckInManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: bookingsData, isLoading, error } = useAdminBookings();
  const { updateStatus, isPending: isUpdating } = useAdminUpdateBookingStatus();

  const bookings = bookingsData?.data ?? [];

  // Filter for confirmed bookings that need check-in
  const checkInBookings = bookings.filter((booking) => booking.status === "confirmed");

  const filteredBookings = checkInBookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.id.toString().includes(searchLower) ||
      booking.date.toLowerCase().includes(searchLower) ||
      booking.timeSlot.toLowerCase().includes(searchLower)
    );
  });

  const handleCheckIn = (bookingId: string) => {
    updateStatus(bookingId, {
      status: "completed",
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load bookings. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Check-In Management
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage check-ins for confirmed bookings. Mark bookings as completed when participants arrive.
      </Alert>

      {/* Search */}
      <Box mb={3}>
        <TextField
          placeholder="Search bookings..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchTerm("");
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Check-in Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Group Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.timeSlot}</TableCell>
                  <TableCell>{booking.groupSize}</TableCell>
                  <TableCell>
                    <Chip label={booking.status} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        handleCheckIn(booking.id.toString());
                      }}
                      disabled={isUpdating}
                    >
                      Check In
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredBookings.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No confirmed bookings found for check-in.
        </Alert>
      )}
    </Box>
  );
};

export default AdminCheckInManagement;
