import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid2 as Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";
import type { Payment } from "../../../../types/api.types";
import {
  DashboardCard,
  StatusChip,
  ActionButton,
  EmptyStateContainer,
  CardContent as StyledCardContent,
} from "../../../../components/dashboard";
import { getElevatedShadow } from "../../../../theme/constants";

// Helper function to safely format date
const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Type guard to ensure payment has required properties
const isValidPayment = (payment: unknown): payment is Payment => {
  return (
    typeof payment === "object" &&
    payment !== null &&
    "id" in payment &&
    "amount" in payment &&
    "status" in payment &&
    "method" in payment &&
    "bookingId" in payment &&
    "createdAt" in payment
  );
};

// Helper function to calculate total amount with type safety
const calculateTotalAmount = (payments: Payment[]): number => {
  return payments.filter(isValidPayment).reduce((total, payment) => {
    const amount = typeof payment.amount === "number" ? payment.amount : 0;
    return total + amount;
  }, 0);
};

// Helper function to get payment method icon
const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case "credit_card":
      return <CreditCardIcon sx={{ fontSize: "1rem", mr: 0.5 }} />;
    case "paypal":
      return <AccountBalanceWalletIcon sx={{ fontSize: "1rem", mr: 0.5 }} />;
    case "bank_transfer":
      return <AccountBalanceIcon sx={{ fontSize: "1rem", mr: 0.5 }} />;
    default:
      return <PaymentIcon sx={{ fontSize: "1rem", mr: 0.5 }} />;
  }
};

interface PaymentsTabProps {
  payments: Payment[];
  isLoading: boolean;
  isError: boolean;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, isLoading, isError }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter payments based on search term and filters with type safety
  const filteredPayments = payments.filter((payment) => {
    if (!isValidPayment(payment)) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (typeof payment.method === "string" && payment.method.toLowerCase().includes(searchLower)) ||
      (typeof payment.status === "string" && payment.status.toLowerCase().includes(searchLower)) ||
      (typeof payment.amount === "number" && payment.amount.toString().includes(searchLower));

    const matchesMethod =
      methodFilter === null ||
      (typeof payment.method === "string" && payment.method.toLowerCase() === methodFilter.toLowerCase());

    const matchesStatus =
      statusFilter === null ||
      (typeof payment.status === "string" && payment.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Get unique methods and statuses for filter chips with type safety
  const uniqueMethods = [...new Set(payments.filter(isValidPayment).map((payment) => payment.method))];
  const uniqueStatuses = [...new Set(payments.filter(isValidPayment).map((payment) => payment.status))];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: "8px",
          boxShadow: getElevatedShadow(theme),
        }}
      >
        Failed to load your payments. Please try refreshing the page.
      </Alert>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyStateContainer>
        <Box sx={{ mb: 3 }}>
          <PaymentIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Payments Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            You haven't made any payments yet. Complete a booking to see your payment history here.
          </Typography>
        </Box>
        <ActionButton color="primary" variant="contained" size="large" onClick={() => void navigate("/booking")}>
          Book a Tour Now
        </ActionButton>
      </EmptyStateContainer>
    );
  }

  const totalAmount = calculateTotalAmount(payments);

  return (
    <Box>
      {/* Summary section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.light,
          borderRadius: "12px",
          p: 3,
          mb: 3,
          color: "white",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          ${totalAmount.toFixed(2)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Total amount across all payments
        </Typography>
      </Box>

      {/* Search and filter section */}
      <Box
        mb={3}
        sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "flex-start" }}
      >
        <TextField
          placeholder="Search payments..."
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
              sx: { borderRadius: "24px" },
            },
          }}
          sx={{ maxWidth: { sm: "300px" } }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ alignSelf: "center", mr: 1, display: "flex", alignItems: "center" }}
          >
            <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} /> Filter:
          </Typography>

          <Chip
            label="All"
            color={methodFilter === null && statusFilter === null ? "primary" : "default"}
            onClick={() => {
              setMethodFilter(null);
              setStatusFilter(null);
            }}
            sx={{ borderRadius: "16px" }}
          />

          {uniqueMethods.map((method) => (
            <Chip
              key={method}
              label={method.replace("_", " ")}
              color={methodFilter === method ? "primary" : "default"}
              onClick={() => {
                setMethodFilter(method === methodFilter ? null : method);
              }}
              sx={{ borderRadius: "16px" }}
            />
          ))}

          {uniqueStatuses.map((status) => (
            <Chip
              key={status}
              label={status}
              color={statusFilter === status ? "primary" : "default"}
              onClick={() => {
                setStatusFilter(status === statusFilter ? null : status);
              }}
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </Box>
      </Box>

      {filteredPayments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: "8px" }}>
          No payments match your filters.{" "}
          <Button
            size="small"
            onClick={() => {
              setSearchTerm("");
              setMethodFilter(null);
              setStatusFilter(null);
            }}
          >
            Clear filters
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPayments.map((payment) => {
            if (!isValidPayment(payment)) {
              return null;
            }

            return (
              <Grid size={{ xs: 12, md: 6 }} key={payment.id}>
                <DashboardCard>
                  <StyledCardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Box display="flex" alignItems="center">
                        <PaymentIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                        <Typography variant="h6" fontWeight="500">
                          Payment #{payment.id}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={payment.status}
                        color={
                          payment.status === "completed"
                            ? "success"
                            : payment.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          ${typeof payment.amount === "number" ? payment.amount.toFixed(2) : "0.00"}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        {getPaymentMethodIcon(payment.method)}
                        <Typography variant="body1">
                          Method: <strong>{payment.method.replace("_", " ")}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Booking ID: {payment.bookingId}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Date: {formatDateDisplay(payment.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </StyledCardContent>
                </DashboardCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
