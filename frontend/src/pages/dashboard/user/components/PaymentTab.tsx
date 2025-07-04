import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  styled,
} from "@mui/material";
import {
  Timer as TimerIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { useBookingSession } from "../../../../hooks/useBookingSession";
import { useConfirmReservation } from "../../../../hooks/useReservation";
import { useCustomMutation, useOne } from "@refinedev/core";
import { BookingStatus } from "../../../../types/enums";
import { DashboardCard, ActionButton, CardContent as StyledCardContent } from "../../../../components/dashboard";

// Styled components
const PaymentMethodCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: `2px solid ${theme.palette.divider}`,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
  },
  "&.selected": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "10",
  },
}));

const QRContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: "8px",
}));

// Types
interface PaymentMethod {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface BookingData {
  id: number;
  status: string;
  expiresAt: string | null;
  groupSize: number;
  date: string;
  timeSlot: string;
  deposit: number;
}

export const PaymentTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const bookingId = searchParams.get("id");
  const [selectedMethod, setSelectedMethod] = useState<string>("paynow");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  // Booking session management
  const { reservation, timeRemaining, isExpired, clearReservation, saveReservation } = useBookingSession();
  const { mutate: confirmReservation } = useConfirmReservation();

  // Fallback: fetch booking data if no session exists
  const { data: bookingData, isLoading: isLoadingBooking } = useOne({
    resource: "bookings",
    id: bookingId ?? "",
    queryOptions: {
      enabled: !reservation && !!bookingId,
    },
  });

  // Payment completion mutation
  const { mutate: completePayment, isPending: isPaymentPending } = useCustomMutation();

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      value: "paynow",
      label: "PayNow",
      icon: <WalletIcon />,
      description: "Instant payment via QR code",
    },
    {
      value: "credit_card",
      label: "Credit Card",
      icon: <CreditCardIcon />,
      description: "Visa, MasterCard, AMEX accepted",
    },
  ];

  // Check if reservation exists and is valid
  useEffect(() => {
    // If we have booking data from API but no session, create one
    if (!reservation && bookingData?.data && bookingData.data.status === "slot_reserved") {
      const booking = bookingData.data as BookingData;

      // Handle null expiresAt from backend
      let validExpiresAt = booking.expiresAt;
      if (!validExpiresAt) {
        console.warn("Backend returned null expiresAt, creating new expiration time");
        const newExpiresAt = new Date();
        newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 15); // 15 minutes from now
        validExpiresAt = newExpiresAt.toISOString();
      }

      saveReservation({
        bookingId: String(booking.id),
        expiresAt: validExpiresAt,
        groupSize: booking.groupSize,
        date: booking.date,
        timeSlot: booking.timeSlot,
        deposit: booking.deposit,
      });
      return;
    }

    if (!reservation || !bookingId) {
      // If still no reservation after trying to fetch, redirect to book tour
      if (!isLoadingBooking) {
        setSearchParams({ tab: "book-tour" });
      }
      return;
    }

    if (reservation.bookingId !== bookingId) {
      setSearchParams({ tab: "book-tour" });
      return;
    }

    if (isExpired) {
      setError("Your reservation has expired. Please make a new booking.");
      setTimeout(() => {
        clearReservation();
        setSearchParams({ tab: "book-tour" });
      }, 3000);
    }
  }, [
    reservation,
    bookingId,
    isExpired,
    setSearchParams,
    clearReservation,
    bookingData,
    isLoadingBooking,
    saveReservation,
  ]);

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod(event.target.value);
    setShowQR(false);
  };

  const handleProceedToPayment = () => {
    if (selectedMethod === "paynow") {
      setShowQR(true);
    } else {
      setError("This payment method is not yet implemented.");
    }
  };

  const handlePaymentComplete = () => {
    if (!reservation) return;

    setIsProcessing(true);

    // First confirm the reservation (convert from SLOT_RESERVED to AWAITING_PAYMENT)
    confirmReservation(reservation.bookingId, {
      onSuccess: () => {
        // Then mark payment as completed
        completePayment(
          {
            url: `bookings/${reservation.bookingId}/payment-status`,
            method: "post",
            values: {
              status: BookingStatus.CONFIRMED,
              transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            },
          },
          {
            onSuccess: () => {
              clearReservation();
              setSearchParams({ tab: "bookings" });
            },
            onError: () => {
              setError("Payment confirmation failed. Please contact support.");
              setIsProcessing(false);
            },
          },
        );
      },
      onError: () => {
        setError("Failed to confirm reservation. Please try again.");
        setIsProcessing(false);
      },
    });
  };

  // Loading state
  if (!reservation && isLoadingBooking) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // No reservation found
  if (!reservation) {
    return (
      <DashboardCard>
        <StyledCardContent>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <PaymentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Active Payment Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
              You don't have any reservations that require payment at the moment. Make a booking first, then return here
              to complete your payment.
            </Typography>
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => {
                setSearchParams({ tab: "book-tour" });
              }}
              startIcon={<PaymentIcon />}
            >
              Book a Tour
            </ActionButton>
          </Box>
        </StyledCardContent>
      </DashboardCard>
    );
  }

  return (
    <Box>
      {/* Countdown Alert */}
      <Alert severity="warning" icon={<TimerIcon />} sx={{ mb: 3 }}>
        <Typography variant="h6" component="div">
          Complete Payment in: {formatTimeRemaining(timeRemaining)}
        </Typography>
        <Typography variant="body2">Your slot is reserved. Complete payment before the timer expires.</Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Booking Summary */}
      <DashboardCard sx={{ mb: 3 }}>
        <StyledCardContent>
          <Typography variant="h6" gutterBottom>
            Booking Summary
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label={`Date: ${new Date(reservation.date).toLocaleDateString()}`} variant="outlined" />
            <Chip label={`Time: ${reservation.timeSlot}`} variant="outlined" />
            <Chip label={`Group Size: ${reservation.groupSize}`} variant="outlined" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Total Amount:</Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              SGD {reservation.deposit}
            </Typography>
          </Box>
        </StyledCardContent>
      </DashboardCard>

      {/* Payment Method Selection */}
      <DashboardCard sx={{ mb: 3 }}>
        <StyledCardContent>
          <Typography variant="h6" gutterBottom>
            Select Payment Method
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selectedMethod} onChange={handlePaymentMethodChange}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.value}
                    className={selectedMethod === method.value ? "selected" : ""}
                    onClick={() => {
                      setSelectedMethod(method.value);
                    }}
                  >
                    <CardContent>
                      <FormControlLabel
                        value={method.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {method.icon}
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {method.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: "100%", m: 0 }}
                      />
                    </CardContent>
                  </PaymentMethodCard>
                ))}
              </Box>
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            {!showQR ? (
              <ActionButton
                variant="contained"
                size="large"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                startIcon={<PaymentIcon />}
              >
                Proceed to Payment
              </ActionButton>
            ) : (
              <Box>
                <QRContainer>
                  <Typography variant="h6" gutterBottom>
                    Scan QR Code to Pay
                  </Typography>
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      backgroundColor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      QR Code Here
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                    Amount: SGD {reservation.deposit}
                  </Typography>
                </QRContainer>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <ActionButton
                    variant="contained"
                    color="success"
                    onClick={handlePaymentComplete}
                    disabled={isProcessing || isPaymentPending}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                  >
                    {isProcessing ? "Processing..." : "I've Made Payment"}
                  </ActionButton>

                  <ActionButton
                    variant="outlined"
                    onClick={() => {
                      setShowQR(false);
                    }}
                    disabled={isProcessing}
                  >
                    Back
                  </ActionButton>
                </Box>
              </Box>
            )}
          </Box>
        </StyledCardContent>
      </DashboardCard>
    </Box>
  );
};
