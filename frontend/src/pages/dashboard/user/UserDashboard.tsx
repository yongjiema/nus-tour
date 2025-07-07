import React from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Tabs, Tab, Card, Tooltip } from "@mui/material";
import { useList, useInvalidate } from "@refinedev/core";
import { useUserDashboardStats } from "../../../hooks";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HistoryIcon from "@mui/icons-material/History";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PaymentIcon from "@mui/icons-material/Payment";

// Components
import { DashboardOverviewTab } from "./components/DashboardOverviewTab";
import { BookingsTab } from "./components/BookingsTab";
import { PaymentTab } from "./components/PaymentTab";
import { FeedbackTab } from "./components/FeedbackTab";
import { CheckInTab } from "./components/CheckInTab";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import ReservationForm from "../../booking/ReservationForm";

// Types
import type { Booking } from "../../../types/api.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} id={`dashboard-tabpanel-${index}`} aria-labelledby={`dashboard-tab-${index}`}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

interface TabConfig {
  label: string;
  icon: React.ReactElement;
  value: string;
  disabled?: boolean;
}

const getTabConfig = (hasPendingPayments: boolean, hasBookingId: boolean): TabConfig[] => [
  { label: "Overview", icon: <HomeIcon />, value: "overview" },
  { label: "Book Tour", icon: <BookOnlineIcon />, value: "book-tour" },
  { label: "Payment", icon: <PaymentIcon />, value: "payment", disabled: !hasPendingPayments && !hasBookingId },
  { label: "Check In", icon: <HowToRegIcon />, value: "check-in" },
  { label: "My Bookings", icon: <HistoryIcon />, value: "bookings" },
  { label: "Feedback", icon: <FeedbackIcon />, value: "feedback" },
];

export const UserDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const invalidate = useInvalidate();

  // Fetch user dashboard stats to determine tab availability
  const { data: statsResponse, refetch: refetchStats } = useUserDashboardStats();
  const userStats = statsResponse?.data.data;
  const hasPendingPayments = (userStats?.pendingPayments ?? 0) > 0;
  const hasBookingId = !!searchParams.get("id"); // Check if there's a booking ID in URL

  // Generate tab configuration based on user stats
  const tabConfig = getTabConfig(hasPendingPayments, hasBookingId);

  // Get active tab from URL parameters, default to overview
  const activeTab = searchParams.get("tab") ?? "overview";
  const activeTabIndex = tabConfig.findIndex((tab) => tab.value === activeTab);

  // If the active tab is disabled (like payment with no pending payments), redirect to overview
  const currentTabIndex = activeTabIndex >= 0 && !tabConfig[activeTabIndex].disabled ? activeTabIndex : 0;

  // If we redirected to overview because the tab was disabled, update the URL
  React.useEffect(() => {
    if (activeTabIndex >= 0 && tabConfig[activeTabIndex].disabled && activeTab !== "overview") {
      setSearchParams({ tab: "overview" });
    }
  }, [activeTab, activeTabIndex, tabConfig, setSearchParams]);

  // Also redirect if user tries to access payment tab directly without pending payments
  // But allow access if there's a booking ID in the URL (for new reservations)
  React.useEffect(() => {
    const bookingId = searchParams.get("id");
    if (activeTab === "payment" && !hasPendingPayments && userStats && !bookingId) {
      console.log("Redirecting from payment tab to overview - no pending payments and no booking ID");
      setSearchParams({ tab: "overview" });
    }
  }, [activeTab, hasPendingPayments, userStats, searchParams, setSearchParams]);

  // Fetch user's bookings
  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useList<Booking>({
    resource: "bookings/user",
    meta: {
      select: "id,date,timeSlot,status,groupSize,deposit,createdAt,expiresAt",
    },
    queryOptions: {
      // Enable background refetching for better UX
      refetchOnWindowFocus: true,
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  });

  // Automatically refetch bookings when switching to bookings tab
  React.useEffect(() => {
    if (activeTab === "bookings") {
      void refetchBookings();
    }
  }, [activeTab, refetchBookings]);

  // Refetch stats when switching to overview or payment tabs
  React.useEffect(() => {
    if (activeTab === "overview" || activeTab === "payment") {
      void refetchStats();
    }
  }, [activeTab, refetchStats]);

  const bookings = bookingsData?.data ?? [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const targetTab = tabConfig[newValue];

    // Prevent navigation to disabled tabs
    if (targetTab.disabled) {
      // Optionally show a brief message or just ignore the click
      console.log(`Cannot navigate to ${targetTab.label} - feature is disabled`);
      return;
    }

    setSearchParams({ tab: targetTab.value });
  };

  return (
    <Box>
      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },
            "& .MuiTab-root": {
              minHeight: 72,
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "action.hover",
                transform: "translateY(-1px)",
              },
              "&.Mui-selected": {
                fontWeight: 600,
              },
            },
            // Center tabs on larger screens
            "@media (min-width: 900px)": {
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
              },
            },
          }}
        >
          {tabConfig.map((tab, index) => {
            const tabProps = {
              key: tab.value,
              icon: tab.icon,
              label: tab.label,
              iconPosition: "start" as const,
              id: `dashboard-tab-${index}`,
              "aria-controls": `dashboard-tabpanel-${index}`,
              disabled: tab.disabled,
              sx: {
                ...(tab.disabled && {
                  opacity: 0.5,
                  cursor: "not-allowed",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }),
              },
            };

            // For disabled payment tab, wrap in Tooltip
            if (tab.disabled && tab.value === "payment") {
              return (
                <Tooltip
                  key={tab.value}
                  title={
                    hasBookingId
                      ? "Complete your reservation to access payment"
                      : "No pending payments. Complete a booking first to access payment options."
                  }
                  arrow
                >
                  <div style={{ display: "inline-block" }}>
                    <Tab {...tabProps} disabled={true} />
                  </div>
                </Tooltip>
              );
            }

            // Regular tab without tooltip
            return <Tab {...tabProps} />;
          })}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <TabPanel value={currentTabIndex} index={0}>
        <ErrorBoundary>
          <DashboardOverviewTab />
        </ErrorBoundary>
      </TabPanel>

      <TabPanel value={currentTabIndex} index={1}>
        <ReservationForm />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={2}>
        <PaymentTab />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={3}>
        <CheckInTab bookings={bookings} isLoading={isBookingsLoading} isError={isBookingsError} />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={4}>
        <BookingsTab
          bookings={bookings}
          isLoading={isBookingsLoading}
          isError={isBookingsError}
          onFeedbackClick={() => undefined}
          invalidateQueries={() => {
            void invalidate({
              resource: "bookings/user",
              invalidates: ["list"],
            });
            // Also invalidate dashboard stats as cancelling might affect stats
            void invalidate({
              resource: "dashboard/user",
              invalidates: ["list"],
            });
          }}
        />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={5}>
        <FeedbackTab
          feedbacks={[]}
          bookings={bookings}
          isBookingsLoading={isBookingsLoading}
          isFeedbacksLoading={false}
          isFeedbacksError={false}
          onFeedbackClick={() => undefined}
          onFeedbackSuccess={() => undefined}
        />
      </TabPanel>
    </Box>
  );
};
