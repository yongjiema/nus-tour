import { Refine } from "@refinedev/core";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import routerProvider from "@refinedev/react-router";
import { authProvider } from "./authProvider";
import { accessControlProvider } from "./accessControlProvider";
import { PublicHeader } from "./components/header/public";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import Login from "./pages/login";
import Register from "./pages/register";
import { Home } from "./pages/home";
import { Information, AcademicPrograms, BusRoutes, Canteens, ConvenienceStores } from "./pages/information";
import { BookingConfirmation } from "./pages/booking";
import { dataProviders } from "./dataProviders";
import { AdminRoute, UserRoute, AuthenticatedRoute } from "./components/AccessControlledRoute";
import { TestimonialsPage } from "./pages/testimonial";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UserDashboard from "./pages/dashboard/user";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import { AdminDashboard } from "./pages/dashboard/admin";
import { AdminBookingManagement } from "./pages/dashboard/admin/bookingManagement";
import { AdminCheckInManagement } from "./pages/dashboard/admin/checkInManagement";
import { ErrorBoundary } from "./components/shared/layout/ErrorBoundary";
import { usePageTitle } from "./hooks/usePageTitle";
import { ProfilePage } from "./pages/profile";
import DashboardRoot from "./pages/dashboard";

const RefineApp = () => {
  usePageTitle();

  return (
    <Refine
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      dataProvider={dataProviders}
      routerProvider={routerProvider}
      notificationProvider={useNotificationProvider}
      resources={[
        {
          name: "dashboard",
          list: "/admin",
          meta: {
            label: "Dashboard",
            icon: "🏠",
          },
        },
        {
          name: "bookings",
          list: "/admin/bookings",
          create: "/admin/bookings/create",
          edit: "/admin/bookings/edit/:id",
          meta: {
            label: "Bookings",
            icon: "📅",
          },
        },
        {
          name: "check-ins",
          list: "/admin/check-ins",
          meta: {
            label: "Check-ins",
            icon: "✅",
          },
        },
        {
          name: "users",
          list: "/admin/users",
          meta: {
            label: "Users",
            icon: "👥",
          },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        disableTelemetry: true,
        projectId: "nus-tour-dashboard",
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicHeader />}>
          <Route path="/" element={<Home />} />
          <Route path="/information" element={<Information />} />
          <Route path="/academic-programs" element={<AcademicPrograms />} />
          <Route path="/bus-routes" element={<BusRoutes />} />
          <Route path="/canteens" element={<Canteens />} />
          <Route path="/convenience-stores" element={<ConvenienceStores />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard root route - redirects based on role */}
        <Route element={<AuthenticatedRoute />}>
          <Route element={<PublicHeader />}>
            <Route path="/dashboard" element={<DashboardRoot />} />
          </Route>
        </Route>

        {/* Admin routes - separate admin layout with full sidebar */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookingManagement />} />
            <Route path="/admin/check-ins" element={<AdminCheckInManagement />} />
            {/* Add more admin routes as needed */}
          </Route>
        </Route>

        {/* User routes - clean layout without sidebar */}
        <Route element={<UserRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/u" element={<UserDashboard />} />
            <Route path="/u/profile" element={<ProfilePage />} />
            <Route path="/u/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
            {/* Add more user routes as needed */}
          </Route>
        </Route>
      </Routes>
    </Refine>
  );
};

function App() {
  return (
    <ColorModeContextProvider>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
      <RefineSnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{
          marginTop: "64px",
        }}
        maxSnack={3}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <ErrorBoundary>
              <RefineApp />
            </ErrorBoundary>
          </BrowserRouter>
        </LocalizationProvider>
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
}

export default App;
