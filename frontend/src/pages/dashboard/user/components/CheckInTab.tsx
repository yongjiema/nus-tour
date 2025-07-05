import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid2 as Grid,
  Paper,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import QRCodeIcon from "@mui/icons-material/QrCode";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import EmailIcon from "@mui/icons-material/Email";
import { useGetIdentity } from "@refinedev/core";
import QRCode from "qrcode";
import type { Booking } from "../../../../types/api.types";
import { BookingStatus } from "../../../../types/enums";

// Styled components
const QRContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  border: `2px solid ${theme.palette.divider}`,
}));

const BookingCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

// Helper function to safely format date
const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Helper function to get status color
const getStatusColor = (status: BookingStatus): "success" | "primary" | "warning" | "default" => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "success";
    case BookingStatus.CHECKED_IN:
      return "primary";
    case BookingStatus.COMPLETED:
      return "success";
    default:
      return "default";
  }
};

// Type guard to ensure booking has required properties
const isValidBooking = (booking: unknown): booking is Booking => {
  return (
    typeof booking === "object" &&
    booking !== null &&
    "id" in booking &&
    "date" in booking &&
    "timeSlot" in booking &&
    "status" in booking &&
    "groupSize" in booking
  );
};

// Helper function to check if booking is eligible for check-in
const canCheckIn = (booking: Booking): boolean => {
  const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED];
  return allowedStatuses.includes(booking.status as BookingStatus);
};

// Helper function to check if booking is today
const isBookingToday = (dateString: string): boolean => {
  try {
    const bookingDate = new Date(dateString);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

interface CheckInTabProps {
  bookings: Booking[];
  isLoading: boolean;
  isError: boolean;
}

export const CheckInTab: React.FC<CheckInTabProps> = ({ bookings, isLoading, isError }) => {
  const { data: user } = useGetIdentity<{ email?: string }>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState<string>("");

  // Filter bookings that are eligible for check-in
  const checkInEligibleBookings = bookings.filter((booking) => {
    if (!isValidBooking(booking)) return false;
    return canCheckIn(booking);
  });

  // Generate QR code when a booking is selected
  useEffect(() => {
    if (selectedBooking && user?.email) {
      setIsGeneratingQR(true);
      setQrError("");

      // Create QR code data with booking ID and email
      const qrData = JSON.stringify({
        bookingId: selectedBooking.id.toString(),
        email: user.email,
        type: "checkin",
        generated: new Date().toISOString(),
      });

      QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((error: unknown) => {
          console.error("Error generating QR code:", error);
          setQrError("Failed to generate QR code. Please try again.");
        })
        .finally(() => {
          setIsGeneratingQR(false);
        });
    }
  }, [selectedBooking, user?.email]);

  const handleCloseDialog = () => {
    setSelectedBooking(null);
    setQrCodeUrl("");
    setQrError("");
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load bookings. Please try refreshing the page.
      </Alert>
    );
  }

  if (checkInEligibleBookings.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <EventAvailableIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Check-in Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You don't have any confirmed bookings that require check-in at this time.
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
          <Typography variant="body2">
            Check-in is available for confirmed bookings. Once you have a confirmed booking, you can generate a QR code
            here for easy check-in at the tour location.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Check-in for Your Tours
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Select a booking below to generate your check-in QR code. Show this QR code to the tour guide for quick
          check-in at the tour location.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {checkInEligibleBookings.map((booking) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking.id}>
            <BookingCard
              onClick={() => {
                setSelectedBooking(booking);
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Booking #{booking.id}
                  </Typography>
                  <Chip
                    label={booking.status.replace("_", " ").toUpperCase()}
                    color={getStatusColor(booking.status as BookingStatus)}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <EventAvailableIcon sx={{ fontSize: "1rem", mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDateDisplay(booking.date)}
                  </Typography>
                  {isBookingToday(booking.date) && <Chip label="TODAY" color="primary" size="small" sx={{ ml: 1 }} />}
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTimeIcon sx={{ fontSize: "1rem", mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {booking.timeSlot}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon sx={{ fontSize: "1rem", mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Group Size: {booking.groupSize}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<QRCodeIcon />}
                  fullWidth
                  sx={{ fontWeight: 600 }}
                  disabled={(booking.status as BookingStatus) === BookingStatus.COMPLETED}
                >
                  {(booking.status as BookingStatus) === BookingStatus.COMPLETED ? "Completed" : "Generate QR Code"}
                </Button>
              </CardContent>
            </BookingCard>
          </Grid>
        ))}
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedBooking} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <QRCodeIcon sx={{ mr: 1 }} />
            Check-in QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Show this QR code to the tour guide for quick check-in. The QR code contains your booking ID and email
                  for verification.
                </Typography>
              </Alert>

              {/* Booking Details */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Booking Details
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {formatDateDisplay(selectedBooking.date)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedBooking.timeSlot}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Group Size:</strong> {selectedBooking.groupSize}
                  </Typography>
                  {user?.email && (
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {user.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              <Divider sx={{ mb: 3 }} />

              {/* QR Code */}
              <QRContainer>
                {isGeneratingQR ? (
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Generating QR code...
                    </Typography>
                  </Box>
                ) : qrError ? (
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {qrError}
                  </Alert>
                ) : qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="Check-in QR Code" style={{ marginBottom: 16 }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Scan this QR code with the tour guide's device
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unable to generate QR code
                  </Typography>
                )}
              </QRContainer>

              {/* Manual Check-in Info */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  For Manual Check-in:
                </Typography>
                <Typography variant="body2">
                  If QR scanning is not available, provide these details to the tour guide:
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "grey.100",
                    borderRadius: 1,
                    fontFamily: "monospace",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Booking ID: {selectedBooking.id}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Email: {user?.email}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Show this information to the tour guide for manual check-in
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
