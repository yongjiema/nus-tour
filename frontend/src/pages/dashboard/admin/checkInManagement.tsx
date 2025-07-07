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
  Typography,
  Tabs,
  Tab,
  Grid2 as Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import { useAdminBookings } from "../../../hooks";
import { useCustomMutation, useNotification, useInvalidate } from "@refinedev/core";
import { DashboardContainer } from "../../../components/shared/dashboard";
import { handleRefineError } from "../../../utils/errorHandler";

export const AdminCheckInManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [manualCheckinData, setManualCheckinData] = useState({ bookingId: "", email: "" });

  const { data: bookingsData, isLoading, error } = useAdminBookings();
  const { mutate: checkinMutation, isPending: isCheckinPending } = useCustomMutation();
  const { open } = useNotification();
  const invalidate = useInvalidate();

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

  const handleManualCheckin = () => {
    if (!manualCheckinData.bookingId || !manualCheckinData.email) {
      open?.({
        message: "Please enter both Booking ID and Email",
        type: "error",
      });
      return;
    }

    checkinMutation(
      {
        url: "checkins",
        method: "post",
        values: manualCheckinData,
        errorNotification: false, // Disable Refine's built-in error notification
      },
      {
        onSuccess: () => {
          open?.({
            message: "Check-in successful!",
            type: "success",
          });
          setManualCheckinData({ bookingId: "", email: "" });
          // Invalidate relevant caches to refresh data
          void invalidate({
            resource: "admin/bookings",
            invalidates: ["list"],
          });
          void invalidate({
            resource: "bookings/user",
            invalidates: ["list"],
          });
        },
        onError: (error) => {
          handleRefineError(error, open);
        },
      },
    );
  };

  // QR code data interface
  interface QRCodeData {
    bookingId: string;
    email: string;
    type: string;
  }

  const _handleQRScanned = (data: string) => {
    try {
      const qrData: QRCodeData = JSON.parse(data) as QRCodeData;
      if (qrData.bookingId && qrData.email && qrData.type === "checkin") {
        setManualCheckinData({
          bookingId: qrData.bookingId,
          email: qrData.email,
        });
        setShowQRScanner(false);

        // Auto-submit the check-in
        checkinMutation(
          {
            url: "checkins",
            method: "post",
            values: {
              bookingId: qrData.bookingId,
              email: qrData.email,
            },
            errorNotification: false, // Disable Refine's built-in error notification
          },
          {
            onSuccess: () => {
              open?.({
                message: "QR Code check-in successful!",
                type: "success",
              });
              // Invalidate relevant caches to refresh data
              void invalidate({
                resource: "admin/bookings",
                invalidates: ["list"],
              });
              void invalidate({
                resource: "bookings/user",
                invalidates: ["list"],
              });
            },
            onError: (error) => {
              const message = handleRefineError(error, open);
              console.error("QR Check-in error:", message);
            },
          },
        );
      } else {
        open?.({
          message: "Invalid QR code format",
          type: "error",
        });
      }
    } catch {
      open?.({
        message: "Unable to parse QR code",
        type: "error",
      });
    }
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
      <Alert severity="info" sx={{ mb: 3 }}>
        Manage check-ins for confirmed bookings. Use QR scanner for quick check-in or enter details manually.
      </Alert>

      {/* Check-in Method Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue: number) => {
            setTabValue(newValue);
          }}
        >
          <Tab label="QR Scanner" />
          <Tab label="Manual Entry" />
          <Tab label="Bookings List" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the button below to open the QR scanner and scan a participant's check-in QR code.
          </Typography>
          <Button
            variant="contained"
            startIcon={<QrCodeScannerIcon />}
            onClick={() => {
              setShowQRScanner(true);
            }}
            disabled={isCheckinPending}
          >
            Open QR Scanner
          </Button>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Manual Check-in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the booking ID and email manually if QR scanning is not available.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Booking ID"
                value={manualCheckinData.bookingId}
                onChange={(e) => {
                  setManualCheckinData({ ...manualCheckinData, bookingId: e.target.value });
                }}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email Address"
                type="email"
                value={manualCheckinData.email}
                onChange={(e) => {
                  setManualCheckinData({ ...manualCheckinData, email: e.target.value });
                }}
                fullWidth
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleManualCheckin}
                disabled={isCheckinPending || !manualCheckinData.bookingId || !manualCheckinData.email}
                startIcon={<CheckCircleIcon />}
              >
                {isCheckinPending ? "Processing..." : "Check In"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 2 && (
        <>
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
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setManualCheckinData({
                              bookingId: booking.id.toString(),
                              email: booking.email || "",
                            });
                            setTabValue(1); // Switch to manual entry tab
                          }}
                          disabled={isCheckinPending}
                        >
                          Check In
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        {searchTerm ? (
                          <>No confirmed bookings found matching "{searchTerm}"</>
                        ) : (
                          <>No confirmed bookings available for check-in</>
                        )}
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

          {filteredBookings.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No confirmed bookings found for check-in.
            </Alert>
          )}
        </>
      )}

      {/* QR Scanner Dialog */}
      <Dialog
        open={showQRScanner}
        onClose={() => {
          setShowQRScanner(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code Scanner</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Position the QR code within the camera frame to scan.
          </Typography>
          {/* Note: You'll need to add a QR scanner library like react-qr-scanner */}
          <Box
            sx={{
              height: 300,
              border: "2px dashed",
              borderColor: "grey.300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              QR Scanner Component
              <br />
              (Integration with camera library needed)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowQRScanner(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};
