import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import { Payment } from "../../../types/api.types";
import { formatDateDisplay } from "../../../utils/dateUtils";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DashboardCard, StatusChip, EmptyStateContainer, CardContent } from "./StyledComponents";

interface PaymentsTabProps {
  payments: Payment[];
  isLoading: boolean;
  isError: boolean;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, isLoading, isError }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Calculate total paid amount
  const totalPaid = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === null || payment.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter chips
  const uniqueStatuses = [...new Set(payments.map((payment) => payment.status))];

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
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        Failed to load payment information. Please try refreshing the page.
      </Alert>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyStateContainer>
        <Box sx={{ mb: 3 }}>
          <ReceiptIcon sx={{ fontSize: 64, color: "primary.light", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Payment Records
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            You don't have any payment records yet. Payments will appear here once you've made a booking.
          </Typography>
        </Box>
      </EmptyStateContainer>
    );
  }

  return (
    <Box>
      {/* Payment summary at the top */}
      <Box
        mb={4}
        p={2.5}
        sx={{
          backgroundColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
          borderRadius: "12px",
          border: "1px solid",
          borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Payment Summary
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <PaymentIcon sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Payments
                </Typography>
                <Typography variant="h6">{payments.length}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <AttachMoneyIcon sx={{ color: theme.palette.success.main, mr: 1.5 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Amount Paid
                </Typography>
                <Typography variant="h6">${totalPaid.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
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
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: "24px" },
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
            color={statusFilter === null ? "primary" : "default"}
            onClick={() => setStatusFilter(null)}
            sx={{ borderRadius: "16px" }}
          />

          {uniqueStatuses.map((status) => (
            <Chip
              key={status}
              label={status}
              color={statusFilter === status ? "primary" : "default"}
              onClick={() => setStatusFilter(status === statusFilter ? null : status)}
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </Box>
      </Box>

      {filteredPayments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: "8px" }}>
          No payments match your search. Try different search criteria.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPayments.map((payment: Payment) => (
            <Grid item xs={12} sm={6} key={payment.id}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Box display="flex" alignItems="center">
                      <ReceiptIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
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
                          : payment.status === "failed"
                          ? "error"
                          : "default"
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" flexDirection="column" gap={1} my={1.5}>
                    <Box display="flex" alignItems="center">
                      <AttachMoneyIcon sx={{ fontSize: "1.1rem", color: "text.secondary", mr: 1 }} />
                      <Typography variant="body1">
                        Amount: <strong>${Number(payment.amount).toFixed(2)}</strong>
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                      <Typography variant="body1">
                        Date: <strong>{formatDateDisplay(payment.createdAt)}</strong>
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <CreditCardIcon sx={{ fontSize: "1rem", color: "text.secondary", mr: 1 }} />
                      <Typography variant="body1">
                        Method: <strong>{payment.method}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {payment.bookingId && (
                    <Box mt={1} display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Booking Reference: #{payment.bookingId}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
