import React, { useState } from "react";
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useAdminBookings, useAdminUpdateBookingStatus } from "../../../hooks";
import { DashboardContainer } from "../../../components/shared/dashboard";
import { DestructiveButton } from "../../../components/shared/ui";
import type { Booking } from "../../../types/api.types";

export const AdminBookingManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingAction, setPendingAction] = useState<{ bookingId: string; action: string; booking: Booking } | null>(
    null,
  );

  const { data: bookingsData, isLoading, error } = useAdminBookings();
  const { updateStatus, isPending: isUpdating } = useAdminUpdateBookingStatus();

  const bookings = bookingsData?.data ?? [];

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.id.toString().includes(searchLower) ||
      booking.date.toLowerCase().includes(searchLower) ||
      booking.timeSlot.toLowerCase().includes(searchLower) ||
      booking.status.toLowerCase().includes(searchLower)
    );
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string, booking: Booking) => {
    setPendingAction({ bookingId, action: newStatus, booking });
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      updateStatus(pendingAction.bookingId, {
        status: pendingAction.action,
      });
    }
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
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
        <CircularProgress size={60} thickness={4} />
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
    <DashboardContainer>
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

      {/* Bookings Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
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
                    <Chip
                      label={booking.status}
                      color={
                        booking.status === "completed"
                          ? "success"
                          : booking.status === "confirmed"
                          ? "primary"
                          : booking.status === "cancelled"
                          ? "error"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {booking.status === "confirmed" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => {
                            handleStatusUpdate(booking.id.toString(), "completed", booking);
                          }}
                          disabled={isUpdating}
                        >
                          Complete
                        </Button>
                      )}
                      {booking.status !== "cancelled" && (
                        <DestructiveButton
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            handleStatusUpdate(booking.id.toString(), "cancelled", booking);
                          }}
                          disabled={isUpdating}
                        >
                          Cancel
                        </DestructiveButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    {searchTerm ? <>No bookings found matching "{searchTerm}"</> : <>No bookings available</>}
                  </TableCell>
                </TableRow>
              )}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={!!pendingAction}
        onClose={handleCancelAction}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {pendingAction?.action === "cancelled" ? (
              <>
                Are you sure you want to cancel booking #{pendingAction.bookingId}?
                {pendingAction.booking.status === "confirmed" && (
                  <> This will permanently cancel the confirmed booking and may require refund processing.</>
                )}
                <br />
                <strong>This action cannot be undone.</strong>
              </>
            ) : pendingAction?.action === "completed" ? (
              <>
                Are you sure you want to mark booking #{pendingAction.bookingId} as completed? This indicates that the
                tour has been successfully completed.
              </>
            ) : (
              `Are you sure you want to change the status of booking #${pendingAction?.bookingId} to "${pendingAction?.action}"?`
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={pendingAction?.action === "cancelled" ? "error" : "primary"}
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={16} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};
