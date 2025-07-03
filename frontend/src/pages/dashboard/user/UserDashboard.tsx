import React from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Tabs, Tab, Card } from "@mui/material";

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
import { PaymentsTab } from "./components/PaymentsTab";
import { FeedbackTab } from "./components/FeedbackTab";
import { BookingForm } from "../../booking";
import Checkin from "../../checkin";

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

const tabConfig = [
  { label: "Overview", icon: <HomeIcon />, value: "overview" },
  { label: "Book Tour", icon: <BookOnlineIcon />, value: "book-tour" },
  { label: "Payments", icon: <PaymentIcon />, value: "payments" },
  { label: "Check In", icon: <HowToRegIcon />, value: "check-in" },
  { label: "My Bookings", icon: <HistoryIcon />, value: "bookings" },
  { label: "Feedback", icon: <FeedbackIcon />, value: "feedback" },
];

export const UserDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL parameters, default to overview
  const activeTab = searchParams.get("tab") ?? "overview";
  const activeTabIndex = tabConfig.findIndex((tab) => tab.value === activeTab);
  const currentTabIndex = activeTabIndex >= 0 ? activeTabIndex : 0;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSearchParams({ tab: tabConfig[newValue].value });
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
          {tabConfig.map((tab, index) => (
            <Tab
              key={tab.value}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              id={`dashboard-tab-${index}`}
              aria-controls={`dashboard-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <TabPanel value={currentTabIndex} index={0}>
        <DashboardOverviewTab />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={1}>
        <BookingForm />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={2}>
        <PaymentsTab payments={[]} isLoading={false} isError={false} />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={3}>
        <Checkin />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={4}>
        <BookingsTab bookings={[]} isLoading={false} isError={false} onFeedbackClick={() => undefined} />
      </TabPanel>

      <TabPanel value={currentTabIndex} index={5}>
        <FeedbackTab
          feedbacks={[]}
          bookings={[]}
          isBookingsLoading={false}
          isFeedbacksLoading={false}
          isFeedbacksError={false}
          onFeedbackClick={() => undefined}
          onFeedbackSuccess={() => undefined}
        />
      </TabPanel>
    </Box>
  );
};
