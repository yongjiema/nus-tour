import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  styled,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent,
  Grid2 as Grid,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { usePayment } from "../../hooks/usePayment";
import { ActionButton } from "../../components/shared/ui";
import { useCustomMutation } from "@refinedev/core";
import { BookingStatus } from "../../types/enums";
import { PublicHeader } from "../../components/header/public";

// Constants
const SESSION_DURATION = 300; // 5 minutes in seconds
const DEFAULT_AMOUNT = 50;
const STORAGE_KEYS = {
  BOOKING_DATA: "booking-data",
  PAYMENT_CONFIRMATION: "payment_confirmation",
} as const;
const TRANSACTION_PREFIXES = {
  EXPIRED: "EXPIRED",
  SUCCESS: "TXN",
} as const;

// Styled components
const PaymentContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const PaymentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: "12px",
  boxShadow: theme.shadows[4],
}));

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

const QRImage = styled("img")(({ theme }) => ({
  width: "200px",
  height: "200px",
  marginTop: "16px",
  border: `1px solid ${theme.palette.divider}`,
}));

// Types
interface BookingData {
  id: string;
  amount: number;
}

interface PaymentMethod {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface StoredBookingData {
  id?: string;
  bookingId?: string;
  deposit?: number;
  amount?: number;
}

interface PaymentConfirmation {
  bookingId: string;
  amount: number;
  date: string;
  transactionId: string;
}

interface LocationState {
  booking?: StoredBookingData;
}

// Payment methods configuration
const paymentMethods: PaymentMethod[] = [
  {
    value: "paynow",
    label: "PayNow",
    icon: <WalletIcon />,
    description: "Fast and secure QR code payment",
  },
  {
    value: "credit_card",
    label: "Credit Card",
    icon: <CreditCardIcon />,
    description: "Visa, Mastercard, American Express",
  },
];

// Utility functions
const parseBookingData = (data: unknown): BookingData | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const parsed = data as StoredBookingData;
  const id = parsed.id ?? parsed.bookingId;
  const amount = parsed.deposit ?? parsed.amount ?? DEFAULT_AMOUNT;

  if (!id || typeof id !== "string" || typeof amount !== "number" || amount <= 0) {
    return null;
  }

  return { id, amount };
};

const loadBookingDataFromStorage = (): BookingData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as unknown;
    return parseBookingData(parsed);
  } catch (error) {
    console.error("Failed to parse booking data from localStorage:", error);
    return null;
  }
};

const savePaymentConfirmation = (confirmation: PaymentConfirmation): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIRMATION, JSON.stringify(confirmation));
  } catch (error) {
    console.error("Failed to save payment confirmation:", error);
  }
};

const generateTransactionId = (prefix: string): string => {
  return `${prefix}-${Date.now()}`;
};

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { processPayment, isProcessing } = usePayment();
  const { mutate: updateBookingStatus } = useCustomMutation();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("paynow");
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load booking data from multiple sources
  useEffect(() => {
    const loadBookingData = (): void => {
      // 1. Try location.state first
      const locationState = location.state as LocationState | null;
      if (locationState?.booking) {
        const parsed = parseBookingData(locationState.booking);
        if (parsed) {
          setBookingData(parsed);
          setLoading(false);
          return;
        }
      }

      // 2. Try localStorage as fallback
      const storedData = loadBookingDataFromStorage();
      if (storedData) {
        setBookingData(storedData);
      }

      setLoading(false);
    };

    loadBookingData();
  }, [location.state]);

  // Session timer logic
  useEffect(() => {
    if (sessionExpired || loading) {
      return;
    }

    if (timeLeft <= 0) {
      setSessionExpired(true);

      // Mark booking as PAYMENT_FAILED
      if (bookingData?.id) {
        const transactionId = generateTransactionId(TRANSACTION_PREFIXES.EXPIRED);

        updateBookingStatus(
          {
            url: `bookings/${bookingData.id}/payment-status`,
            method: "post",
            values: {
              status: BookingStatus.PAYMENT_FAILED,
              transactionId,
            },
          },
          {
            onSuccess: () => {
              console.log("Booking marked as payment failed due to session expiry");
            },
            onError: (error) => {
              console.error("Failed to update booking status on session expiry:", error);
            },
          },
        );
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeLeft, sessionExpired, bookingData, loading, updateBookingStatus]);

  const handlePaymentMethodChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod(event.target.value);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!bookingData) {
      setError("No booking data available");
      return;
    }

    setError("");

    try {
      // 1. Process payment
      processPayment({
        bookingId: bookingData.id,
        amount: bookingData.amount,
        paymentMethod: selectedMethod,
      });

      // 2. Update booking status to PAID
      const transactionId = generateTransactionId(TRANSACTION_PREFIXES.SUCCESS);

      // Use Promise wrapper for the mutation
      await new Promise<void>((resolve, reject) => {
        updateBookingStatus(
          {
            url: `bookings/${bookingData.id}/payment-status`,
            method: "post",
            values: {
              status: BookingStatus.PAID,
              transactionId,
            },
          },
          {
            onSuccess: () => {
              resolve();
            },
            onError: (error) => {
              reject(error instanceof Error ? error : new Error(JSON.stringify(error) || "Unknown error"));
            },
          },
        );
      });

      // 3. Store confirmation and navigate
      const confirmation: PaymentConfirmation = {
        bookingId: bookingData.id,
        amount: bookingData.amount,
        date: new Date().toISOString(),
        transactionId,
      };

      savePaymentConfirmation(confirmation);
      void navigate(`/payment/success/${bookingData.id}`);
    } catch (err) {
      console.error("Payment processing failed:", err);
      setError("Payment processing failed. Please try again or contact support.");
    }
  }, [bookingData, selectedMethod, processPayment, updateBookingStatus, navigate]);

  const handleBackToBooking = useCallback(() => {
    void navigate("/booking");
  }, [navigate]);

  // Wrapper function to handle async payment properly
  const handlePaymentClick = useCallback(() => {
    void handlePayment().catch((error: unknown) => {
      console.error("Payment failed:", error);
    });
  }, [handlePayment]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Memoized values
  const isTimerWarning = useMemo(() => timeLeft < 60, [timeLeft]);
  const formattedAmount = useMemo(() => bookingData?.amount.toFixed(2) ?? "0.00", [bookingData?.amount]);

  if (loading) {
    return (
      <>
        <PublicHeader />
        <PaymentContainer maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Loading payment information...
            </Typography>
          </Paper>
        </PaymentContainer>
      </>
    );
  }

  if (!bookingData) {
    return (
      <>
        <PublicHeader />
        <PaymentContainer maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="error" gutterBottom>
              Missing or invalid booking details. Please try again.
            </Typography>
            <Button variant="contained" onClick={handleBackToBooking} sx={{ mt: 2 }}>
              Return to Booking
            </Button>
          </Paper>
        </PaymentContainer>
      </>
    );
  }

  if (sessionExpired) {
    return (
      <>
        <PublicHeader />
        <PaymentContainer maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" color="error" gutterBottom>
              Your payment session has expired
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please restart the booking process to try again.
            </Typography>
            <Button variant="contained" onClick={handleBackToBooking}>
              Return to Booking
            </Button>
          </Paper>
        </PaymentContainer>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <PaymentContainer maxWidth="md">
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Complete Your Payment
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Timer display */}
        <Box sx={{ mb: 2, textAlign: "center", color: isTimerWarning ? "error.main" : "text.secondary" }}>
          <Typography variant="subtitle1">Session expires in: {formatTime(timeLeft)}</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Payment Summary */}
          <Grid size={{ xs: 12, md: 6 }}>
            <PaymentCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PaymentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Payment Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Booking ID
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {bookingData.id}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Amount to Pay
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    SGD {formattedAmount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This is a deposit payment for your tour booking.
                  </Typography>
                </Box>
              </CardContent>
            </PaymentCard>
          </Grid>

          {/* Payment Method Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <PaymentCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Payment Method
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup value={selectedMethod} onChange={handlePaymentMethodChange}>
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.value}
                        className={selectedMethod === method.value ? "selected" : ""}
                        sx={{ mb: 2 }}
                      >
                        <CardContent>
                          <FormControlLabel
                            value={method.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                  <Box sx={{ mr: 2, color: "primary.main" }}>{method.icon}</Box>
                                  <Box>
                                    <Typography variant="h6" fontWeight="500">
                                      {method.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {method.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            }
                            sx={{ width: "100%", margin: 0 }}
                          />
                        </CardContent>
                      </PaymentMethodCard>
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </PaymentCard>
          </Grid>
        </Grid>

        {/* PayNow QR code if selected */}
        {selectedMethod === "paynow" && (
          <QRContainer>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
              Scan the QR code to complete payment
            </Typography>
            <QRImage src="https://placehold.co/200x200?text=PayNow+QR" alt="PayNow QR Code" />
          </QRContainer>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Button variant="outlined" onClick={handleBackToBooking} disabled={isProcessing} sx={{ minWidth: 150 }}>
            Back to Booking
          </Button>
          <ActionButton
            variant="contained"
            onClick={handlePaymentClick}
            disabled={isProcessing || !selectedMethod}
            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
            sx={{ minWidth: 200 }}
          >
            {isProcessing ? "Processing..." : `Pay SGD ${formattedAmount}`}
          </ActionButton>
        </Box>

        {/* Security Notice */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            🔒 Your payment information is secure and encrypted
          </Typography>
        </Box>
      </PaymentContainer>
    </>
  );
};

export default PaymentPage;
